/**
 * Feature flags API client for frontend
 */

import {
  FeatureAvailabilityResponse,
  UserAccessibleFeatures,
  FeatureAccessContext,
  FeatureFlag,
  FeatureFlagConfiguration,
  AccessLevel,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class FeatureFlagsClient {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Check if a specific feature is available for the current user context
   */
  async checkFeatureAvailability(
    featureKey: string,
    context?: Partial<FeatureAccessContext>,
  ): Promise<FeatureAvailabilityResponse> {
    const cacheKey = `check-${featureKey}-${JSON.stringify(context)}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (context?.user_id) params.append("user_id", context.user_id);
    if (context?.feature_password)
      params.append("password", context.feature_password);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (context?.feature_password) {
      headers["X-Feature-Password"] = context.feature_password;
    }

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/check/${featureKey}?${params}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to check feature availability: ${response.statusText}`,
      );
    }

    const data = await response.json();
    this.setCachedData(cacheKey, data, 2 * 60 * 1000); // 2 minutes for availability checks

    return data;
  }

  /**
   * Get all features available to the current user
   */
  async getAvailableFeatures(
    context?: Partial<FeatureAccessContext>,
    tags?: string[],
  ): Promise<UserAccessibleFeatures> {
    const cacheKey = `available-${JSON.stringify(context)}-${tags?.join(",")}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (context?.user_id) params.append("user_id", context.user_id);
    if (context?.feature_password)
      params.append("password", context.feature_password);
    if (tags && tags.length > 0) params.append("tags", tags.join(","));

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (context?.feature_password) {
      headers["X-Feature-Password"] = context.feature_password;
    }

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/available?${params}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get available features: ${response.statusText}`,
      );
    }

    const data = await response.json();
    this.setCachedData(cacheKey, data);

    return data;
  }

  /**
   * Get public features summary (no authentication required)
   */
  async getPublicFeaturesSummary(): Promise<{
    total_flags: number;
    by_access_level: Record<string, number>;
    by_tag: Record<string, number>;
    public_features: Array<{ key: string; name: string; tags: string[] }>;
  }> {
    const cacheKey = "public-summary";
    const cached = this.getCachedData(cacheKey, 10 * 60 * 1000); // 10 minutes for public data

    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/public/summary`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get public features summary: ${response.statusText}`,
      );
    }

    const data = await response.json();
    this.setCachedData(cacheKey, data, 10 * 60 * 1000);

    return data;
  }

  /**
   * Test feature access for specific user context (development/testing)
   */
  async testFeatureAccess(context: FeatureAccessContext): Promise<{
    test_context: FeatureAccessContext;
    accessible_features: UserAccessibleFeatures;
  }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/test-access`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to test feature access: ${response.statusText}`);
    }

    return response.json();
  }

  // Admin methods (require authentication and admin role)

  /**
   * Get all feature flags with full details (admin only)
   */
  async getAllFeatureFlags(
    authToken: string,
  ): Promise<{ flags: FeatureFlag[] }> {
    const response = await fetch(`${API_BASE}/api/v1/feature-flags/admin/all`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get all feature flags: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get detailed information about a specific feature flag
   */
  async getFeatureFlagDetails(
    featureKey: string,
    authToken: string,
  ): Promise<{
    flag: FeatureFlag;
    is_override: boolean;
    usage_analytics: any;
  }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/${featureKey}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get feature flag details: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(
    flagData: {
      key: string;
      name: string;
      description: string;
      access_level?: AccessLevel;
      allowed_roles?: string[];
      allowed_users?: string[];
      password?: string;
      tags?: string[];
    },
    authToken: string,
  ): Promise<{ message: string; flag: FeatureFlag }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flagData),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create feature flag: ${response.statusText}`);
    }

    // Clear cache after modification
    this.clearCache();

    return response.json();
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(
    featureKey: string,
    updates: Partial<{
      access_level: AccessLevel;
      name: string;
      description: string;
      allowed_roles: string[];
      allowed_users: string[];
      password: string;
      tags: string[];
    }>,
    authToken: string,
  ): Promise<{ message: string; flag: FeatureFlag }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/${featureKey}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update feature flag: ${response.statusText}`);
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Bulk update access levels for multiple feature flags
   */
  async bulkUpdateFeatureFlags(
    flagsWithLevels: Record<string, AccessLevel>,
    authToken: string,
  ): Promise<{ message: string; updated_flags: string[] }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/bulk-update`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flags: flagsWithLevels }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to bulk update feature flags: ${response.statusText}`,
      );
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Create a runtime override for a feature flag
   */
  async createRuntimeOverride(
    featureKey: string,
    accessLevel: AccessLevel,
    authToken: string,
  ): Promise<{ message: string; override: FeatureFlag }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/${featureKey}/override`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accessLevel),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create runtime override: ${response.statusText}`,
      );
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Remove a runtime override
   */
  async removeRuntimeOverride(
    featureKey: string,
    authToken: string,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/${featureKey}/override`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to remove runtime override: ${response.statusText}`,
      );
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Delete a feature flag completely
   */
  async deleteFeatureFlag(
    featureKey: string,
    authToken: string,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/${featureKey}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete feature flag: ${response.statusText}`);
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Get analytics data for feature flag usage
   */
  async getAnalytics(authToken: string): Promise<{
    analytics: any;
    summary: any;
  }> {
    const cacheKey = "analytics";
    const cached = this.getCachedData(cacheKey, 60 * 1000); // 1 minute cache for analytics

    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/analytics`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get analytics: ${response.statusText}`);
    }

    const data = await response.json();
    this.setCachedData(cacheKey, data, 60 * 1000);

    return data;
  }

  /**
   * Export feature flag configuration
   */
  async exportConfiguration(
    authToken: string,
    includeAnalytics: boolean = false,
  ): Promise<FeatureFlagConfiguration> {
    const params = new URLSearchParams();
    if (includeAnalytics) params.append("include_analytics", "true");

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/export?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to export configuration: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Import feature flag configuration
   */
  async importConfiguration(
    configData: FeatureFlagConfiguration,
    authToken: string,
    merge: boolean = true,
  ): Promise<{ message: string; summary: any }> {
    const params = new URLSearchParams();
    if (!merge) params.append("merge", "false");

    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/import?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to import configuration: ${response.statusText}`);
    }

    this.clearCache();

    return response.json();
  }

  /**
   * Grant beta access to specific features for a user
   */
  async grantBetaAccess(
    userId: string,
    featureKeys: string[],
    authToken: string,
  ): Promise<{ message: string; features: string[] }> {
    const response = await fetch(
      `${API_BASE}/api/v1/feature-flags/admin/beta-access`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userId, featureKeys),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to grant beta access: ${response.statusText}`);
    }

    this.clearCache();

    return response.json();
  }

  // Cache management methods

  private getCachedData(key: string, customTtl?: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const ttl = customTtl || cached.ttl;
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any, customTtl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.CACHE_TTL,
    });
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  public getCacheStats(): {
    size: number;
    keys: string[];
    totalMemory: number;
  } {
    const keys = Array.from(this.cache.keys());
    return {
      size: this.cache.size,
      keys,
      totalMemory: JSON.stringify(Array.from(this.cache.entries())).length,
    };
  }
}

// Export singleton instance
export const featureFlagsClient = new FeatureFlagsClient();
