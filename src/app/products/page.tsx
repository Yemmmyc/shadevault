import { getProducts } from '@/services/productService';
import ProductsClient from '@/components/products/ProductsClient';

export const revalidate = 60; // Revalidate at most every 60 seconds

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const products = await getProducts();

  return (
    <ProductsClient
      initialProducts={products}
      initialCategory={resolvedParams?.category}
      initialSearch={resolvedParams?.search}
    />
  );
}

