import {
  ServiceOrder,
  Quote,
  StatusUpdate,
} from "@/contexts/ServiceOrderContext";
import { createStoreOrderPayload } from "./utils";

type AuthHeaderBuilder = (
  base?: Record<string, string>,
) => Promise<Record<string, string>>;

class ServicesAPI {
  private baseUrl: string;
  private storeApiUrl: string;
  private authHeaderBuilder?: AuthHeaderBuilder;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_SERVICES_API_URL || "http://localhost:3005/api";
    this.storeApiUrl =
      process.env.NEXT_PUBLIC_STORE_API_URL || "http://localhost:3001/api";
  }

  setAuthHeaderBuilder(builder: AuthHeaderBuilder) {
    this.authHeaderBuilder = builder;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.authHeaderBuilder) {
      headers = await this.authHeaderBuilder(headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async storeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.authHeaderBuilder) {
      headers = await this.authHeaderBuilder(headers);
    }

    const response = await fetch(`${this.storeApiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Store API error! status: ${response.status}`);
    }

    return response.json();
  }

  // Order Management
  async createOrder(orderData: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const order = await this.request<ServiceOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    // Create corresponding order in main store
    try {
      const storeOrderPayload = createStoreOrderPayload(order);
      const storeOrder = await this.storeRequest("/orders", {
        method: "POST",
        body: JSON.stringify(storeOrderPayload),
      });

      // Update service order with store order ID
      if (storeOrder.id) {
        await this.request(`/orders/${order.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            store_order_id: storeOrder.id,
            sync_status: "synced",
          }),
        });
      }
    } catch (error) {
      console.warn("Failed to sync with store:", error);
      // Update sync status to error but don't fail the order creation
      await this.request(`/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sync_status: "error" }),
      });
    }

    return order;
  }

  async getOrders(): Promise<ServiceOrder[]> {
    return this.request<ServiceOrder[]>("/orders");
  }

  async getOrder(id: string): Promise<ServiceOrder> {
    return this.request<ServiceOrder>(`/orders/${id}`);
  }

  async updateOrder(
    id: string,
    updates: Partial<ServiceOrder>,
  ): Promise<ServiceOrder> {
    const order = await this.request<ServiceOrder>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    // Sync with store if status changed
    if (updates.status || updates.status_updates) {
      this.syncOrderWithStore(order);
    }

    return order;
  }

  // Quote Management
  async requestQuote(orderId: string): Promise<Quote> {
    return this.request<Quote>(`/orders/${orderId}/quote`, {
      method: "POST",
    });
  }

  async acceptQuote(
    quoteId: string,
  ): Promise<{ order: ServiceOrder; quote: Quote }> {
    return this.request<{ order: ServiceOrder; quote: Quote }>(
      `/quotes/${quoteId}/accept`,
      {
        method: "POST",
      },
    );
  }

  async getQuotes(orderId?: string): Promise<Quote[]> {
    const endpoint = orderId ? `/orders/${orderId}/quotes` : "/quotes";
    return this.request<Quote[]>(endpoint);
  }

  // Status Updates
  async addStatusUpdate(
    orderId: string,
    update: Omit<StatusUpdate, "id">,
  ): Promise<StatusUpdate> {
    const statusUpdate = await this.request<StatusUpdate>(
      `/orders/${orderId}/status`,
      {
        method: "POST",
        body: JSON.stringify(update),
      },
    );

    // Sync with store
    this.syncOrderWithStore({ id: orderId } as ServiceOrder);

    return statusUpdate;
  }

  // File Upload
  async uploadFile(
    file: File,
    orderType: string,
  ): Promise<{ url: string; previewUrl?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orderType", orderType);

    let headers: Record<string, string> = {};
    if (this.authHeaderBuilder) {
      headers = await this.authHeaderBuilder({});
    }
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return response.json();
  }

  // 3D Model Analysis
  async analyzeSTL(fileUrl: string): Promise<{
    volume: number;
    surface_area: number;
    dimensions: { x: number; y: number; z: number };
    complexity_score: number;
  }> {
    return this.request("/analysis/stl", {
      method: "POST",
      body: JSON.stringify({ file_url: fileUrl }),
    });
  }

  // 2D Design Analysis
  async analyzeSVG(fileUrl: string): Promise<{
    area: number;
    dimensions: { width: number; height: number };
    path_length: number;
    complexity_score: number;
  }> {
    return this.request("/analysis/svg", {
      method: "POST",
      body: JSON.stringify({ file_url: fileUrl }),
    });
  }

  // Material Information
  async getMaterials(serviceType: "printing" | "engraving"): Promise<any[]> {
    return this.request(`/materials?type=${serviceType}`);
  }

  // Provider Management (for provider dashboard)
  async getAvailableJobs(): Promise<any[]> {
    return this.request("/provider/jobs/available");
  }

  async acceptJob(jobId: string): Promise<void> {
    await this.request(`/provider/jobs/${jobId}/accept`, {
      method: "POST",
    });
  }

  async updateJobStatus(
    jobId: string,
    status: string,
    notes?: string,
  ): Promise<void> {
    await this.request(`/provider/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  }

  async getProviderJobs(): Promise<{ jobs: any[] }> {
    return this.request("/provider/jobs");
  }

  async getProviderDashboard(): Promise<{ stats: any; notifications: any[] }> {
    return this.request("/provider/dashboard");
  }

  async getProviderInventory(): Promise<{ inventory: any[] }> {
    return this.request("/provider/inventory");
  }

  async updateProviderInventory(
    materialId: string,
    quantity: number,
    action: "add" | "subtract",
  ): Promise<void> {
    await this.request(`/provider/inventory/${materialId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, action }),
    });
  }

  // Cross-platform synchronization
  private async syncOrderWithStore(order: ServiceOrder | { id: string }) {
    try {
      if ("status" in order || "status_updates" in order) {
        const fullOrder =
          "status" in order ? order : await this.getOrder(order.id);
        const storeOrderPayload = createStoreOrderPayload(fullOrder);

        if (fullOrder.store_order_id) {
          await this.storeRequest(`/orders/${fullOrder.store_order_id}`, {
            method: "PATCH",
            body: JSON.stringify({
              status: storeOrderPayload.status,
              tracking: storeOrderPayload.tracking,
              updated_at: new Date().toISOString(),
            }),
          });
        }
      }
    } catch (error) {
      console.warn("Failed to sync order with store:", error);
    }
  }

  // Real-time updates
  setupWebSocketConnection(
    onMessage: (message: any) => void,
  ): WebSocket | null {
    try {
      const wsUrl = this.baseUrl.replace("http", "ws").replace("/api", "/ws");
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        // Send authentication token
        const sendAuth = async () => {
          if (this.authHeaderBuilder) {
            const h = await this.authHeaderBuilder({});
            const auth = h["Authorization"];
            const token = auth?.startsWith("Bearer ")
              ? auth.substring(7)
              : undefined;
            if (token) {
              ws.send(JSON.stringify({ type: "auth", token }));
            }
          }
        };
        void sendAuth();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.setupWebSocketConnection(onMessage);
        }, 5000);
      };

      return ws;
    } catch (error) {
      console.error("Failed to setup WebSocket connection:", error);
      return null;
    }
  }
}

export const servicesAPI = new ServicesAPI();

// Convenience functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default servicesAPI;
