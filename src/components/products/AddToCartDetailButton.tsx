'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface AddToCartDetailButtonProps {
  product: Product;
}

export default function AddToCartDetailButton({ product }: AddToCartDetailButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
        added
          ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20'
          : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
      }`}
    >
      {added ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Added to Cart!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add to Shopping Cart</span>
        </>
      )}
    </button>
  );
}
