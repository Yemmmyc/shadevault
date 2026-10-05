'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';
import { createOrderServerAction } from '@/services/orderService';
import type { User } from '@supabase/supabase-js';

export default function CheckoutClient() {
  const router = useRouter();
  const { cartItems, subtotal, tax, total, clearCart, isLoaded } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setEmail(user.email || '');
          if (user.user_metadata?.full_name) {
            const parts = user.user_metadata.full_name.split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
          }
        }
      } catch (e) {
        console.warn('Error loading user session:', e);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    if (!email || !streetAddress || !city || !postalCode) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        firstName: firstName || 'Valued',
        lastName: lastName || 'Customer',
        email,
        streetAddress,
        city,
        postalCode,
        cartItems: cartItems.map((item) => ({
          productId: item.product.id || item.product.slug || '',
          quantity: item.quantity,
        })),
      };

      const result = await createOrderServerAction(payload);

      if (result.success) {
        clearCart();
        router.push(`/orders?success=true&orderId=${result.orderId}`);
      } else {
        setErrorMessage(result.error || 'Failed to place order.');
        setSubmitting(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setErrorMessage(errorMsg || 'An unexpected error occurred during order submission.');
      setSubmitting(false);
    }
  };

  if (!isLoaded || loadingUser) {
    return (
      <div className="py-20 text-center font-mono text-xs text-zinc-500">
        Loading checkout portal...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-16">
        <Container>
          <div className="max-w-md mx-auto text-center bg-zinc-900/40 p-10 rounded-2xl border border-zinc-800 space-y-4">
            <svg className="w-12 h-12 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-bold text-zinc-200">No items to checkout</h2>
            <p className="text-xs text-zinc-400">Please add luxury frames to your cart before proceeding.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors uppercase tracking-wider font-mono"
            >
              Browse Sunglasses
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container>
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">Step 2 of 2</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">Checkout & Order Placement</h1>
          <p className="text-zinc-400 text-sm mt-1">Provide your delivery details. Orders will be securely validated and saved to Supabase.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping Address */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm flex items-center justify-center">
                  1
                </div>
                <h2 className="text-lg font-bold text-zinc-100">Shipping & Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-zinc-400 block mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alexander"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vane"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1.5">Email Address (Order Confirmation)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander.vane@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1.5">Street Address</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="742 Evergreen Terrace"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Springfield"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="97477"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Authentication Notice */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm flex items-center justify-center">
                  2
                </div>
                <h2 className="text-lg font-bold text-zinc-100">Customer Identity & Security</h2>
              </div>

              {user ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Authenticated Session Recognized</span>
                  </div>
                  <p>Signed in as <strong>{user.email}</strong>. Order will be linked to your user account profile in Supabase.</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Guest Checkout / Optional Sign In</span>
                  </div>
                  <p>
                    You are placing an order as a guest. Want to link this order to your account?{' '}
                    <Link href="/login" className="text-amber-400 hover:underline font-semibold">Sign in with Google</Link> before completing order.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-zinc-100 pb-4 border-b border-zinc-800">Order Summary</h2>

            <div className="space-y-3 text-xs font-mono">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id || product.slug} className="flex justify-between text-zinc-300">
                  <span className="truncate max-w-[180px]">{product.name} (x{quantity})</span>
                  <span>${(product.price || 0) * quantity}</span>
                </div>
              ))}

              <div className="border-t border-zinc-800 pt-3 flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Insured Delivery</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estimated Tax (8%)</span>
                <span>${tax}</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-base font-bold text-zinc-100">
                <span>Total Amount</span>
                <span className="text-amber-400">${total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-zinc-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Validating & Creating Order...</span>
                </>
              ) : (
                <span>Complete Order Placement</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link href="/cart" className="text-xs text-zinc-500 hover:text-amber-400 font-mono">
                ← Return to Cart
              </Link>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
