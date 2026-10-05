import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';
import { MOCK_PRODUCTS } from '@/data/mockProducts';

// Map legacy mock IDs (sv-001) to database slugs
const LEGACY_ID_TO_SLUG: Record<string, string> = {
  'sv-001': 'aerostealth-aviator-titanium',
  'sv-002': 'vault-legend-classic-wayfarer',
  'sv-003': 'solstice-minimalist-round',
  'sv-004': 'hyperion-carbon-shield',
  'sv-005': 'velvet-noir-cat-eye',
  'sv-006': 'apex-pro-endurance-sport',
  'sv-007': 'elysium-rimless-titanium',
  'sv-008': 'phantom-oversized-square',
};

/**
 * Normalizes DB rows or mock items into a complete Product object
 * supporting both snake_case DB fields and legacy camelCase aliases.
 */
export function normalizeProduct(raw: Record<string, unknown> | Product): Product {
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : String(r.id || '');
  const slug =
    typeof r.slug === 'string' && r.slug
      ? r.slug
      : LEGACY_ID_TO_SLUG[id] || id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const imageUrl =
    typeof r.image_url === 'string' && r.image_url
      ? r.image_url
      : typeof r.imageUrl === 'string' && r.imageUrl
      ? r.imageUrl
      : '';
  const frameColor =
    typeof r.frame_color === 'string' && r.frame_color
      ? r.frame_color
      : typeof r.frameColor === 'string' && r.frameColor
      ? r.frameColor
      : 'Aerospace Metal';
  const lensColor =
    typeof r.lens_color === 'string' && r.lens_color
      ? r.lens_color
      : typeof r.lensColor === 'string' && r.lensColor
      ? r.lensColor
      : 'Polarized UV400';
  const reviewsCount =
    typeof r.reviews_count === 'number'
      ? r.reviews_count
      : typeof r.reviewsCount === 'number'
      ? r.reviewsCount
      : 42;
  const isNew =
    typeof r.is_new === 'boolean'
      ? r.is_new
      : typeof r.isNew === 'boolean'
      ? r.isNew
      : false;
  const isBestSeller =
    typeof r.is_bestseller === 'boolean'
      ? r.is_bestseller
      : typeof r.isBestSeller === 'boolean'
      ? r.isBestSeller
      : false;

  const name = typeof r.name === 'string' ? r.name : 'Untitled Sunglasses';
  const description = typeof r.description === 'string' ? r.description : '';
  const category = typeof r.category === 'string' ? r.category : 'Aviator';
  const stock = typeof r.stock === 'number' ? r.stock : Number(r.stock) || 20;
  const createdAt = typeof r.created_at === 'string' ? r.created_at : new Date().toISOString();
  const rating = typeof r.rating === 'number' ? r.rating : Number(r.rating) || 4.8;
  const tagline =
    typeof r.tagline === 'string' && r.tagline
      ? r.tagline
      : description ? description.split('.')[0] + '.' : '';

  const features = Array.isArray(r.features)
    ? r.features.filter((f): f is string => typeof f === 'string')
    : [];

  return {
    id,
    name,
    slug,
    description,
    price: Number(r.price) || 0,
    image_url: imageUrl,
    imageUrl,
    category,
    stock,
    frame_color: frameColor,
    frameColor,
    lens_color: lensColor,
    lensColor,
    reviews_count: reviewsCount,
    reviewsCount,
    is_new: isNew,
    isNew,
    is_bestseller: isBestSeller,
    isBestSeller,
    features,
    created_at: createdAt,
    rating,
    tagline,
  };
}

const NORMALIZED_MOCK_PRODUCTS: Product[] = MOCK_PRODUCTS.map(normalizeProduct);

async function getSupabaseClient() {
  try {
    const cookieStore = await cookies();
    return createServerClient(cookieStore);
  } catch {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    return createDirectClient(url, key);
  }
}

/**
 * Server-side data access layer to fetch all products from Supabase.
 * Falls back gracefully to mock products if database is unreachable or empty.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('Supabase products fetch warning, falling back to mock catalog:', error.message);
      }
      return NORMALIZED_MOCK_PRODUCTS;
    }

    return data.map((item) => normalizeProduct(item as Record<string, unknown>));
  } catch (err) {
    console.warn('Error fetching products from Supabase:', err);
    return NORMALIZED_MOCK_PRODUCTS;
  }
}

/**
 * Server-side data access layer to fetch a single product by UUID, slug, or legacy ID (e.g. sv-001).
 */
export async function getProductByIdOrSlug(identifier: string): Promise<Product | null> {
  if (!identifier) return null;

  const targetSlug = LEGACY_ID_TO_SLUG[identifier] || identifier;

  try {
    const supabase = await getSupabaseClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase.from('products').select('*');

    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.or(`slug.eq.${targetSlug},slug.eq.${identifier},id.eq.${identifier}`);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      return normalizeProduct(data);
    }
  } catch (err) {
    console.warn(`Error querying product for ${identifier}:`, err);
  }

  // Fallback to MOCK_PRODUCTS lookup
  const fallback = NORMALIZED_MOCK_PRODUCTS.find(
    (p) => p.id === identifier || p.slug === targetSlug || p.slug === identifier
  );

  return fallback || null;
}
