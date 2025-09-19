/**
 * MakrX Store API Client
 * Comprehensive integration with FastAPI backend
 */

import { getToken } from '@/lib/auth';
import type { Product, Category, ProductVariant } from '@/types';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const isString = (value: unknown): value is string => typeof value === 'string';

function normalizeVariantAttributes(attributes: any): Record<string, string | number> {
  if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
    return {};
  }

  return Object.entries(attributes).reduce<Record<string, string | number>>(
    (acc, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        acc[key] = value;
      } else if (value != null) {
        acc[key] = String(value);
      }
      return acc;
    },
    {},
  );
}

function normalizeProductVariant(raw: any): ProductVariant {
  const stockQty =
    typeof raw?.stock_qty === 'number'
      ? raw.stock_qty
      : typeof raw?.stock === 'number'
        ? raw.stock
        : 0;

  return {
    id: raw?.id ?? '',
    name: raw?.name ?? undefined,
    sku: raw?.sku ?? undefined,
    price: typeof raw?.price === 'number' ? raw.price : Number(raw?.price ?? 0),
    sale_price:
      raw?.sale_price != null
        ? typeof raw.sale_price === 'number'
          ? raw.sale_price
          : Number(raw.sale_price)
        : undefined,
    stock_qty: stockQty,
    stock: typeof raw?.stock === 'number' ? raw.stock : stockQty,
    attributes: normalizeVariantAttributes(raw?.attributes),
  };
}

function normalizeCategory(raw: any, ancestors: string[] = []): Category {
  const slug = isString(raw?.slug) ? raw.slug : '';
  const pathFromAncestors = [...ancestors, slug].filter(Boolean).join('/');
  const explicitPath = isString(raw?.path) ? raw.path : undefined;
  const categoryPath = explicitPath ?? pathFromAncestors;
  const childNodes = Array.isArray(raw?.children) ? raw.children : [];

  const normalizedChildren = childNodes.map((child: any) =>
    normalizeCategory(child, [...ancestors, slug].filter(Boolean)),
  );

  return {
    id: Number(raw?.id ?? 0),
    name: raw?.name ?? '',
    slug,
    path: categoryPath,
    description: raw?.description ?? '',
    banner_image: raw?.banner_image ?? raw?.bannerImage ?? undefined,
    seo_title: raw?.seo_title ?? raw?.seoTitle ?? undefined,
    seo_description: raw?.seo_description ?? raw?.seoDescription ?? undefined,
    parent_id: raw?.parent_id ?? raw?.parentId ?? null,
    image_url: raw?.image_url ?? raw?.imageUrl ?? undefined,
    image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
    icon: raw?.icon ?? undefined,
    sort_order: raw?.sort_order ?? raw?.sortOrder ?? undefined,
    is_active: raw?.is_active ?? raw?.isActive ?? true,
    created_at: raw?.created_at ?? raw?.createdAt ?? undefined,
    updated_at: raw?.updated_at ?? raw?.updatedAt ?? undefined,
    featured: raw?.featured ?? false,
    product_count: raw?.product_count ?? raw?.productCount ?? 0,
    productCount: raw?.productCount ?? raw?.product_count ?? 0,
    children: normalizedChildren,
    subcategories:
      Array.isArray(raw?.subcategories) && raw.subcategories.length > 0
        ? raw.subcategories.map((child: any) =>
            normalizeCategory(child, [...ancestors, slug].filter(Boolean)),
          )
        : normalizedChildren,
  };
}

