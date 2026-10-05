export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  stock?: number;
  frame_color?: string;
  lens_color?: string;
  reviews_count?: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  features: string[];
  created_at?: string;

  // Legacy & UI compatibility properties
  imageUrl?: string;
  frameColor?: string;
  lensColor?: string;
  reviewsCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  tagline?: string;
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  itemsCount: number;
  shippingAddress: string;
  trackingNumber?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
}
