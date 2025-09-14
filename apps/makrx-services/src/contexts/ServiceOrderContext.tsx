"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useKeycloak, useAuthHeaders } from "@makrx/auth";

export interface ServiceOrder {
  id: string;
  user_id: string;
  service_type: "printing" | "engraving" | "cnc" | "injection";
  status:
    | "pending"
    | "quoted"
    | "confirmed"
    | "dispatched"
    | "accepted"
    | "in_progress"
    | "completed"
    | "delivered";
  priority: "normal" | "rush";

  // File and design info
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  preview_url?: string;

  // Service specifications
  material: string;
  color_finish?: string;
  quantity: number;
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };

  // Pricing
  base_price: number;
  material_cost: number;
  labor_cost: number;
  setup_fee: number;
  rush_fee: number;
  total_price: number;

  // Provider assignment
  provider_id?: string;
  provider_name?: string;
  estimated_completion?: string;

  // Tracking
  created_at: string;
  updated_at: string;
  dispatched_at?: string;
  accepted_at?: string;
  completed_at?: string;
  delivered_at?: string;

  // Communication
  customer_notes?: string;
  provider_notes?: string;
  status_updates: StatusUpdate[];

  // Cross-platform integration
  store_order_id?: string; // Links to main makrx-store order
  sync_status: "pending" | "synced" | "error";
}

export interface StatusUpdate {
  id: string;
  status: string;
  message: string;
  timestamp: string;
  images?: string[];
  user_type: "customer" | "provider" | "system";
}

export interface Quote {
  id: string;
  service_order_id: string;
  base_price: number;
  material_cost: number;
  labor_cost: number;
  setup_fee: number;
  rush_fee: number;
  total_price: number;
  estimated_completion: string;
  valid_until: string;
  breakdown: {
    volume?: number;
    surface_area?: number;
    material_usage: number;
    print_time?: number;
    post_processing?: string[];
  };
  created_at: string;
}

interface ServiceOrderState {
  orders: ServiceOrder[];
  currentOrder: ServiceOrder | null;
  quotes: Quote[];
  loading: boolean;
  error: string | null;
}

type ServiceOrderAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ORDERS"; payload: ServiceOrder[] }
  | { type: "ADD_ORDER"; payload: ServiceOrder }
  | {
      type: "UPDATE_ORDER";
      payload: { id: string; updates: Partial<ServiceOrder> };
    }
  | { type: "SET_CURRENT_ORDER"; payload: ServiceOrder | null }
  | { type: "SET_QUOTES"; payload: Quote[] }
  | { type: "ADD_QUOTE"; payload: Quote }
  | {
      type: "ADD_STATUS_UPDATE";
      payload: { orderId: string; update: StatusUpdate };
    };

const initialState: ServiceOrderState = {
  orders: [],
  currentOrder: null,
  quotes: [],
  loading: false,
  error: null,
};

function serviceOrderReducer(
  state: ServiceOrderState,
  action: ServiceOrderAction,
): ServiceOrderState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };

    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id
            ? { ...order, ...action.payload.updates }
            : order,
        ),
        currentOrder:
          state.currentOrder?.id === action.payload.id
            ? { ...state.currentOrder, ...action.payload.updates }
            : state.currentOrder,
      };

    case "SET_CURRENT_ORDER":
      return { ...state, currentOrder: action.payload };

    case "SET_QUOTES":
      return { ...state, quotes: action.payload };

    case "ADD_QUOTE":
      return { ...state, quotes: [...state.quotes, action.payload] };

    case "ADD_STATUS_UPDATE":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId
            ? {
                ...order,
                status_updates: [
                  ...order.status_updates,
                  action.payload.update,
                ],
              }
            : order,
        ),
        currentOrder:
          state.currentOrder?.id === action.payload.orderId
            ? {
                ...state.currentOrder,
                status_updates: [
                  ...state.currentOrder.status_updates,
                  action.payload.update,
                ],
              }
            : state.currentOrder,
      };

    default:
      return state;
  }
}

interface ServiceOrderContextType extends ServiceOrderState {
  // Order management
  createOrder: (
    orderData: Omit<
      ServiceOrder,
      "id" | "created_at" | "updated_at" | "status_updates" | "sync_status"
    >,
  ) => Promise<ServiceOrder>;
  updateOrder: (id: string, updates: Partial<ServiceOrder>) => Promise<void>;
  getOrder: (id: string) => Promise<ServiceOrder | null>;
  getUserOrders: () => Promise<ServiceOrder[]>;

  // Quote management
  requestQuote: (orderId: string) => Promise<Quote>;
  acceptQuote: (quoteId: string) => Promise<void>;

