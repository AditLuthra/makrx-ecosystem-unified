/**
 * Custom hooks for feature flags functionality
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FeatureAccessContext,
  FeatureAvailabilityResponse,
  UserAccessibleFeatures,
  FeatureFlagValue,
  FEATURE_FLAGS,
  AccessLevel
} from './types';
import { featureFlagsClient } from './client';

/**
 * Hook for checking individual feature availability with real-time updates
 */
export function useFeatureCheck(
  featureKey: FeatureFlagValue,
  context?: Partial<FeatureAccessContext>
) {
  const [availability, setAvailability] = useState<FeatureAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkFeature = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await featureFlagsClient.checkFeatureAvailability(featureKey, context);
      setAvailability(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check feature');
    } finally {
      setIsLoading(false);
    }
  }, [featureKey, context]);

  useEffect(() => {
    checkFeature();
  }, [checkFeature]);

  return {
    isAvailable: availability?.available ?? false,
    availability,
    isLoading,
    error,
    refresh: checkFeature,
  };
}

/**
 * Hook for managing user's accessible features
 */
export function useUserFeatures(
  context?: Partial<FeatureAccessContext>,
  tags?: string[]
) {
  const [features, setFeatures] = useState<UserAccessibleFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await featureFlagsClient.getAvailableFeatures(context, tags);
      setFeatures(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load features');
    } finally {
      setIsLoading(false);
    }
  }, [context, tags]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // Helper methods
  const isEnabled = useCallback((featureKey: FeatureFlagValue) => {
    return features?.enabled.includes(featureKey) ?? false;
  }, [features]);

  const isBeta = useCallback((featureKey: FeatureFlagValue) => {
    return features?.beta.includes(featureKey) ?? false;
  }, [features]);

  const requiresPassword = useCallback((featureKey: FeatureFlagValue) => {
    return features?.password_protected.includes(featureKey) ?? false;
  }, [features]);

  return {
    features,
    isLoading,
    error,
    refresh: loadFeatures,
    isEnabled,
    isBeta,
    requiresPassword,
  };
}

/**
 * Hook for password-protected features
 */
