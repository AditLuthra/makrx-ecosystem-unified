/**
 * MakrX Store API Client
 * Comprehensive integration with FastAPI backend
 */

import { adminDataService } from './adminData';
import { getToken } from './auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
const SERVICES_BASE_URL = process.env.NEXT_PUBLIC_SERVICES_API_URL || API_BASE_URL;
const API_VERSION = 'v1';

// Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  request_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description?: string;
  brand?: string;
  sku?: string;
  category_id: number;
  price: number;
  sale_price?: number;
  currency: string;
  stock_qty: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  attributes: Record<string, any>;
  specifications: Record<string, any>;
  compatibility: string[];
  images: string[];
  videos: string[];
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  weight?: number;
  dimensions: Record<string, number>;
  created_at: string;
  updated_at?: string;
  category?: Category;
  effective_price: number;
  in_stock: boolean;
  rating?: {
    average: number;
    count: number;
    verified_count?: number;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  children: Category[];
  parent?: Category;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
  item_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  cart_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  meta: Record<string, any>;
  product?: Product;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  payment_id?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  addresses: {
    billing: Address;
    shipping: Address;
  };
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku?: string;
  meta: Record<string, any>;
  product?: Product;
  created_at: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Upload {
  id: string;
  user_id?: string;
  session_id?: string;
  file_key: string;
  file_name: string;
  file_hash?: string;
  file_size: number;
  mime_type: string;
  dimensions: Record<string, number>;
  volume_mm3?: number;
  surface_area_mm2?: number;
  mesh_info: Record<string, any>;
  status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'expired';
  error_message?: string;
  created_at: string;
  processed_at?: string;
  expires_at?: string;
}

export interface Quote {
  id: string;
  upload_id: string;
  user_id?: string;
  material: string;
  quality: string;
  color: string;
  infill_percentage: number;
  layer_height: number;
  supports: boolean;
  settings: Record<string, any>;
  estimated_weight_g?: number;
  estimated_time_minutes?: number;
  estimated_material_cost?: number;
  estimated_labor_cost?: number;
  estimated_machine_cost?: number;
  price: number;
  currency: string;
  expires_at: string;
  status: 'active' | 'expired' | 'accepted' | 'cancelled';
  pickup_location?: string;
  delivery_address?: Record<string, any>;
  shipping_cost: number;
  created_at: string;
  accepted_at?: string;
  upload?: Upload;
}

export interface ServiceOrder {
  id: string;
  order_id?: number;
  quote_id: string;
  provider_id?: number;
  service_order_number: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status:
    | 'pending'
    | 'routed'
    | 'accepted'
    | 'rejected'
    | 'printing'
    | 'post_processing'
    | 'quality_check'
    | 'ready'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  milestones: Record<string, any>;
  estimated_completion?: string;
  actual_completion?: string;
  tracking: Record<string, any>;
  production_notes?: string;
  quality_notes?: string;
  shipping_method?: string;
  tracking_number?: string;
  delivery_instructions?: string;
  customer_notes?: string;
  provider_notes?: string;
  created_at: string;
  updated_at?: string;
  quote?: Quote;
}

export interface AdminStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_users: number;
  total_customers: number;
  pending_orders: number;
  active_orders: number;
  low_stock_products: number;
  recent_orders: Order[];
  top_products: Array<{
    product: Product;
    quantity_sold: number;
    revenue: number;
  }>;
  revenue_chart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  product_updates: boolean;
  security_alerts?: boolean;
  processing_updates?: boolean;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private sessionId: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionId = this.getSessionId();

    // In development, log initialization
    if (process.env.NODE_ENV === 'development') {
      console.info('API Client initialized with base URL:', this.baseURL);
    }
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('makrx_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('makrx_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use mock data only in non-production when explicitly enabled
    const USE_MOCK_DATA =
      process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

    if (USE_MOCK_DATA) {
      if (typeof window !== 'undefined' && !sessionStorage.getItem('mock-data-notice-shown')) {
        sessionStorage.setItem('mock-data-notice-shown', 'true');
        console.info(
          '🔧 Mock Mode: Using mock data (disable NEXT_PUBLIC_USE_MOCK_DATA to use real API).',
        );
      }
      return this.getMockData<T>(endpoint);
    }
    const url = `${this.baseURL}${endpoint}`;
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId || '',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // In production, never fallback to mock. Surface error.
      if (process.env.NODE_ENV === 'development') {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn(`API request failed: ${endpoint}`, errMsg);
      }
      throw error;
    }
  }

  private async requestService<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${SERVICES_BASE_URL}${endpoint}`;
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId || '',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  private getMockData<T>(endpoint: string): T {
    // Mock data responses for when backend is not available
    const path = endpoint.split('?')[0]; // Remove query params for matching
    const fullUrl = new URL(`http://localhost${endpoint}`);
    const searchParams = fullUrl.searchParams;

    switch (path) {
      case '/catalog/products':
        return this.getMockProducts(searchParams) as T;
      case '/catalog/products/featured':
        return this.getMockFeaturedProducts(endpoint) as T;
      case '/catalog/categories':
        return this.getMockCategories() as T;
      case '/cart':
        return this.getMockCart() as T;
      case '/auth/user':
        return this.getMockUser() as T;
      case '/health':
        return { status: 'ok', timestamp: new Date().toISOString() } as T;
      case '/catalog/brands':
        return {
          brands: ['MakerBot', 'Prusa', 'Bambu Lab', 'Elegoo', 'Arduino'],
        } as T;
      case '/auth/me':
        return this.getMockUser() as T;
      default:
        // Handle dynamic endpoints
        if (path.startsWith('/catalog/products/slug/')) {
          const slug = path.split('/').pop();
          return this.getMockProductBySlug(slug || '') as T;
        }
        if (endpoint.includes('/orders')) {
          return { orders: [], total: 0, page: 1, per_page: 10, pages: 0 } as T;
        }
        if (endpoint.includes('/notifications')) {
          return { notifications: [], unread_count: 0 } as T;
        }
        if (endpoint.includes('/cart')) {
          return this.getMockCart() as T;
        }

        console.warn(`No mock data available for endpoint: ${endpoint}, returning empty response`);
        return {} as T;
    }
  }

  // Health Check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Authentication
  async getCurrentUser() {
    return this.request<{
      user_id: string;
      email: string;
      name: string;
      roles: string[];
      email_verified: boolean;
    }>('/api/auth/me');
  }

  // Products
  async getProducts(
    params: {
      q?: string;
      category_id?: number;
      category?: string; // Allow category slug filtering
      brand?: string;
      price_min?: number;
      price_max?: number;
      in_stock?: boolean;
      is_featured?: boolean;
      tags?: string[];
      sort?: string;
      page?: number;
      per_page?: number;
    } = {},
  ) {
    // Map page/per_page to skip/limit expected by backend
    const apiParams = new URLSearchParams();
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 20;
    apiParams.set('skip', String((page - 1) * perPage));
    apiParams.set('limit', String(perPage));
    if (params.category_id != null) apiParams.set('category_id', String(params.category_id));
    if (params.q) apiParams.set('search', params.q);

    const res = await this.request<any>(`/api/products?${apiParams}`);
    const products: Product[] = (res.products || []).map((p: any) => ({
      ...p,
      currency: p.currency || 'INR',
      effective_price:
        p.effective_price != null
          ? p.effective_price
          : p.sale_price != null
            ? p.sale_price
            : p.price,
      stock_qty: p.stock_qty != null ? p.stock_qty : p.stock_quantity,
    }));
    return {
      products,
      total: res.total,
      page: res.page,
      per_page: res.per_page,
      pages: res.pages,
    };
  }

  async getProduct(id: number) {
    // Accept both raw and wrapped responses for safety
    const res = await this.request<any>(`/api/products/${id}`);
    if (res && (res as any).product) return (res as any).product as Product;
    if (res && (res as any).id) return res as Product;
    throw new Error('Product not found');
  }

  async getProductBySlug(slug: string) {
    return this.request<Product>(`/api/products/slug/${encodeURIComponent(slug)}`);
  }

  async getFeaturedProducts(limit = 10) {
    return this.request<Product[]>(`/catalog/products/featured?limit=${limit}`);
  }

  async getPopularProducts(params: { category_id?: number; limit?: number; days?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{ products: any[] }>(
      `/api/enhanced-catalog/catalog/collections?${searchParams}`,
    );
  }

  async getSearchSuggestions(query: string, limit = 10) {
    // Use advanced search to derive suggestions (backend specific implementation TBD)
    return this.request<{ suggestions: string[] }>(
      `/api/enhanced-catalog/catalog/tags/popular?limit=${limit}`,
    );
  }

  async getBrands() {
    return this.request<{ brands: any[] }>('/api/enhanced-catalog/catalog/brands');
  }

  // Categories
  async getCategories(params: { parent_id?: number; include_inactive?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const res = await this.request<any>(`/api/categories?${searchParams}`);
    return (res && res.categories) || [];
  }

  async getCategory(id: number) {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async getCategoryBySlug(slug: string) {
    // Not available on backend; caller should use getCategories and filter by slug
    const categories = await this.request<Category[]>(`/api/categories`);
    const cat = categories.find((c: any) => c.slug === slug);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  async getProductsByCategory(
    categoryId: number,
    params: { page?: number; per_page?: number; sort?: string } = {},
  ) {
    const searchParams = new URLSearchParams();
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 20;
    searchParams.set('skip', String((page - 1) * perPage));
    searchParams.set('limit', String(perPage));

    const res = await this.request<any>(`/api/categories/${categoryId}/products?${searchParams}`);
    const products: Product[] = (res.products || []).map((p: any) => ({
      ...p,
      currency: p.currency || 'INR',
      effective_price:
        p.effective_price != null
          ? p.effective_price
          : p.sale_price != null
            ? p.sale_price
            : p.price,
      stock_qty: p.stock_qty != null ? p.stock_qty : p.stock_quantity,
    }));
    return {
      products,
      total: res.total,
      page: res.page,
      per_page: res.per_page,
      pages: res.pages,
    };
  }

  // Cart
  async getCart() {
    return this.request<Cart>('/api/cart');
  }

  async addToCart(productId: number, quantity: number, meta: Record<string, any> = {}) {
    return this.request<{ message: string }>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, meta }),
    });
  }

  async updateCartItem(itemId: number, quantity: number, meta?: Record<string, any>) {
    const body: any = { quantity };
    if (meta) body.meta = meta;

    return this.request<{ message: string }>(`/api/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async removeFromCart(itemId: number) {
    return this.request<{ message: string }>(`/api/cart/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params: { page?: number; per_page?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      orders: Order[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    }>(`/api/orders?${searchParams}`);
  }

  async getOrder(id: number) {
    return this.request<Order>(`/api/orders/${id}`);
  }

  async checkout(data: {
    cart_id?: string;
    items?: Array<{
      product_id: number;
      quantity: number;
      meta?: Record<string, any>;
    }>;
    shipping_address: Address;
    billing_address?: Address;
    shipping_method: string;
    payment_method: string;
    coupon_code?: string;
    notes?: string;
  }) {
    return this.request<{
      order_id: number;
      order_number: string;
      total: number;
      currency: string;
      payment_intent: Record<string, any>;
    }>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File Uploads
  async createUploadUrl(filename: string, contentType: string, fileSize: number) {
    return this.request<{
      upload_id: string;
      upload_url: string;
      fields: Record<string, string>;
      file_key: string;
      expires_in: number;
    }>('/api/uploads/sign', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        content_type: contentType,
        file_size: fileSize,
      }),
    });
  }

  async completeUpload(uploadId: string, fileKey: string) {
    return this.request<{ message: string }>('/api/uploads/complete', {
      method: 'POST',
      body: JSON.stringify({
        upload_id: uploadId,
        file_key: fileKey,
      }),
    });
  }

  async getUpload(id: string) {
    return this.request<Upload>(`/api/uploads/${id}`);
  }

  // Quotes
  async createQuote(data: {
    upload_id: string;
    material: string;
    quality: string;
    color?: string;
    infill_percentage?: number;
    layer_height?: number;
    supports?: boolean;
    quantity?: number;
    rush_order?: boolean;
    delivery_address?: Record<string, any>;
    pickup_location?: string;
  }) {
    return this.request<{
      quote_id: string;
      price: number;
      currency: string;
      estimated_weight_g: number;
      estimated_time_minutes: number;
      breakdown: Record<string, any>;
      material_usage: Record<string, any>;
      print_parameters: Record<string, any>;
      expires_at: string;
    }>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuote(id: string) {
    return this.request<Quote>(`/api/quotes/${id}`);
  }

  async acceptQuote(id: string) {
    return this.request<{ message: string }>(`/api/quotes/${id}/accept`, {
      method: 'POST',
    });
  }

  // Service Orders
  async createServiceOrder(data: {
    quote_id: string;
    order_id?: number;
    priority?: string;
    customer_notes?: string;
    delivery_instructions?: string;
  }) {
    return this.request<{
      service_order_id: string;
      service_order_number: string;
      status: string;
    }>('/api/service-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getServiceOrders(params: { page?: number; per_page?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      service_orders: ServiceOrder[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    }>(`/api/service-orders?${searchParams}`);
  }

  async getServiceOrder(id: string) {
    return this.request<ServiceOrder>(`/api/service-orders/${id}`);
  }

  // Material and Service Information
  async getMaterials() {
    return this.request<{
      materials: Array<{
        name: string;
        display_name: string;
        description: string;
        properties: Record<string, any>;
        colors_available: string[];
        price_per_cm3: number;
        density_g_cm3: number;
        recommended_layer_heights: number[];
        supports_required: boolean;
        post_processing: string[];
      }>;
    }>('/api/quotes/materials/');
  }

  async getServiceCapabilities() {
    return this.request<{
      materials: any[];
      qualities: any[];
      max_dimensions: Record<string, number>;
      max_volume_mm3: number;
      file_formats: string[];
      max_file_size_mb: number;
      turnaround_times: Record<string, string>;
    }>('/api/service-orders/capabilities');
  }

  // Admin methods
  async getAdminStats(): Promise<AdminStats> {
    // Placeholder until backend provides stats; will throw if not implemented
    return this.request<AdminStats>('/api/admin/stats');
  }

  async deleteProduct(id: number) {
    return this.request<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Enhanced Catalog (brands, collections, tags, categories tree, search)
  async getBrandsWithProducts(include_products = false) {
    const sp = include_products ? '?include_products=true' : '';
    return this.request<{ brands: any[] }>(`/api/enhanced-catalog/catalog/brands${sp}`);
  }

  async getBrand(slug: string) {
    return this.request<any>(`/api/enhanced-catalog/catalog/brands/${encodeURIComponent(slug)}`);
  }

  async getCollections(featured_only = false) {
    const sp = featured_only ? '?featured_only=true' : '';
    return this.request<{ collections: any[] }>(`/api/enhanced-catalog/catalog/collections${sp}`);
  }

  async getCollection(slug: string) {
    return this.request<any>(
      `/api/enhanced-catalog/catalog/collections/${encodeURIComponent(slug)}`,
    );
  }

  async getCollectionProducts(
    slug: string,
    params: { page?: number; per_page?: number; sort?: string } = {},
  ) {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.per_page) sp.set('per_page', String(params.per_page));
    if (params.sort) sp.set('sort', params.sort);
    const qs = sp.toString();
    return this.request<any>(
      `/api/enhanced-catalog/catalog/collections/${encodeURIComponent(slug)}/products${qs ? `?${qs}` : ''}`,
    );
  }

  async getPopularTags(limit = 10) {
    const sp = new URLSearchParams();
    if (limit) sp.set('limit', String(limit));
    return this.request<{ tags: string[] }>(`/api/enhanced-catalog/catalog/tags/popular?${sp}`);
  }

  async getTag(tagName: string) {
    return this.request<any>(`/api/enhanced-catalog/catalog/tags/${encodeURIComponent(tagName)}`);
  }

  async getCategoryTree(include_product_counts = true) {
    const sp = include_product_counts ? '?include_product_counts=true' : '';
    return this.request<{ categories: any[] }>(
      `/api/enhanced-catalog/catalog/categories/tree${sp}`,
    );
  }

  async advancedSearch(body: any) {
    return this.request<any>(`/api/enhanced-catalog/catalog/search/advanced`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // User notification settings
  async updateNotificationSettings(settings: NotificationSettings) {
    return this.request<{ message: string }>('/api/user/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/api/user/notifications');
  }

  // Basic notifications (optional; backend may not implement yet)
  async getNotifications() {
    try {
      return await this.request<{ notifications: any[]; unread_count: number }>(
        '/api/notifications',
      );
    } catch (e) {
      // Graceful fallback
      return { notifications: [], unread_count: 0 };
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      return await this.request<{ message: string }>(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
    } catch (e) {
      return { message: 'not-implemented' } as any;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      return await this.request<{ message: string }>('/api/notifications/mark-all-read', {
        method: 'POST',
      });
    } catch (e) {
      return { message: 'not-implemented' } as any;
    }
  }

  // Admin Notifications
  async getAdminNotifications(
    params: {
      page?: number;
      per_page?: number;
      user_id?: string;
      email?: string;
      type?: string;
      status?: string;
      read?: boolean | '';
      date_from?: string; // ISO
      date_to?: string; // ISO
    } = {},
  ) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        sp.set(k, String(v));
      }
    });
    return this.request<{
      notifications: any[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    }>(`/api/admin/notifications${sp.toString() ? `?${sp}` : ''}`);
  }

  async seedAdminNotifications(userId?: string, count = 5) {
    const sp = new URLSearchParams();
    if (userId) sp.set('user_id', userId);
    if (count) sp.set('count', String(count));
    return this.request<{ message: string; created: number; user_id: string }>(
      `/api/admin/notifications/seed${sp.toString() ? `?${sp}` : ''}`,
      { method: 'POST' },
    );
  }

  // Mock data methods for fallback when backend is unavailable
  private getMockProductBySlug(slug: string) {
    const transformedProducts = this.transformMockProducts();
    const product = transformedProducts.find((p) => p.slug === slug);

    if (!product) {
      throw new Error('Product not found');
    }

    // Add some mock rating data if not present
    (product as any).rating = (product as any).rating || {
      average: 4.2 + Math.random() * 0.8, // Random rating between 4.2-5.0
      count: Math.floor(Math.random() * 200) + 50, // Random count between 50-250
      verified_count: Math.floor(Math.random() * 100) + 25,
    };

    return product;
  }

  private getMockProducts(searchParams?: URLSearchParams) {
    // Transform mock data to match API response format
    let transformedProducts = this.transformMockProducts();

    // Apply filters if search params are provided
    if (searchParams) {
      const category = searchParams.get('category');
      const categoryId = searchParams.get('category_id');
      const brand = searchParams.get('brand');
      const inStock = searchParams.get('in_stock');
      const isFeatured = searchParams.get('is_featured');
      const query = searchParams.get('q');

      // Filter by category slug (like "electronics", "3d-printers", etc.)
      if (category) {
        transformedProducts = transformedProducts.filter((product) => {
          return (
            product.category?.slug === category ||
            product.category?.name.toLowerCase().includes(category.toLowerCase()) ||
            (typeof product.slug === 'string' && product.slug.includes(category))
          );
        });
      }

      // Filter by category ID
      if (categoryId) {
        const catId = parseInt(categoryId);
        transformedProducts = transformedProducts.filter(
          (product) => product.category_id === catId,
        );
      }

      // Filter by brand
      if (brand) {
        transformedProducts = transformedProducts.filter((product) =>
          product.brand?.toLowerCase().includes(brand.toLowerCase()),
        );
      }

      // Filter by stock status
      if (inStock === 'true') {
        transformedProducts = transformedProducts.filter((product) => product.in_stock);
      }

      // Filter by featured status
      if (isFeatured === 'true') {
        transformedProducts = transformedProducts.filter((product) => product.is_featured);
      }

      // Search filter
      if (query) {
        const searchTerm = query.toLowerCase();
        transformedProducts = transformedProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.short_description?.toLowerCase().includes(searchTerm) ||
            product.brand?.toLowerCase().includes(searchTerm) ||
            product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        );
      }
    }

    const page = searchParams ? parseInt(searchParams.get('page') || '1') : 1;
    const perPage = searchParams ? parseInt(searchParams.get('per_page') || '20') : 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedProducts = transformedProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: transformedProducts.length,
      page: page,
      per_page: perPage,
      pages: Math.ceil(transformedProducts.length / perPage),
      has_next: endIndex < transformedProducts.length,
      has_prev: page > 1,
    };
  }

  private getMockFeaturedProducts(endpoint: string) {
    try {
      // Extract limit from query params
      const url = new URL(`http://localhost${endpoint}`);
      const limit = parseInt(url.searchParams.get('limit') || '10');

      // Get featured products from mock data
      const transformedProducts = this.transformMockProducts();
      let featuredProducts = transformedProducts.filter(
        (product) =>
          product.tags && (product.tags.includes('featured') || product.tags.includes('popular')),
      );

      // If no featured products found, use first few products
      if (featuredProducts.length === 0) {
        featuredProducts = transformedProducts.slice(0, limit);
      } else {
        featuredProducts = featuredProducts.slice(0, limit);
      }

      // Ensure all products have valid unique IDs
      featuredProducts = featuredProducts.map((product, index) => ({
        ...product,
        id: product.id || 2000 + index, // Use 2000+ range for featured products
        slug: product.slug || `featured-product-${index + 1}`,
        name: product.name || `Featured Product ${index + 1}`,
        images:
          product.images && product.images.length > 0
            ? product.images.map((img) =>
                img.includes('placeholder.com') ? '/placeholder.svg' : img,
              )
            : ['/placeholder.svg'],
        tags: product.tags || [],
        currency: product.currency || 'INR',
      }));

      return featuredProducts;
    } catch (error) {
      console.error('Error generating mock featured products:', error);
      return [];
    }
  }

  private transformMockProducts() {
    // Get products and categories from admin data service
    const adminProducts = adminDataService.getProducts();
    const adminCategories = adminDataService.getCategories();

    // Create a mapping of category slugs to numeric IDs
    const categoryMap: { [key: string]: number } = {};
    adminCategories.forEach((cat, index) => {
      categoryMap[cat.slug] = parseInt(String(cat.id)) || index + 100;
    });

    return adminProducts.map((product, index) => {
      // Generate a unique numeric ID
      const numericId = typeof product.id === 'number' ? product.id : index + 1000;

      // Map product category to numeric ID
      const categorySlug = product.category;
      const categoryId = categoryMap[categorySlug] || 1;

      // Find the matching category from admin categories
      const categoryInfo =
        adminCategories.find((cat) => cat.slug === categorySlug) || adminCategories[0];

      return {
        id: numericId,
        slug: product.slug || `product-${index + 1}`,
        name: product.name || `Product ${index + 1}`,
        description: product.description || '',
        short_description: product.short_description || product.description || '',
        brand: product.brand || '',
        category_id: categoryId,
        category: {
          id: categoryId,
          name: categoryInfo?.name || product.category || 'General',
          slug: categoryInfo?.slug || categorySlug || 'general',
        },
        price: product.price || 0,
        sale_price: product.sale_price || null,
        effective_price: product.price || 0,
        currency: 'INR',
        stock_qty: typeof product.stock_qty === 'number' ? product.stock_qty : 0,
        track_inventory: true,
        in_stock: typeof product.inStock === 'boolean' ? product.inStock : true,
        allow_backorder: false,
        attributes: {},
        specifications: Array.isArray(product.specifications) ? product.specifications : [],
        compatibility: [],
        images:
          product.images && product.images.length > 0
            ? product.images.map((img) =>
                img.includes('placeholder.com') ? '/placeholder.svg' : img,
              )
            : ['/placeholder.svg'],
        videos: [],
        meta_title: product.name || `Product ${index + 1}`,
        meta_description: product.short_description || product.description || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        sku: product.sku || `SKU-${index + 1}`,
        is_active: true,
        is_featured:
          typeof (product as any).featured === 'boolean' ? (product as any).featured : false,
        is_digital: false,
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  }

  private getMockCategories() {
    // Get categories from admin data service (includes user-added categories)
    const adminCategories = adminDataService.getCategories();

    // Transform admin categories to match API response format
    const transformedCategories = adminCategories.map((category, index) => ({
      id: typeof category.id === 'number' ? category.id : index + 100,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image || '',
      parent_id: null,
      sort_order: index,
      is_active: true,
      meta_title: category.name,
      meta_description: category.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return transformedCategories;
  }

  private getMockCart() {
    return {
      id: 'mock-cart',
      user_id: null,
      session_id: 'mock-session',
      items: [],
      item_count: 0,
      subtotal: 0,
      shipping_cost: 0,
      tax_amount: 0,
      total: 0,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private getMockUser() {
    return {
      user_id: 'mock-user',
      email: 'demo@makrx.store',
      name: 'Demo User',
      roles: ['user'],
    };
  }

  // 3D Printing and Engraving Services

  // ...existing code...

  // Provider Dashboard APIs (MakrX Services backend)
  async getProviderDashboard() {
    return this.requestService<any>('/api/v1/provider/dashboard');
  }

  async getAvailableJobs() {
    return this.requestService<any>('/api/v1/provider/jobs/available');
  }

  async acceptJob(orderId: string) {
    return this.requestService<any>(`/api/v1/provider/jobs/${orderId}/accept`, { method: 'POST' });
  }

  async getProviderJobs(status?: string) {
    const endpoint = status
      ? `/api/v1/provider/jobs?status=${encodeURIComponent(status)}`
      : '/api/v1/provider/jobs';
    return this.requestService<any>(endpoint);
  }

  async updateProviderInventory(materialId: string, quantity: number, action: 'add' | 'subtract') {
    return this.requestService<any>('/api/v1/provider/inventory', {
      method: 'PATCH',
      body: JSON.stringify({ material_id: materialId, quantity, action }),
    });
  }

  async getProviderInventory() {
    return this.requestService<any>('/api/v1/provider/inventory');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Utility functions
export const formatPrice = (price: number, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(price);
};

export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export default api;
