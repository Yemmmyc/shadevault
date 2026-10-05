'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types/product';

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategory?: string;
  initialSearch?: string;
}

export default function ProductsClient({
  initialProducts,
  initialCategory,
  initialSearch = '',
}: ProductsClientProps) {
  const categories = ['All', 'Aviator', 'Wayfarer', 'Round', 'Shield', 'Cat-Eye', 'Sport'];

  const defaultCategory =
    initialCategory && categories.includes(initialCategory) ? initialCategory : 'All';

  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const name = product.name || '';
    const frameColor = product.frame_color || product.frameColor || '';
    const tagline = product.tagline || product.description || '';
    
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      tagline.toLowerCase().includes(query) ||
      frameColor.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 space-y-10">
      <Container>
        {/* Page Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">Catalogue</span>
          <h1 className="text-4xl font-extrabold text-zinc-100 tracking-tight">Luxury Sunglasses Collection</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Explore our precision engineered frames, featuring aerospace titanium, hand-sculpted bio-acetate, and polarized optics.
          </p>
        </div>

        {/* Filters and Controls Bar */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-zinc-900 pb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <svg className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sunglasses or materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Counter Info */}
        <div className="my-6 text-xs text-zinc-400 font-mono flex items-center justify-between">
          <span>Showing <strong className="text-zinc-200">{filteredProducts.length}</strong> of {initialProducts.length} sunglasses</span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-amber-400 hover:underline"
            >
              Reset category filter
            </button>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} />
      </Container>
    </div>
  );
}