export function usePasswordProtectedFeature(
  featureKey: FeatureFlagValue,
  baseContext?: Partial<FeatureAccessContext>
) {
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context = useMemo(() => ({
    ...baseContext,
    feature_password: password,
  }), [baseContext, password]);

  const { isAvailable, isLoading } = useFeatureCheck(featureKey, context);

  // Update unlocked state when availability changes
  useEffect(() => {
    if (!isLoading && password) {
      setIsUnlocked(isAvailable);
      if (!isAvailable) {
        setError('Invalid password');
      } else {
        setError(null);
      }
    }
  }, [isAvailable, isLoading, password]);

  const verifyPassword = useCallback(async (inputPassword: string) => {
    setIsVerifying(true);
    setError(null);
    setPassword(inputPassword);
    
    try {
      const result = await featureFlagsClient.checkFeatureAvailability(
        featureKey,
        { ...baseContext, feature_password: inputPassword }
      );
      
      if (result.available) {
        setIsUnlocked(true);
      } else {
        setError('Invalid password');
        setIsUnlocked(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setIsUnlocked(false);
    } finally {
      setIsVerifying(false);
    }
  }, [featureKey, baseContext]);

  const clearPassword = useCallback(() => {
    setPassword('');
    setIsUnlocked(false);
    setError(null);
  }, []);

  return {
    password,
    isUnlocked,
    isVerifying,
    error,
    verifyPassword,
    clearPassword,
  };
}

/**
 * Hook for A/B testing features
 */
export function useABTestFeature(
  featureKey: FeatureFlagValue,
  context?: Partial<FeatureAccessContext>
) {
  const { isAvailable, availability } = useFeatureCheck(featureKey, context);
  
  const variant = useMemo(() => {
    if (!isAvailable || !context?.user_id) return null;
    
    // Simple hash-based variant assignment
    const hash = Array.from(context.user_id + featureKey).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    
    return hash % 2 === 0 ? 'A' : 'B';
  }, [isAvailable, context?.user_id, featureKey]);

  return {
    isInTest: isAvailable,
    variant,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B',
    availability,
  };
}

/**
 * Hook for service-specific feature management
 */
export function useServiceFeatureManager(serviceType: 'printing' | 'laser' | 'cnc' | 'injection') {
  const serviceFeatureMap = {
    printing: [
      FEATURE_FLAGS.SERVICE_3D_PRINTING,
      FEATURE_FLAGS['3D_PRINT_MATERIAL_CALCULATOR'],
      FEATURE_FLAGS['3D_PRINT_BULK_ORDERS'],
      FEATURE_FLAGS['3D_PRINT_RUSH_ORDERS'],
    ],
    laser: [
      FEATURE_FLAGS.SERVICE_LASER_ENGRAVING,
      FEATURE_FLAGS.LASER_CUSTOM_MATERIALS,
    ],
    cnc: [
      FEATURE_FLAGS.SERVICE_CNC,
      FEATURE_FLAGS.CNC_CUSTOM_TOOLING,
    ],
    injection: [
      FEATURE_FLAGS.SERVICE_INJECTION_MOLDING,
    ],
  };

  const relevantFeatures = serviceFeatureMap[serviceType];
  const { features } = useUserFeatures();

  const enabledFeatures = useMemo(() => {
    if (!features) return [];
    return relevantFeatures.filter(feature => features.enabled.includes(feature));
  }, [features, relevantFeatures]);

  const isServiceEnabled = useMemo(() => {
    const mainServiceFeature = relevantFeatures[0];
    return features?.enabled.includes(mainServiceFeature) ?? false;
  }, [features, relevantFeatures]);

  const betaFeatures = useMemo(() => {
    if (!features) return [];
    return relevantFeatures.filter(feature => features.beta.includes(feature));
  }, [features, relevantFeatures]);

  return {
    isServiceEnabled,
    enabledFeatures,
    betaFeatures,
    totalFeatures: relevantFeatures.length,
    enabledCount: enabledFeatures.length,
  };
}

/**
 * Hook for admin feature flag management
 */
export function useAdminFeatureFlags(authToken?: string) {
  const [allFlags, setAllFlags] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllFlags = useCallback(async () => {
    if (!authToken) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await featureFlagsClient.getAllFeatureFlags(authToken);
      setAllFlags(result.flags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const loadAnalytics = useCallback(async () => {
    if (!authToken) return;
    
    try {
      const result = await featureFlagsClient.getAnalytics(authToken);
      setAnalytics(result);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, [authToken]);

  const updateFlag = useCallback(async (
    featureKey: string,
    updates: Partial<{ access_level: AccessLevel; name: string; description: string }>
  ) => {
    if (!authToken) return;
    
    try {
      await featureFlagsClient.updateFeatureFlag(featureKey, updates, authToken);
      await loadAllFlags(); // Refresh after update
    } catch (err) {
      throw err;
    }
  }, [authToken, loadAllFlags]);

  const createOverride = useCallback(async (
    featureKey: string,
    accessLevel: AccessLevel
  ) => {
    if (!authToken) return;
    
    try {
      await featureFlagsClient.createRuntimeOverride(featureKey, accessLevel, authToken);
      await loadAllFlags(); // Refresh after update
    } catch (err) {
      throw err;
    }
  }, [authToken, loadAllFlags]);

  const removeOverride = useCallback(async (featureKey: string) => {
    if (!authToken) return;
    
    try {
      await featureFlagsClient.removeRuntimeOverride(featureKey, authToken);
      await loadAllFlags(); // Refresh after update
    } catch (err) {
      throw err;
    }
  }, [authToken, loadAllFlags]);

  const bulkUpdate = useCallback(async (flagsWithLevels: Record<string, AccessLevel>) => {
    if (!authToken) return;
    
    try {
      await featureFlagsClient.bulkUpdateFeatureFlags(flagsWithLevels, authToken);
      await loadAllFlags(); // Refresh after update
    } catch (err) {
      throw err;
    }
  }, [authToken, loadAllFlags]);

  useEffect(() => {
    loadAllFlags();
    loadAnalytics();
  }, [loadAllFlags, loadAnalytics]);

  return {
    allFlags,
    analytics,
    isLoading,
    error,
    updateFlag,
    createOverride,
    removeOverride,
    bulkUpdate,
    refresh: loadAllFlags,
  };
}

/**
 * Hook for feature flag debugging and development
 */
export function useFeatureFlagDebug() {
  const [debugMode, setDebugMode] = useState(false);
  const [testContext, setTestContext] = useState<FeatureAccessContext>({
    user_id: 'test-user',
    user_roles: ['user'],
    is_authenticated: true,
  });

  const toggleDebugMode = useCallback(() => {
    setDebugMode(prev => !prev);
  }, []);

  const updateTestContext = useCallback((updates: Partial<FeatureAccessContext>) => {
    setTestContext(prev => ({ ...prev, ...updates }));
  }, []);

  // Test different user roles
  const testAsRole = useCallback((role: string) => {
    updateTestContext({ user_roles: [role] });
  }, [updateTestContext]);

  const testAsBetaUser = useCallback(() => {
    updateTestContext({ user_roles: ['user', 'beta_user'] });
  }, [updateTestContext]);

  const testAsProvider = useCallback(() => {
    updateTestContext({ user_roles: ['provider'] });
  }, [updateTestContext]);

  const testAsAdmin = useCallback(() => {
    updateTestContext({ user_roles: ['admin'] });
  }, [updateTestContext]);

  const { features: debugFeatures } = useUserFeatures(testContext);

  return {
    debugMode,
    testContext,
    debugFeatures,
    toggleDebugMode,
    updateTestContext,
    testAsRole,
    testAsBetaUser,
    testAsProvider,
    testAsAdmin,
  };
}