  // Status updates
  addStatusUpdate: (
    orderId: string,
    message: string,
    images?: string[],
  ) => Promise<void>;

  // Cross-platform sync
  syncWithStore: (orderId: string) => Promise<void>;

  // File management
  uploadFile: (
    file: File,
    orderType: string,
  ) => Promise<{ url: string; previewUrl?: string }>;
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(
  undefined,
);

export function ServiceOrderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(serviceOrderReducer, initialState);
  const { user, isAuthenticated } = useKeycloak();
  const getHeaders = useAuthHeaders();

  // Load user orders on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserOrders();
    }
  }, [isAuthenticated, user]);

  const loadUserOrders = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch("/api/orders", {
        headers: await getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to load orders");

      const orders = await response.json();
      dispatch({ type: "SET_ORDERS", payload: orders });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createOrder = async (
    orderData: Omit<
      ServiceOrder,
      "id" | "created_at" | "updated_at" | "status_updates" | "sync_status"
    >,
  ): Promise<ServiceOrder> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: await getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...orderData,
          user_id: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const order = await response.json();

      // Add to local state
      dispatch({ type: "ADD_ORDER", payload: order });

      // Sync with main store
      await syncWithStore(order.id);

      return order;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateOrder = async (id: string, updates: Partial<ServiceOrder>) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: await getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const updatedOrder = await response.json();
      dispatch({
        type: "UPDATE_ORDER",
        payload: { id, updates: updatedOrder },
      });

      // Sync status updates with main store
      if (updates.status || updates.status_updates) {
        await syncWithStore(id);
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  };

  const getOrder = async (id: string): Promise<ServiceOrder | null> => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: await getHeaders(),
      });

      if (!response.ok) return null;

      const order = await response.json();
      dispatch({ type: "SET_CURRENT_ORDER", payload: order });
      return order;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      return null;
    }
  };

  const getUserOrders = async (): Promise<ServiceOrder[]> => {
    await loadUserOrders();
    return state.orders;
  };

  const requestQuote = async (orderId: string): Promise<Quote> => {
    try {
      const response = await fetch(`/api/orders/${orderId}/quote`, {
        method: "POST",
        headers: await getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to request quote");

      const quote = await response.json();
      dispatch({ type: "ADD_QUOTE", payload: quote });

      // Update order status to quoted
      await updateOrder(orderId, { status: "quoted" });

      return quote;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: "POST",
        headers: await getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to accept quote");

      const { order } = await response.json();
      dispatch({
        type: "UPDATE_ORDER",
        payload: { id: order.id, updates: order },
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  };

  const addStatusUpdate = async (
    orderId: string,
    message: string,
    images?: string[],
  ) => {
    try {
      const update: StatusUpdate = {
        id: Date.now().toString(),
        status: "info",
        message,
        timestamp: new Date().toISOString(),
        images,
        user_type: "customer",
      };

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: await getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(update),
      });

      if (!response.ok) throw new Error("Failed to add status update");

      dispatch({ type: "ADD_STATUS_UPDATE", payload: { orderId, update } });

      // Sync with store
      await syncWithStore(orderId);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  };

  const syncWithStore = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/sync`, {
        method: "POST",
        headers: await getHeaders(),
      });

      if (!response.ok) {
        console.warn("Failed to sync with main store:", response.statusText);
        return;
      }

      // Update sync status
      dispatch({
        type: "UPDATE_ORDER",
        payload: { id: orderId, updates: { sync_status: "synced" } },
      });
    } catch (error) {
      console.warn("Failed to sync with main store:", error);
      dispatch({
        type: "UPDATE_ORDER",
        payload: { id: orderId, updates: { sync_status: "error" } },
      });
    }
  };

  const uploadFile = async (
    file: File,
    orderType: string,
  ): Promise<{ url: string; previewUrl?: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderType", orderType);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: await getHeaders(),
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      return await response.json();
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
      throw error;
    }
  };

  const value: ServiceOrderContextType = {
    ...state,
    createOrder,
    updateOrder,
    getOrder,
    getUserOrders,
    requestQuote,
    acceptQuote,
    addStatusUpdate,
    syncWithStore,
    uploadFile,
  };

  return (
    <ServiceOrderContext.Provider value={value}>
      {children}
    </ServiceOrderContext.Provider>
  );
}

export function useServiceOrders() {
  const context = useContext(ServiceOrderContext);
  if (context === undefined) {
    throw new Error(
      "useServiceOrders must be used within a ServiceOrderProvider",
    );
  }
  return context;
}
