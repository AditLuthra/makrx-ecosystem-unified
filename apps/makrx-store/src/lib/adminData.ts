// Admin Data Service - Manages dynamic categories, filters, and products

import React from 'react';
import { categories as defaultCategories, products as defaultProducts } from '@/data/products';
import { categoryFilterSets as defaultFilters } from '@/data/categoryFilters';

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  subcategories: AdminCategory[];
  featured: boolean;
  productCount: number;
}

export interface AdminFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'toggle' | 'multiselect';
  options?: { value: string; label: string; count?: number }[];
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  helpText?: string;
  categories: string[];
}

export interface AdminProduct {
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

class AdminDataService {
  private static instance: AdminDataService;

  private constructor() {}

  public static getInstance(): AdminDataService {
    if (!AdminDataService.instance) {
      AdminDataService.instance = new AdminDataService();
    }
    return AdminDataService.instance;
  }

  // Categories Management
  getCategories(): AdminCategory[] {
    const saved = localStorage.getItem('admin_categories');
    if (saved) {
      return JSON.parse(saved);
    }

    // Convert default categories to admin format
    const adminCategories: AdminCategory[] = defaultCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      icon: cat.icon,
      subcategories: cat.subcategories,
      featured: cat.featured,
      productCount: cat.productCount,
    }));

    this.saveCategories(adminCategories);
    return adminCategories;
  }

  saveCategories(categories: AdminCategory[]): void {
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    // Trigger a custom event to notify components of category changes
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: categories }));
  }

  getCategoryBySlug(slug: string): AdminCategory | undefined {
    return this.getCategories().find((cat) => cat.slug === slug);
  }

  // Products Management
  getProducts(): AdminProduct[] {
    const saved = localStorage.getItem('admin_products');
    if (saved) {
      return JSON.parse(saved);
    }

    // Convert default products to admin format
    const adminProducts: AdminProduct[] = defaultProducts.map((prod) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      short_description: prod.short_description,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      sale_price: prod.sale_price,
      sku: prod.sku,
      images: prod.images,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      inStock: prod.inStock,
      stock_qty: prod.stock_qty,
      tags: prod.tags,
      specifications: prod.specifications,
      variants: prod.variants,
    }));

    this.saveProducts(adminProducts);
    return adminProducts;
  }

  saveProducts(products: AdminProduct[]): void {
    localStorage.setItem('admin_products', JSON.stringify(products));
    // Trigger a custom event to notify components of product changes
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
  }

  getProductsByCategory(categorySlug: string): AdminProduct[] {
    return this.getProducts().filter((prod) => prod.category === categorySlug);
  }

  getProductById(id: number): AdminProduct | undefined {
    return this.getProducts().find((prod) => prod.id === id);
  }

  // Filters Management
  getFilters(): AdminFilter[] {
    const saved = localStorage.getItem('admin_filters');
    if (saved) {
      return JSON.parse(saved);
    }

    // Convert default filters to admin format
    const adminFilters: AdminFilter[] = [];
    defaultFilters.forEach((filterSet) => {
      filterSet.filters.forEach((filter) => {
        adminFilters.push({
          id: `${filterSet.category}-${filter.id}`,
          name: filter.name,
          type: filter.type,
          options: filter.options,
          categories: [filterSet.category],
        });
      });
    });

    this.saveFilters(adminFilters);
    return adminFilters;
  }

  saveFilters(filters: AdminFilter[]): void {
    localStorage.setItem('admin_filters', JSON.stringify(filters));
    // Trigger a custom event to notify components of filter changes
    window.dispatchEvent(new CustomEvent('filtersUpdated', { detail: filters }));
  }

  getFiltersForCategory(categorySlug: string): AdminFilter[] {
    return this.getFilters().filter(
      (filter) => filter.categories.includes(categorySlug) || filter.categories.length === 0,
    );
  }

  // Utility functions
  updateProductCount(categorySlug: string): void {
    const categories = this.getCategories();
    const products = this.getProducts();

    const updatedCategories = categories.map((cat) => {
      if (cat.slug === categorySlug) {
        return {
          ...cat,
          productCount: products.filter((prod) => prod.category === categorySlug).length,
        };
      }
      return cat;
    });

    this.saveCategories(updatedCategories);
  }

  // Search functionality
  searchProducts(query: string): AdminProduct[] {
    const products = this.getProducts();
    const searchTerm = query.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm),
    );
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      categories: this.getCategories(),
      products: this.getProducts(),
      filters: this.getFilters(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);

      if (data.categories) {
        this.saveCategories(data.categories);
      }
      if (data.products) {
        this.saveProducts(data.products);
      }
      if (data.filters) {
        this.saveFilters(data.filters);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import data: Invalid JSON format' };
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    localStorage.removeItem('admin_categories');
    localStorage.removeItem('admin_products');
    localStorage.removeItem('admin_filters');

    // Trigger events to notify components
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: this.getCategories() }));
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: this.getProducts() }));
    window.dispatchEvent(new CustomEvent('filtersUpdated', { detail: this.getFilters() }));
  }
}

export const adminDataService = AdminDataService.getInstance();

// Hook for React components to listen to data changes
export function useAdminData() {
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [filters, setFilters] = React.useState<AdminFilter[]>([]);

  React.useEffect(() => {
    // Load initial data
    setCategories(adminDataService.getCategories());
    setProducts(adminDataService.getProducts());
    setFilters(adminDataService.getFilters());

    // Listen for updates
    const handleCategoriesUpdate = (event: CustomEvent) => {
      setCategories(event.detail);
    };

    const handleProductsUpdate = (event: CustomEvent) => {
      setProducts(event.detail);
    };

    const handleFiltersUpdate = (event: CustomEvent) => {
      setFilters(event.detail);
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate as EventListener);
    window.addEventListener('productsUpdated', handleProductsUpdate as EventListener);
    window.addEventListener('filtersUpdated', handleFiltersUpdate as EventListener);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate as EventListener);
      window.removeEventListener('productsUpdated', handleProductsUpdate as EventListener);
      window.removeEventListener('filtersUpdated', handleFiltersUpdate as EventListener);
    };
  }, []);

  return {
    categories,
    products,
    filters,
    refreshData: () => {
      setCategories(adminDataService.getCategories());
      setProducts(adminDataService.getProducts());
      setFilters(adminDataService.getFilters());
    },
  };
}
