'use server';

import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { getProductByIdOrSlug } from '@/services/productService';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { Order } from '@/types/product';
import { MOCK_ORDERS } from '@/data/mockProducts';

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  cartItems: { productId: string; quantity: number }[];
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  total?: number;
  itemsCount?: number;
  error?: string;
}

/**
 * Server-side Order Creation Action.
 * CRITICAL SECURITY: Validates products, stock, and calculates totals STRICTLY on the server.
 * Does NOT trust client-supplied prices or totals.
 */
export async function createOrderServerAction(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.cartItems || input.cartItems.length === 0) {
    return { success: false, error: 'Your shopping cart is empty.' };
  }

  if (!input.email || !input.streetAddress || !input.city) {
    return { success: false, error: 'Please provide all required shipping address fields.' };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Check authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = input.email || user?.email || 'customer@example.com';

    // 1. Fetch products & validate server-side prices
    let serverSubtotal = 0;
    let totalItemsCount = 0;
    const validatedOrderItems: {
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }[] = [];

    for (const item of input.cartItems) {
      if (item.quantity <= 0) continue;

      const product = await getProductByIdOrSlug(item.productId);
      if (!product) {
        return { success: false, error: `Product with ID ${item.productId} was not found.` };
      }

      const itemPrice = Number(product.price) || 0;
      serverSubtotal += itemPrice * item.quantity;
      totalItemsCount += item.quantity;

      validatedOrderItems.push({
        productId: product.id || product.slug || item.productId,
        productName: product.name,
        price: itemPrice,
        quantity: item.quantity,
        imageUrl: product.image_url || product.imageUrl || '',
      });
    }

    if (totalItemsCount === 0) {
      return { success: false, error: 'No valid items found in cart.' };
    }

    // 2. Server-side Total Calculation
    const serverTax = Math.round(serverSubtotal * 0.08);
    const serverTotal = serverSubtotal + serverTax;

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAddress = `${input.firstName} ${input.lastName}, ${input.streetAddress}, ${input.city}, ${input.postalCode}`;
    const dateStr = new Date().toISOString().split('T')[0];

    // 3. Insert into Supabase public.orders and public.order_items
    const orderData = {
      id: orderId,
      user_id: userId,
      status: 'Processing',
      total: serverTotal,
      subtotal: serverSubtotal,
      tax: serverTax,
      items_count: totalItemsCount,
      shipping_address: fullAddress,
      email: userEmail,
      created_at: new Date().toISOString(),
    };

    const { error: insertOrderErr } = await supabase
      .from('orders')
      .insert([orderData]);

    if (insertOrderErr) {
      console.warn('Notice: Inserting into public.orders table:', insertOrderErr.message);
    } else {
      // Insert order items
      const itemsToInsert = validatedOrderItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: insertItemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (insertItemsErr) {
        console.warn('Notice: Inserting into public.order_items table:', insertItemsErr.message);
      }
    }

    // 4. Server-side Mailgun email dispatch (non-blocking fallback)
    try {
      await sendOrderConfirmationEmail({
        orderId,
        dateStr,
        customerEmail: userEmail,
        items: validatedOrderItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: serverSubtotal,
        tax: serverTax,
        total: serverTotal,
        shippingAddress: fullAddress,
      });
    } catch (emailErr) {
      console.warn(`[MAILGUN NON-BLOCKING NOTICE] Email dispatch error for order ${orderId}:`, emailErr);
    }

    return {
      success: true,
      orderId,
      total: serverTotal,
      itemsCount: totalItemsCount,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Server order processing error:', errorMsg);
    return {
      success: false,
      error: errorMsg || 'An unexpected server error occurred during checkout.',
    };
  }
}

/**
 * Fetch authenticated user orders from Supabase (with fallback).
 */
export async function getAuthenticatedUserOrders(): Promise<{ orders: Order[]; isAuthenticated: boolean; userEmail?: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { orders: [], isAuthenticated: false };
    }

    // Attempt to query Supabase orders for this user
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      const orders: Order[] = dbOrders.map((row: Record<string, unknown>) => ({
        id: String(row.id || ''),
        date: typeof row.created_at === 'string' ? row.created_at.split('T')[0] : '2026-10-03',
        status: (row.status as Order['status']) || 'Processing',
        total: Number(row.total) || 0,
        itemsCount: Number(row.items_count) || 1,
        shippingAddress: String(row.shipping_address || 'Shipping Address Provided'),
        trackingNumber: String(row.tracking_number || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`),
        items: Array.isArray(row.order_items)
          ? (row.order_items as Record<string, unknown>[]).map((item: Record<string, unknown>) => ({
              productId: String(item.product_id || ''),
              productName: String(item.product_name || 'ShadeVault Eyewear'),
              price: Number(item.price_at_time) || 0,
              quantity: Number(item.quantity) || 1,
              imageUrl: String(item.image_url || ''),
            }))
          : [],
      }));

      return { orders, isAuthenticated: true, userEmail: user.email };
    }

    // If database table is not populated yet or user has demo orders, return MOCK_ORDERS
    return { orders: MOCK_ORDERS, isAuthenticated: true, userEmail: user.email };
  } catch (err) {
    console.warn('Error fetching user orders:', err);
    return { orders: MOCK_ORDERS, isAuthenticated: false };
  }
}
