'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface Makerspace {
  id: string;
  name: string;
  slug?: string;
  timezone?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category?: string;
  quantity?: number;
  makerspaceId?: string;
  status?: string;
  history?: any[];
  sku?: string;
  location?: string;
  description?: string;
  lastUpdatedAt?: string;
}

interface EquipmentItem {
  id: string;
  equipment_id?: string;
  name: string;
  status?: string;
  category?: string;
  sub_category?: string;
  type?: string;
  location?: string;
  linked_makerspace_id?: string;
  requires_certification?: boolean;
  certification_required?: string;
  requiredCertifications?: string[];
  required_skills?: string[];
  skillsRequired?: string[];
  hourlyRate?: number;
  hourly_rate?: number;
  deposit_required?: boolean;
  total_usage_hours?: number;
  usage_count?: number;
  average_rating?: number;
  total_ratings?: number;
  manufacturer?: string;
  model?: string;
  description?: string;
  image_url?: string;
  imageUrl?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  healthScore?: number;
  utilizationRate?: number;
  sensors?: Array<{ id: string; type: string; status: string }>;
  totalDowntime?: number;
  maintenanceCost?: number;
  operating_hours?: Record<string, unknown>;
  is_available?: boolean;
  current_issue?: string;
  estimated_repair_time?: string;
  maintenance_status?: string;
  peak_usage_times?: string[];
  uptime_percentage?: number;
  reservation_count?: number;
  nextAvailable?: string;
}

interface MakerspaceContextValue {
  currentMakerspace: Makerspace | null;
  setCurrentMakerspace: (m: Makerspace | null) => void;
  allMakerspaces: Makerspace[];
  // Inventory (legacy API used by several components)
  inventory: InventoryItem[];
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: Partial<InventoryItem>) => Promise<void> | void;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => Promise<void> | void;
  issueInventoryItem: (id: string, qty: number, reason?: string) => Promise<void> | void;
  restockInventoryItem: (id: string, qty: number, reason?: string) => Promise<void> | void;
  deleteInventoryItem: (id: string) => Promise<void> | void;
  loadInventoryItems: () => Promise<void> | void;
  // Equipment list for access/policy components
  equipment: EquipmentItem[];
}

const Ctx = createContext<MakerspaceContextValue | null>(null);

export function MakerspaceProvider({ children }: { children: ReactNode }) {
  const [currentMakerspace, setCurrentMakerspace] = useState<Makerspace | null>(null);
  const value: MakerspaceContextValue = {
    currentMakerspace,
    setCurrentMakerspace,
    allMakerspaces: [],
    inventory: [],
    inventoryItems: [],
    addInventoryItem: async () => {},
    updateInventoryItem: async () => {},
    issueInventoryItem: async () => {},
    restockInventoryItem: async () => {},
    deleteInventoryItem: async () => {},
    loadInventoryItems: async () => {},
    equipment: [],
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMakerspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMakerspace must be used within MakerspaceProvider');
  return ctx;
}

// Backward-compatible alias for legacy imports
export const useMakerspaceContext = useMakerspace;
