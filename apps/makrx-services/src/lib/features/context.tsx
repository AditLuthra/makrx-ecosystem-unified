/**
 * React context for feature flags management
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  FeatureAccessContext,
  UserAccessibleFeatures,
  FEATURE_FLAGS,
  FeatureFlagValue,
} from "./types";
import { featureFlagsClient } from "./client";

interface FeatureFlagsContextValue {
  // Current user context
  userContext: FeatureAccessContext;
  setUserContext: (context: Partial<FeatureAccessContext>) => void;

  // Available features
  availableFeatures: UserAccessibleFeatures | null;
  isLoading: boolean;
  error: string | null;

  // Feature checking methods
  isFeatureEnabled: (featureKey: FeatureFlagValue) => boolean;
  isBetaFeature: (featureKey: FeatureFlagValue) => boolean;
  requiresPassword: (featureKey: FeatureFlagValue) => boolean;

  // Service-specific helpers
  isServiceEnabled: (
    serviceType: "printing" | "laser" | "cnc" | "injection",
  ) => boolean;
  getEnabledServices: () => string[];

  // Admin helpers
  hasAdminAccess: () => boolean;
  hasProviderAccess: () => boolean;

  // Data management
  refreshFeatures: () => Promise<void>;
  clearCache: () => void;

  // Password management
  setFeaturePassword: (password: string) => void;
  clearFeaturePassword: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(
  null,
);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  initialContext?: Partial<FeatureAccessContext>;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function FeatureFlagsProvider({
  children,
  initialContext = {},
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: FeatureFlagsProviderProps) {
  const [userContext, setUserContextState] = useState<FeatureAccessContext>({
    user_roles: [],
    is_authenticated: false,
    ...initialContext,
  });

  const [availableFeatures, setAvailableFeatures] =
    useState<UserAccessibleFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load features when context changes
  useEffect(() => {
    loadFeatures();
  }, [userContext]);

  // Auto-refresh features
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadFeatures(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadFeatures = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const features =
        await featureFlagsClient.getAvailableFeatures(userContext);
      setAvailableFeatures(features);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load features";
      setError(errorMessage);
      console.error("Error loading features:", err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const setUserContext = (context: Partial<FeatureAccessContext>) => {
    setUserContextState((prev) => ({
      ...prev,
      ...context,
    }));
  };

  const isFeatureEnabled = (featureKey: FeatureFlagValue): boolean => {
    if (!availableFeatures) return false;
    return availableFeatures.enabled.includes(featureKey);
  };

  const isBetaFeature = (featureKey: FeatureFlagValue): boolean => {
    if (!availableFeatures) return false;
    return availableFeatures.beta.includes(featureKey);
  };

  const requiresPassword = (featureKey: FeatureFlagValue): boolean => {
    if (!availableFeatures) return false;
    return availableFeatures.password_protected.includes(featureKey);
  };

  const isServiceEnabled = (
    serviceType: "printing" | "laser" | "cnc" | "injection",
  ): boolean => {
    const serviceMap = {
      printing: FEATURE_FLAGS.SERVICE_3D_PRINTING,
      laser: FEATURE_FLAGS.SERVICE_LASER_ENGRAVING,
      cnc: FEATURE_FLAGS.SERVICE_CNC,
      injection: FEATURE_FLAGS.SERVICE_INJECTION_MOLDING,
    };

    return isFeatureEnabled(serviceMap[serviceType]);
  };

  const getEnabledServices = (): string[] => {
    const services = [];
    if (isServiceEnabled("printing")) services.push("3d-printing");
    if (isServiceEnabled("laser")) services.push("laser-engraving");
    if (isServiceEnabled("cnc")) services.push("cnc");
    if (isServiceEnabled("injection")) services.push("injection-molding");
    return services;
  };

  const hasAdminAccess = (): boolean => {
    return (
      userContext.user_roles.includes("admin") ||
      userContext.user_roles.includes("super_admin")
    );
  };

  const hasProviderAccess = (): boolean => {
    return userContext.user_roles.includes("provider") || hasAdminAccess();
  };

  const refreshFeatures = async (): Promise<void> => {
    await loadFeatures();
  };

  const clearCache = (): void => {
    featureFlagsClient.clearCache();
  };

  const setFeaturePassword = (password: string): void => {
    setUserContext({ feature_password: password });
  };

  const clearFeaturePassword = (): void => {
    setUserContext({ feature_password: undefined });
  };

  const contextValue: FeatureFlagsContextValue = {
    userContext,
    setUserContext,
    availableFeatures,
    isLoading,
    error,
    isFeatureEnabled,
    isBetaFeature,
    requiresPassword,
    isServiceEnabled,
    getEnabledServices,
    hasAdminAccess,
    hasProviderAccess,
    refreshFeatures,
    clearCache,
    setFeaturePassword,
    clearFeaturePassword,
  };

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}

// Convenience hooks for common use cases
export function useFeature(featureKey: FeatureFlagValue) {
  const { isFeatureEnabled, isBetaFeature, requiresPassword } =
    useFeatureFlags();

  return {
    isEnabled: isFeatureEnabled(featureKey),
    isBeta: isBetaFeature(featureKey),
    requiresPassword: requiresPassword(featureKey),
  };
}

export function useServiceFeatures() {
  const { isServiceEnabled, getEnabledServices } = useFeatureFlags();

  return {
    isServiceEnabled,
    enabledServices: getEnabledServices(),
    has3DPrinting: isServiceEnabled("printing"),
    hasLaserEngraving: isServiceEnabled("laser"),
    hasCNC: isServiceEnabled("cnc"),
    hasInjectionMolding: isServiceEnabled("injection"),
  };
}

export function useAdminFeatures() {
  const { hasAdminAccess, hasProviderAccess, isFeatureEnabled } =
    useFeatureFlags();

  return {
    hasAdminAccess: hasAdminAccess(),
    hasProviderAccess: hasProviderAccess(),
    canManageFeatureFlags:
      hasAdminAccess() && isFeatureEnabled(FEATURE_FLAGS.ADMIN_FEATURE_FLAGS),
    canViewAnalytics:
      hasAdminAccess() && isFeatureEnabled(FEATURE_FLAGS.ADMIN_ANALYTICS),
    canManageUsers:
      hasAdminAccess() && isFeatureEnabled(FEATURE_FLAGS.ADMIN_USER_MANAGEMENT),
  };
}
