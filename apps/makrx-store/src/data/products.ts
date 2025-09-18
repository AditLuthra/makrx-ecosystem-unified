/**
 * Mock products data - used as fallback when backend is not available.
 * This will be replaced with real API data once backend integration is complete.
 */

import type { Product, Category } from '@/types';
export type { Product, Category } from '@/types';

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
  return products.filter((product) => {
    const categoryRef = product.category;
    const slugMatch = typeof categoryRef !== 'string' && categoryRef?.slug === category;
    const nameMatch = typeof categoryRef !== 'string' && categoryRef?.name === category;
    const stringMatch = typeof categoryRef === 'string' && categoryRef === category;
    const idMatch =
      product.category_id !== undefined && String(product.category_id) === category;
    return slugMatch || nameMatch || idMatch || stringMatch;
  });
};
