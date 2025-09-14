"use client";

import { useKeycloak } from '@makrx/auth';

export function useAuth() {
  const { user, isLoading, isAuthenticated, login, logout, hasRole } = useKeycloak();

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole: (role: string) => hasRole(role),
    hasAnyRole: (roles: string[]) => roles.some(role => hasRole(role)),
    isAdmin: hasRole('event_admin') || hasRole('super_admin'),
    isSuperAdmin: hasRole('super_admin'),
  };
}