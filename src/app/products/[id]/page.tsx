import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import AddToCartDetailButton from '@/components/products/AddToCartDetailButton';
import { getProductByIdOrSlug } from '@/services/productService';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  const imageUrl = product.image_url || product.imageUrl || '';
  const frameColor = product.frame_color || product.frameColor || 'Aerospace Metal';
  const lensColor = product.lens_color || product.lensColor || 'Polarized UV400';
  const reviewsCount = product.reviews_count ?? product.reviewsCount ?? 0;
  const rating = product.rating ?? 4.8;
  const isBestSeller = product.is_bestseller ?? product.isBestSeller;
  const isNew = product.is_new ?? product.isNew;
  const tagline = product.tagline || product.description;

  return (
    <div className="py-12">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-zinc-300 font-semibold">{product.name}</span>
        </nav>

        {/* Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Showcase */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                  No Image Available
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {isBestSeller && <Badge variant="gold">Bestseller</Badge>}
                {isNew && <Badge variant="emerald">New Release</Badge>}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                In Stock & Ready to Ship ({product.stock} units)
              </span>
              <span className="font-mono">Vault SKU: {(product.slug || product.id).toUpperCase()}</span>
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                {product.category} Series
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">{product.name}</h1>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{tagline}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-zinc-200">{rating}</span>
              <span className="text-xs text-zinc-500 font-mono">({reviewsCount} customer reviews)</span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">Demonstration Price</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono">${product.price}</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                Free Express Delivery
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed border-t border-zinc-900 pt-4">
              {product.description}
            </p>

            {/* Key Specs Table */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
              <div>
                <span className="text-zinc-500 block uppercase">Frame Material</span>
                <span className="text-zinc-200 font-semibold">{frameColor}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase">Lens Optics</span>
                <span className="text-zinc-200 font-semibold">{lensColor}</span>
              </div>
            </div>

            {/* Features Checklist */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Engineering Features</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="pt-6 border-t border-zinc-900 space-y-4">
              <div className="flex gap-4">
                <AddToCartDetailButton product={product} />

                <Link
                  href="/cart"
                  className="py-4 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-sm transition-colors flex items-center justify-center"
                >
                  View Cart
                </Link>
              </div>

              <p className="text-[11px] text-zinc-500 text-center font-mono">
                Items are stored securely in your session cart with real-time total calculations.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
