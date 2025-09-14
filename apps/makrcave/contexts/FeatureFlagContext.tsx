'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import type { UserRole } from '@makrx/types';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedRoles: UserRole[];
  environment: 'all' | 'development' | 'staging' | 'production';
  updatedAt: string;
}

interface AccessResult {
  hasAccess: boolean;
  flag?: FeatureFlag;
  reason?: 'disabled' | 'insufficient_role' | 'environment_mismatch' | 'not_found';
}

interface FeatureFlagContextValue {
  getAllFlags: () => FeatureFlag[];
  isEnabled: (id: string, role?: UserRole) => boolean;
  // Legacy aliases expected in some components
  hasFeatureAccess: (id: string, role?: UserRole) => AccessResult;
  isFeatureEnabled: (id: string, role?: UserRole) => boolean;
  updateFlag: (id: string, patch: Partial<FeatureFlag>) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

const now = new Date().toISOString();
const defaultFlags: FeatureFlag[] = [
  { id: 'dashboard.newAnalytics', name: 'New Analytics', description: 'Enable new analytics widgets', enabled: true, allowedRoles: ['super_admin','admin'], environment: 'all', updatedAt: now },
  { id: 'projects.publicShowcase', name: 'Public Showcase', description: 'Enable project showcase', enabled: true, allowedRoles: ['user','service_provider','makerspace_admin','admin','super_admin'], environment: 'all', updatedAt: now },
  { id: 'admin.makerspaces', name: 'Makerspaces Admin', description: 'Manage makerspaces', enabled: true, allowedRoles: ['super_admin'], environment: 'all', updatedAt: now },
];

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags);

  const value = useMemo<FeatureFlagContextValue>(() => ({
    getAllFlags: () => flags,
    isEnabled: (id: string, role?: UserRole) => {
      const f = flags.find(f => f.id === id);
      if (!f) return false;
      if (!f.enabled) return false;
      if (!role) return true;
      return f.allowedRoles.includes(role);
    },
    hasFeatureAccess: (id: string, role?: UserRole) => {
      const f = flags.find(f => f.id === id);
      if (!f) return { hasAccess: false, reason: 'not_found' };
      if (!f.enabled) return { hasAccess: false, reason: 'disabled', flag: f };
      if (!role) return { hasAccess: true, flag: f };
      const hasRole = f.allowedRoles.includes(role);
      return { hasAccess: hasRole, reason: hasRole ? undefined : 'insufficient_role', flag: f };
    },
    isFeatureEnabled: (id: string, role?: UserRole) => {
      const f = flags.find(f => f.id === id);
      if (!f) return false;
      if (!f.enabled) return false;
      if (!role) return true;
      return f.allowedRoles.includes(role);
    },
    updateFlag: (id, patch) => {
      setFlags(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
    },
  }), [flags]);

  return (
    <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  return ctx;
}
