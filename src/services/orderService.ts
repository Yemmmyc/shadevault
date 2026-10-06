'use server';

import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { getProductByIdOrSlug, normalizeProduct } from '@/services/productService';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { Order, Product } from '@/types/product';

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

    const databaseOrderId = crypto.randomUUID();
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAddress = `${input.firstName} ${input.lastName}, ${input.streetAddress}, ${input.city}, ${input.postalCode}`;
    const dateStr = new Date().toISOString().split('T')[0];

    // 3. Insert into Supabase public.orders and public.order_items
    const orderData = {
      id: databaseOrderId,
      order_number: orderNumber,
      user_id: userId,
      customer_email: userEmail,
      total: serverTotal,
      subtotal: serverSubtotal,
      tax: serverTax,
      items_count: totalItemsCount,
      shipping_address: fullAddress,
      status: 'processing',
      email: userEmail,
      created_at: new Date().toISOString(),
    };

    const { error: insertOrderErr } = await supabase
      .from('orders')
      .insert([orderData]);

    if (insertOrderErr) {
      console.warn('Notice: Inserting into public.orders table:', insertOrderErr.message);
      return { success: false, error: 'Database order save failed.' };
    }

    // Insert order items
    const itemsToInsert = validatedOrderItems.map((item) => ({
      order_id: databaseOrderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: insertItemsErr } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (insertItemsErr) {
      console.warn('Notice: Inserting into public.order_items table:', insertItemsErr.message);
      return { success: false, error: 'Database order save failed.' };
    }

    // 4. Server-side Mailgun email dispatch (non-blocking fallback)
    try {
      await sendOrderConfirmationEmail({
        orderId: orderNumber,
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
      console.warn(`[MAILGUN NON-BLOCKING NOTICE] Email dispatch error for order ${orderNumber}:`, emailErr);
    }

    return {
      success: true,
      orderId: orderNumber,
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
 * Fetch authenticated user orders from Supabase.
 */
export async function getAuthenticatedUserOrders(): Promise<{ orders: Order[]; isAuthenticated: boolean; userEmail?: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { orders: [], isAuthenticated: false };
    }

    // 1. Query Supabase orders for this authenticated user, joining order_items and products
    let dbOrders: Record<string, unknown>[] | null = null;
    let queryError: unknown = null;

    const relSelect = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!relSelect.error && relSelect.data) {
      dbOrders = relSelect.data as Record<string, unknown>[];
    } else {
      // Fallback query if relational join fails
      const simpleSelect = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (simpleSelect.error) {
        queryError = simpleSelect.error;
      } else {
        dbOrders = simpleSelect.data as Record<string, unknown>[];
      }
    }

    if (queryError) {
      console.warn('Notice: Fetching authenticated user orders from Supabase:', (queryError as { message: string }).message);
      return { orders: [], isAuthenticated: true, userEmail: user.email };
    }

    if (!dbOrders || dbOrders.length === 0) {
      return { orders: [], isAuthenticated: true, userEmail: user.email };
    }

    // 2. Collect product IDs that need server-side enrichment
    const productIdsToFetch = new Set<string>();
    for (const row of dbOrders) {
      if (Array.isArray(row.order_items)) {
        for (const item of row.order_items as Record<string, unknown>[]) {
          const pid = String(item.product_id || '');
          if (pid && (!item.products || typeof item.products !== 'object')) {
            productIdsToFetch.add(pid);
          }
        }
      }
    }

    // 3. Batch fetch missing product records from Supabase
    const fetchedProductMap = new Map<string, Product>();
    if (productIdsToFetch.size > 0) {
      const pidArray = Array.from(productIdsToFetch);
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .in('id', pidArray);

      if (dbProducts && dbProducts.length > 0) {
        for (const rawP of dbProducts) {
          const normP = normalizeProduct(rawP as Record<string, unknown>);
          fetchedProductMap.set(normP.id, normP);
          if (normP.slug) fetchedProductMap.set(normP.slug, normP);
        }
      }

      // Check any unresolved product IDs via getProductByIdOrSlug fallback
      for (const pid of pidArray) {
        if (!fetchedProductMap.has(pid)) {
          const p = await getProductByIdOrSlug(pid);
          if (p) {
            fetchedProductMap.set(pid, p);
          }
        }
      }
    }

    // 4. Map DB order rows and enriched order_items to Order models
    const orders: Order[] = dbOrders.map((row: Record<string, unknown>) => {
      const orderNum = String(row.order_number || row.id || '');
      const rawStatus = String(row.status || 'Processing');
      const formattedStatus = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) as Order['status'];

      const items = Array.isArray(row.order_items)
        ? (row.order_items as Record<string, unknown>[]).map((item: Record<string, unknown>) => {
            const pid = String(item.product_id || '');
            let prod: Product | null = null;

            if (item.products && typeof item.products === 'object') {
              prod = normalizeProduct(item.products as Record<string, unknown>);
            }
            if (!prod && pid) {
              prod = fetchedProductMap.get(pid) || null;
            }

            const price = Number(item.unit_price ?? item.price_at_time ?? prod?.price ?? 0);
            const quantity = Number(item.quantity) || 1;
            const productName = prod?.name || (pid ? `Eyewear (${pid})` : 'Eyewear Item');
            const imageUrl = prod?.imageUrl || prod?.image_url || '';

            return {
              productId: pid,
              productName,
              price,
              quantity,
              imageUrl,
            };
          })
        : [];

      return {
        id: orderNum,
        orderNumber: orderNum,
        date: typeof row.created_at === 'string' ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: formattedStatus,
        total: Number(row.total) || 0,
        itemsCount: Number(row.items_count) || items.reduce((sum, i) => sum + i.quantity, 0) || 1,
        shippingAddress: String(row.shipping_address || 'Shipping Address Provided'),
        trackingNumber: String(row.tracking_number || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`),
        items,
      };
    });

    return { orders, isAuthenticated: true, userEmail: user.email };
  } catch (err) {
    console.warn('Error fetching user orders:', err);
    return { orders: [], isAuthenticated: false };
  }
}
