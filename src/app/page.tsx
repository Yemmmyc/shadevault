import Link from 'next/link';
import Container from '@/components/ui/Container';
import ProductGrid from '@/components/products/ProductGrid';
import { getProducts } from '@/services/productService';

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products
    .filter((p) => (p.is_bestseller ?? p.isBestSeller) || (p.is_new ?? p.isNew))
    .slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              2026 Collection Now Available
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              PRECISION OPTICS.<br />
              <span className="gold-gradient-text">UNCOMPROMISING LUXURY.</span>
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              ShadeVault engineers aerospace-grade titanium and handcrafted Italian acetate eyewear. Built with polarized UV400 optics for absolute clarity in high-contrast light.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
              >
                <span>Browse Catalogue</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/products?category=Aviator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-sm tracking-wide transition-colors"
              >
                Aviator Titanium Series
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Feature Highlights Grid */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">100% UV400 Polarized</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Multi-coated lenses eliminate harsh solar glare, reducing eye strain while sharpening contrast and natural colors.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Aerospace Titanium</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Engineered with pure grade-5 titanium for maximum corrosion resistance and featherlight, pressure-free fit.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Insured Express Courier</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every shipment is packed in hard-shell vault protection with full insurance and real-time tracking updates.
            </p>
          </div>
        </div>
      </Container>

      {/* Bestseller Showcase Section */}
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">Curated Selection</span>
            <h2 className="text-3xl font-bold text-zinc-100">Featured Sunglasses</h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full Catalogue ({products.length})</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </Container>
    </div>
  );
}