function normalizeProduct(raw: any): Product {
  if (!raw) {
    return {
      id: 0,
      slug: '',
      name: '',
      description: '',
      short_description: '',
      shortDescription: '',
      price: 0,
      currency: 'INR',
      stock_qty: 0,
      compatibility: [],
      images: [PLACEHOLDER_IMAGE],
      tags: [],
      in_stock: false,
      variants: [],
    } as Product;
  }

  const stockQty =
    typeof raw.stock_qty === 'number'
      ? raw.stock_qty
      : typeof raw.stockQty === 'number'
        ? raw.stockQty
        : typeof raw.stock_quantity === 'number'
          ? raw.stock_quantity
          : 0;

  const price = typeof raw.price === 'number' ? raw.price : Number(raw.price ?? 0);
  const salePrice =
    raw.sale_price != null
      ? typeof raw.sale_price === 'number'
        ? raw.sale_price
        : Number(raw.sale_price)
      : undefined;
  const effectivePrice =
    raw.effective_price != null
      ? typeof raw.effective_price === 'number'
        ? raw.effective_price
        : Number(raw.effective_price)
      : salePrice ?? price;

  const images = Array.isArray(raw.images)
    ? raw.images.filter((img: unknown) => isString(img) && img.length > 0)
    : [];
  const normalizedImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  const compatibility = Array.isArray(raw.compatibility)
    ? raw.compatibility.filter(isString)
    : [];

  const tags = Array.isArray(raw.tags) ? raw.tags.filter(isString) : [];

  const attributes =
    raw.attributes && typeof raw.attributes === 'object' && !Array.isArray(raw.attributes)
      ? (raw.attributes as Record<string, unknown>)
      : {};

  const specifications =
    raw.specifications && typeof raw.specifications === 'object'
      ? raw.specifications
      : {};

  const normalizedCategory =
    raw.category && typeof raw.category === 'object' && !Array.isArray(raw.category)
      ? normalizeCategory(raw.category)
      : raw.category;

  const variants = Array.isArray(raw.variants)
    ? raw.variants.map(normalizeProductVariant)
    : [];

  const rating =
    raw.rating && typeof raw.rating === 'object'
      ? raw.rating
      : typeof raw.rating === 'number'
        ? { average: raw.rating, count: raw.review_count ?? raw.reviewCount ?? 0 }
        : undefined;

  const categoryIdFromObject =
    typeof normalizedCategory === 'object' && normalizedCategory
      ? normalizedCategory.id
      : undefined;
  const categorySlugFromObject =
    typeof normalizedCategory === 'object' && normalizedCategory
      ? normalizedCategory.slug
      : undefined;
  const categoryNameFromObject =
    typeof normalizedCategory === 'object' && normalizedCategory
      ? normalizedCategory.name
      : undefined;

  return {
    id: Number(raw.id ?? 0),
    slug: isString(raw.slug) ? raw.slug : String(raw.id ?? ''),
    name: raw.name ?? '',
    description: raw.description ?? '',
    short_description: raw.short_description ?? raw.shortDescription ?? '',
    shortDescription: raw.shortDescription ?? raw.short_description ?? '',
    brand: raw.brand ?? undefined,
    sku: raw.sku ?? undefined,
    category: normalizedCategory,
    category_id: raw.category_id ?? raw.categoryId ?? categoryIdFromObject,
    categoryId: raw.categoryId ?? raw.category_id ?? categoryIdFromObject,
    category_slug: raw.category_slug ?? raw.categorySlug ?? categorySlugFromObject,
    categorySlug: raw.categorySlug ?? raw.category_slug ?? categorySlugFromObject,
    category_name: raw.category_name ?? raw.categoryName ?? categoryNameFromObject,
    categoryName: raw.categoryName ?? raw.category_name ?? categoryNameFromObject,
    category_image: raw.category_image ?? raw.categoryImage ?? undefined,
    categoryImage: raw.categoryImage ?? raw.category_image ?? undefined,
    price,
    sale_price: salePrice,
    currency: raw.currency ?? 'INR',
    stock_qty: stockQty,
    stockQty: raw.stockQty ?? raw.stock_quantity ?? stockQty,
    track_inventory: raw.track_inventory ?? undefined,
    allow_backorder: raw.allow_backorder ?? undefined,
    attributes,
    specifications,
    compatibility,
    images: normalizedImages,
    videos: Array.isArray(raw.videos) ? raw.videos : undefined,
    meta_title: raw.meta_title ?? raw.metaTitle ?? undefined,
    meta_description: raw.meta_description ?? raw.metaDescription ?? undefined,
    tags,
    is_active: raw.is_active ?? raw.isActive ?? undefined,
    is_featured: raw.is_featured ?? raw.isFeatured ?? undefined,
    is_digital: raw.is_digital ?? raw.isDigital ?? undefined,
    weight: typeof raw.weight === 'number' ? raw.weight : undefined,
    dimensions:
      raw.dimensions && typeof raw.dimensions === 'object' ? raw.dimensions : undefined,
    created_at: raw.created_at ?? raw.createdAt ?? undefined,
    updated_at: raw.updated_at ?? raw.updatedAt ?? undefined,
    effective_price: effectivePrice,
    in_stock: raw.in_stock ?? raw.inStock ?? stockQty > 0,
    inStock: raw.inStock ?? raw.in_stock ?? stockQty > 0,
    rating,
    ratingScore: raw.ratingScore ?? undefined,
    review_count: raw.review_count ?? undefined,
    reviewCount: raw.reviewCount ?? undefined,
    variants,
  };
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
const SERVICES_BASE_URL = process.env.NEXT_PUBLIC_SERVICES_API_URL;
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

export type { Product, Category };

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
  product?: Partial<Product>;
  created_at: string;
  updated_at?: string;
  price_at_time?: number;
  item_total?: number;
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

export interface QuoteBreakdownSummary {
  material_cost: number;
  machine_cost: number;
  labor_cost: number;
  setup_time_hours?: number;
  setup_fee?: number;
  delivery_cost?: number;
  subtotal?: number;
  tax_amount?: number;
  total_cost?: number;
}

export interface QuoteMaterialUsage {
  volume_cm3?: number;
  total_mass_g?: number;
  solid_volume_mm3?: number;
  support_volume_mm3?: number;
  brim_volume_mm3?: number;
}

export interface QuoteSummary {
  quote_id: string;
  price: number;
  currency: string;
  estimated_weight_g?: number;
  estimated_time_minutes?: number;
  estimated_time_hours?: number;
  material?: string;
  quantity?: number;
  breakdown: QuoteBreakdownSummary;
  material_usage: QuoteMaterialUsage;
  print_parameters: Record<string, any>;
  file_analysis?: Record<string, any>;
  estimated_delivery?: string;
  expires_at?: string;
  raw?: Record<string, any>;
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
  quote?: QuoteSummary;
}

export interface ServiceOrderSummary {
  order_id: string;
  service_order_id: string;
  status: string;
  total_amount: number;
  estimated_delivery: string;
  provider_info?: Record<string, any>;
  job_details?: Record<string, any>;
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
class StoreApiClient {
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
      if (process.env.NODE_ENV === 'development') {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn(`API request failed: ${endpoint}`, errMsg);
      }
      throw error;
    }
  }

  private async requestService<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!SERVICES_BASE_URL) {
      throw new Error(
        'NEXT_PUBLIC_SERVICES_API_URL is not configured. Provider API calls require this value.',
      );
    }

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

  private formatQuoteResponse(response: any): QuoteSummary {
    if (!response) {
      throw new Error('Quote response is empty');
    }

    const breakdown = response.breakdown ?? {};
    const material = breakdown.material ?? {};
    const labor = breakdown.labor ?? {};
    const time = breakdown.time ?? {};
    const delivery = breakdown.delivery ?? {};
    const fileAnalysis = response.file_analysis ?? response.analysis ?? null;

    const price = response.total_price ?? response.price ?? 0;
    const totalTimeHours = time.total_time_hours ?? time.estimated_time_hours;

    const estimatedTimeHours =
      typeof totalTimeHours === 'number' ? totalTimeHours : undefined;
    const materialName = response.print_parameters?.material ?? response.material;
    const quantity = response.print_parameters?.quantity ?? response.quantity;

    return {
      quote_id: response.quote_id ?? response.id ?? '',
      price,
      currency: response.currency ?? 'INR',
      estimated_weight_g:
        typeof material.total_mass_g === 'number'
          ? Math.round(material.total_mass_g * 100) / 100
          : undefined,
      estimated_time_minutes:
        typeof totalTimeHours === 'number' ? Math.round(totalTimeHours * 60) : undefined,
      estimated_time_hours: estimatedTimeHours,
      material: typeof materialName === 'string' ? materialName : undefined,
      quantity: typeof quantity === 'number' ? quantity : undefined,
      breakdown: {
        material_cost: material.material_cost ?? 0,
        machine_cost: labor.machine_cost ?? 0,
        labor_cost: labor.labor_cost ?? 0,
        setup_time_hours: labor.setup_time_hours,
        setup_fee: labor.setup_fee ?? 0,
        delivery_cost: delivery.delivery_cost,
        subtotal: breakdown.subtotal,
        tax_amount: breakdown.tax_amount,
        total_cost: breakdown.total_cost ?? price,
      },
      material_usage: {
        volume_cm3:
          fileAnalysis && typeof fileAnalysis.volume_mm3 === 'number'
            ? fileAnalysis.volume_mm3 / 1000
            : undefined,
        total_mass_g: material.total_mass_g,
        solid_volume_mm3: material.solid_volume_mm3,
        support_volume_mm3: material.support_volume_mm3,
        brim_volume_mm3: material.brim_volume_mm3,
      },
      print_parameters: response.print_parameters ?? {},
      file_analysis: fileAnalysis ?? undefined,
      estimated_delivery: response.estimated_delivery,
      expires_at: response.valid_until ?? response.expires_at,
      raw: response,
    };
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
    const products: Product[] = (res.products || []).map((p: any) => normalizeProduct(p));
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
    if (res && (res as any).product) return normalizeProduct((res as any).product);
    if (res && (res as any).id) return normalizeProduct(res);
    throw new Error('Product not found');
  }

  async getProductBySlug(slug: string) {
    const product = await this.request<any>(
      `/api/products/slug/${encodeURIComponent(slug)}`,
    );
    return normalizeProduct(product);
  }

  async getFeaturedProducts(limit = 10) {
    const result = await this.request<{
      products: Product[];
    }>(`/api/enhanced-catalog/catalog/search/advanced`, {
      method: 'POST',
      body: JSON.stringify({
        filters: { is_featured: true },
        page: 1,
        per_page: limit,
        sort_by: 'popularity',
        include_suggestions: false,
        include_facets: false,
      }),
    });

    return (result.products ?? []).map((product) => normalizeProduct(product));
  }

  async getPopularProducts(params: { category_id?: number; limit?: number; days?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{ collections: any[] }>(
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

    const res = await this.request<{ categories?: any[] }>(`/api/categories?${searchParams}`);
    return (res?.categories ?? []).map((category) => normalizeCategory(category));
  }

  async getCategory(id: number) {
    const category = await this.request<any>(`/api/categories/${id}`);
    return normalizeCategory(category);
  }

  async getCategoryBySlug(slug: string) {
    // Not available on backend; fetch all categories and filter locally
    const { categories = [] } = await this.request<{ categories?: any[] }>(
      `/api/categories`,
    );
    const cat = categories.find((c: any) => c.slug === slug);
    if (!cat) throw new Error('Category not found');
    return normalizeCategory(cat);
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
    const products: Product[] = (res.products || []).map((p: any) => normalizeProduct(p));
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
    type RawCartProduct = {
      id: number;
      name: string;
      slug: string;
      featured_image?: string;
      current_price: number;
      in_stock: boolean;
    };

    type RawCartItem = {
      id: number;
      product?: RawCartProduct;
      quantity: number;
      price_at_time?: number;
      item_total?: number;
      created_at?: string;
      added_at?: string;
    };

    type RawCart = {
      id: string;
      user_id?: string;
      session_id?: string;
      status: string;
      created_at?: string;
      updated_at?: string;
    } | null;

    const response = await this.request<{
      cart: RawCart;
      items: RawCartItem[];
      summary: { total_amount: number; total_items: number; currency: string };
    }>('/api/cart');

    const subtotal = response?.summary?.total_amount ?? 0;
    const currency = response?.summary?.currency ?? 'INR';
    const itemCount = response?.summary?.total_items ?? 0;

    const cartMeta = response?.cart;

    const items: CartItem[] = (response?.items ?? []).map((item) => {
      const unitPrice = item.price_at_time ?? (item.item_total ?? 0) / Math.max(item.quantity, 1);
      const totalPrice = item.item_total ?? unitPrice * item.quantity;

      const product = item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            featured_image: item.product.featured_image,
            in_stock: item.product.in_stock,
            price: item.product.current_price,
            effective_price: item.product.current_price,
            currency,
            images: item.product.featured_image ? [item.product.featured_image] : [],
          }
        : undefined;

      return {
        id: item.id,
        cart_id: cartMeta?.id ?? '',
        product_id: item.product?.id ?? 0,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        price_at_time: item.price_at_time,
        item_total: item.item_total,
        meta: {},
        product,
        created_at: item.created_at ?? item.added_at ?? '',
      };
    });

    return {
      id: cartMeta?.id ?? '',
      user_id: cartMeta?.user_id,
      session_id: cartMeta?.session_id,
      currency,
      items,
      subtotal,
      item_count: itemCount,
      created_at: cartMeta?.created_at ?? '',
      updated_at: cartMeta?.updated_at ?? undefined,
    };
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

  async getProcessingStatus(uploadId: string) {
    const status = await this.request<{
      upload_id: string;
      filename: string;
      status: string;
      progress?: number;
      error?: string;
      analysis?: Record<string, any>;
      result?: Record<string, any>;
    }>(`/api/uploads/${uploadId}`);

    return {
      status: status.status,
      progress: status.progress ?? 0,
      error: status.error,
      result: status.analysis ?? status.result,
    };
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
    brim?: boolean;
    quantity?: number;
    rush_order?: boolean;
    delivery_address?: Record<string, any>;
    pickup_location?: string;
    customer_notes?: string;
  }): Promise<QuoteSummary> {
    const normalizedMaterial = data.material ? data.material.toUpperCase() : 'PLA';
    const normalizedQuality = data.quality ? data.quality.toLowerCase() : 'standard';

    const payload = {
      upload_id: data.upload_id,
      print_settings: {
        material: normalizedMaterial,
        quality: normalizedQuality,
        color: data.color,
        infill_percentage: data.infill_percentage ?? 20,
        layer_height: data.layer_height ?? 0.2,
        supports: data.supports ?? false,
        brim: data.brim ?? false,
        quantity: data.quantity ?? 1,
        rush_order: data.rush_order ?? false,
      },
      delivery_address: data.delivery_address,
      pickup_location: data.pickup_location,
      customer_notes: data.customer_notes,
    };

    const response = await this.request<any>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.formatQuoteResponse(response);
  }

  async getQuote(id: string): Promise<QuoteSummary> {
    const response = await this.request<any>(`/api/quotes/${id}`);
    return this.formatQuoteResponse(response);
  }

  async acceptQuote(id: string) {
    return this.request<{ message: string }>(`/api/quotes/${id}/accept`, {
      method: 'POST',
    });
  }

  // Service Orders
  async createServiceOrder(
    quote:
      | string
      | {
          quote_id: string;
          order_id?: number;
          priority?: string;
          customer_notes?: string;
          delivery_instructions?: string;
        },
    overrides: Record<string, any> = {},
  ) {
    const payload =
      typeof quote === 'string'
        ? { quote_id: quote, ...overrides }
        : { ...quote, ...overrides };

    if (!payload.quote_id) {
      throw new Error('quote_id is required to create a service order');
    }

    return this.request<ServiceOrderSummary>('/api/service-orders/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getServiceOrders(params: { page?: number; per_page?: number } = {}) {
    throw new Error('Listing service orders is not available in the Store API yet.');
  }

  async getServiceOrder(id: string) {
    return this.request<ServiceOrderSummary>(`/api/service-orders/order/${id}`);
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
    throw new Error('Service capabilities endpoint is not implemented on the Store API.');
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
    const response = await this.request<{ categories: any[] }>(
      `/api/enhanced-catalog/catalog/categories/tree${sp}`,
    );

    return {
      categories: (response.categories ?? []).map((category) => normalizeCategory(category)),
    };
  }

  async advancedSearch(body: any) {
    const response = await this.request<any>(`/api/enhanced-catalog/catalog/search/advanced`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (Array.isArray(response?.products)) {
      response.products = response.products.map((product: any) => normalizeProduct(product));
    }
    return response;
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

  // Provider Dashboard APIs (MakrX Services backend)
  async getProviderDashboard() {
    return this.requestService<any>('/api/provider/dashboard');
  }

  async getAvailableJobs() {
    return this.requestService<any>('/api/provider/jobs/available');
  }

  async acceptJob(orderId: string) {
    return this.requestService<any>(`/api/provider/jobs/${orderId}/accept`, { method: 'POST' });
  }

  async getProviderJobs(status?: string) {
    const endpoint = status
      ? `/api/provider/jobs?status=${encodeURIComponent(status)}`
      : '/api/provider/jobs';
    return this.requestService<any>(endpoint);
  }

  async updateJobStatus(jobId: string, status: string, notes?: string) {
    return this.requestService<any>(`/api/provider/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message: notes }),
    });
  }

  async updateProviderInventory(materialId: string, quantity: number, action: 'add' | 'subtract') {
    return this.requestService<any>(`/api/provider/inventory/${encodeURIComponent(materialId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, action }),
    });
  }

  async getProviderInventory() {
    return this.requestService<any>('/api/provider/inventory');
  }
}

// Export singleton instance
export const storeApi = new StoreApiClient();

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

export default storeApi;
