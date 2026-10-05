'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imageUrl = product.image_url || product.imageUrl || '';
  const frameColor = product.frame_color || product.frameColor || 'Aerospace Metal';
  const reviewsCount = product.reviews_count ?? product.reviewsCount ?? 0;
  const rating = product.rating ?? 4.8;
  const isBestSeller = product.is_bestseller ?? product.isBestSeller;
  const isNew = product.is_new ?? product.isNew;
  const targetId = product.id || product.slug;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5">
      <div>
        {/* Image Frame */}
        <div className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
              No Image Available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {isBestSeller && <Badge variant="gold">Bestseller</Badge>}
            {isNew && <Badge variant="emerald">New Release</Badge>}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/20">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-zinc-400 ml-1 font-mono">{rating} ({reviewsCount})</span>
          </div>

          <Link href={`/products/${targetId}`} className="block group-hover:text-amber-400 transition-colors">
            <h3 className="font-semibold text-lg text-zinc-100 line-clamp-1">{product.name}</h3>
          </Link>

          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {product.tagline || product.description}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 font-mono">
            <span>Frame: <strong className="text-zinc-300">{frameColor}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer / Price & CTA */}
      <div className="p-5 pt-0 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">Demo Price</span>
          <span className="text-xl font-bold text-zinc-100 font-mono">${product.price}</span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/products/${targetId}`}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
              added
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-emerald-500/20'
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-amber-500/10'
            }`}
          >
            {added ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
