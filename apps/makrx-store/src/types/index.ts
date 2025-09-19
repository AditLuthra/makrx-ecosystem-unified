/**
 * Shared domain types for the MakrX Store frontend.
 * These act as the single source of truth for product, category, and user data.
 */

export interface RatingSummary {
  average: number;
  count: number;
  verified_count?: number;
}

export interface ProductSpecification {
  key: string;
  value: string | number | boolean;
}

export interface ProductVariant {
  id: number | string;
  name?: string;
  sku?: string;
  price: number;
  sale_price?: number;
  stock_qty: number;
  stock?: number;
  attributes: Record<string, string | number>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  path?: string;
  description: string;
  banner_image?: string;
  seo_title?: string;
  seo_description?: string;
  parent_id?: number | null;
  image_url?: string;
  image?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  featured?: boolean;
  product_count: number;
  productCount?: number;
  children: Category[];
  subcategories: Category[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  shortDescription?: string;
  brand?: string;
  sku?: string;
  category?: Category | string;
  category_id?: number;
  categoryId?: number;
  category_slug?: string;
  categorySlug?: string;
  category_name?: string;
  categoryName?: string;
  category_image?: string;
  categoryImage?: string;
  price: number;
  sale_price?: number;
  currency: string;
  stock_qty: number;
  stockQty?: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  attributes?: Record<string, unknown>;
  specifications?: Record<string, unknown> | ProductSpecification[];
  compatibility: string[];
  images: string[];
  videos?: string[];
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  is_active?: boolean;
  is_featured?: boolean;
  is_digital?: boolean;
  weight?: number;
  dimensions?: Record<string, number>;
  created_at?: string;
  updated_at?: string;
  effective_price?: number;
  in_stock: boolean;
  inStock?: boolean;
  rating?: RatingSummary;
  ratingScore?: number;
  review_count?: number;
  reviewCount?: number;
  variants: ProductVariant[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferred_username: string;
  email_verified: boolean;
  roles: string[];
  scopes: string[];
  sub?: string;
}
