/**
 * Mock products data - used as fallback when backend is not available
 * This will be replaced with real API data once backend integration is complete
 */

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  brand: string;
  category: string;
  price: number;
  sale_price?: number;
  sku: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stock_qty: number;
  tags: string[];
  specifications: Array<{ key: string; value: string }>;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  subcategories: Category[];
  featured: boolean;
  productCount: number;
}

export const products: Product[] = [];
export const categories: Category[] = [];

export const searchProducts = (query: string): Product[] => {
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()),
  );
};

export const filterProducts = (products: Product[], filters: any): Product[] => {
  return products; // Basic implementation
};

export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  return products; // Basic implementation
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category);
};
