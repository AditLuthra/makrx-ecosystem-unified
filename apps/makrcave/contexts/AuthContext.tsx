'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useKeycloak } from '@makrx/auth';

type Role = 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'user' | string;

export interface AuthUser {
  id: string;
  user_id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles: string[];
  role?: Role;
  membership_tier?: string | null;
  // Legacy/compat fields used across the app
  assignedMakerspaces?: string[];
  makerspace_id?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  // Keep a permissive signature to match various call sites
  hasPermission: (scope: string, action?: string, context?: unknown) => boolean;
  // Convenience flags expected by some components
  isSuperAdmin: boolean;
  isMakerspaceAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const kc = useKeycloak();

  const value: AuthContextValue = useMemo(() => {
    const u = kc.user;
    const roles = u?.roles || [];
    const displayName = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email;
    const primaryRole = (roles[0] as Role) || 'user';
    const mappedUser: AuthUser | null = u
      ? {
          id: u.id,
          user_id: u.id,
          email: u.email,
          firstName: (u as any).firstName,
          lastName: (u as any).lastName,
          name: displayName || undefined,
          avatarUrl: (u as any).avatarUrl,
          roles,
          role: primaryRole,
          membership_tier: null,
        }
      : null;

    const hasRole = (r: string) => roles.includes(r);
    // Simple permission model: map to roles. Accepts optional action/context for compatibility.
    const hasPermission = (scope: string, _action?: string, _context?: unknown) => {
      if (roles.includes('super_admin')) return true;
      if (scope === 'admin') return roles.includes('admin') || roles.includes('makerspace_admin');
      // Allow basic access for authenticated users; refine as needed.
      return roles.length > 0;
    };

    return {
      user: mappedUser,
      isAuthenticated: kc.isAuthenticated,
      isLoading: kc.isLoading,
      login: kc.login,
      logout: kc.logout,
      hasRole,
      hasPermission,
      isSuperAdmin: roles.includes('super_admin'),
      isMakerspaceAdmin: roles.includes('makerspace_admin'),
    };
  }, [kc.user, kc.isAuthenticated, kc.isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
