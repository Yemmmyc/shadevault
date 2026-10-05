'use client';

import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import { useCart } from '@/context/CartContext';

export default function CartClient() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    tax,
    total,
    isLoaded,
  } = useCart();

  if (!isLoaded) {
    return (
      <div className="py-20 text-center font-mono text-xs text-zinc-500">
        Loading cart selection...
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container>
        {/* Page Title */}
        <div className="mb-8">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">Your Selection</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">Shopping Cart</h1>
          <p className="text-zinc-400 text-sm mt-1">Review your selected luxury frames before proceeding to secure checkout.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-4">
            <svg className="w-16 h-16 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-bold text-zinc-200">Your cart is currently empty</h2>
            <p className="text-sm text-zinc-400">Discover our collection of handcrafted titanium and bio-acetate frames.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors uppercase tracking-wider font-mono"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(({ product, quantity }) => {
                const targetId = product.id || product.slug || '';
                const imageUrl = product.image_url || product.imageUrl || '';
                const frameColor = product.frame_color || product.frameColor || 'Aerospace Metal';

                return (
                  <div
                    key={targetId}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5 justify-between"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">{product.category}</span>
                        <Link href={`/products/${targetId}`} className="block hover:text-amber-400 transition-colors">
                          <h3 className="font-bold text-zinc-100 text-base">{product.name}</h3>
                        </Link>
                        <p className="text-xs text-zinc-400 mt-0.5">Frame: {frameColor}</p>
                        <span className="text-sm font-mono text-zinc-200 font-semibold block mt-1">${product.price}</span>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(targetId, quantity - 1)}
                          className="text-zinc-400 hover:text-white px-2 py-0.5 text-sm font-bold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-semibold text-zinc-200 w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(targetId, quantity + 1)}
                          className="text-zinc-400 hover:text-white px-2 py-0.5 text-sm font-bold transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-base font-bold text-zinc-100 min-w-[70px] text-right">
                        ${product.price * quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(targetId)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <Link href="/products" className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1">
                  <span>← Continue Browsing</span>
                </Link>
                <span className="text-xs text-zinc-500 font-mono">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)} items in cart
                </span>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
              <h2 className="text-lg font-bold text-zinc-100 pb-4 border-b border-zinc-800">Order Summary</h2>

              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-200 font-semibold">${subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Insured Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-zinc-200">${tax}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 border-t border-zinc-800 pt-3">
                  <span>Total</span>
                  <span className="text-amber-400">${total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <p className="text-[11px] text-zinc-500 text-center font-mono">
                Checkout totals are calculated and validated server-side.
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
