'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface Makerspace {
  id: string;
  name: string;
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
}
interface EquipmentItem {
  id: string;
  equipment_id?: string;
  name: string;
  status?: string;
  category?: string;
  type?: string;
  requiredCertifications?: string[];
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
