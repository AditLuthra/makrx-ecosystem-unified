/**
 * MakrX Store API Service
 * Replaces mock data with real backend API calls
 */

const STORE_API_BASE = 'http://localhost:8003';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  in_stock: boolean;
  stock_qty?: number;
  featured_image?: string;
  gallery_images?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  is_featured: boolean;
  specifications?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
}

class StoreApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = STORE_API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Store API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Product methods
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category_id?: number;
    search?: string;
    featured?: boolean;
  }): Promise<{ products: Product[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/products${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<{ products: Product[]; pagination: any }>(endpoint);
  }

  async getProduct(productId: number): Promise<Product> {
    return this.request<Product>(`/api/products/${productId}`);
  }

  async getFeaturedProducts(limit: number = 8): Promise<{ products: Product[] }> {
    return this.getProducts({ featured: true, limit });
  }

  // Category methods  
  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/api/categories');
  }

  async getCategoryProducts(categoryId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<{ category: Category; products: Product[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/categories/${categoryId}/products${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<{ category: Category; products: Product[]; pagination: any }>(endpoint);
  }

  // Cart methods
  async getCart(): Promise<any> {
    return this.request('/api/cart');
  }

  async addToCart(productId: number, quantity: number = 1): Promise<any> {
    return this.request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<any> {
    return this.request(`/api/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: number): Promise<any> {
    return this.request(`/api/cart/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders(): Promise<any> {
    return this.request('/api/orders');
  }

  async checkout(data: {
    shipping_address: Record<string, any>;
    billing_address?: Record<string, any>;
    payment_method?: string;
    notes?: string;
  }): Promise<any> {
    return this.request('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const storeApi = new StoreApiClient();

// Export class for custom instances
export default StoreApiClient;
