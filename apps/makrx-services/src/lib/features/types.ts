/**
 * TypeScript types for feature flags system
 */

export enum AccessLevel {
  DISABLED = "disabled",
  BETA = "beta",
  PASSWORD_ONLY = "password_only",
  ROLE_BASED = "role_based",
  ENABLED = "enabled",
  A_B_TEST = "a_b_test",
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  access_level: AccessLevel;
  allowed_roles: string[];
  allowed_users: string[];
  password?: string;
  ab_percentage: number;
  ab_variant?: string;
  start_date?: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  depends_on: string[];
  conflicts_with: string[];
}

export interface FeatureAccessContext {
  user_id?: string;
  user_roles: string[];
  feature_password?: string;
  is_authenticated: boolean;
}

export interface FeatureAvailabilityResponse {
  feature_key: string;
  available: boolean;
  access_level: string;
  name: string;
  help?: string;
}

export interface UserAccessibleFeatures {
  enabled: string[];
  beta: string[];
  password_protected: string[];
  role_restricted: string[];
  disabled: string[];
  total: number;
}

export interface FeatureFlagConfiguration {
  flags: FeatureFlag[];
  overrides: Record<string, FeatureFlag>;
  analytics?: any;
}

// Core feature flag constants - keep in sync with backend
export const FEATURE_FLAGS = {
  // Core Platform Features
  USER_REGISTRATION: "USER_REGISTRATION",
  GUEST_CHECKOUT: "GUEST_CHECKOUT",
  SOCIAL_LOGIN: "SOCIAL_LOGIN",

  // Services
  SERVICE_3D_PRINTING: "SERVICE_3D_PRINTING",
  SERVICE_LASER_ENGRAVING: "SERVICE_LASER_ENGRAVING",
  SERVICE_CNC: "SERVICE_CNC",
  SERVICE_INJECTION_MOLDING: "SERVICE_INJECTION_MOLDING",

  // 3D Printing Features
  "3D_PRINT_MATERIAL_CALCULATOR": "3D_PRINT_MATERIAL_CALCULATOR",
  "3D_PRINT_BULK_ORDERS": "3D_PRINT_BULK_ORDERS",
  "3D_PRINT_RUSH_ORDERS": "3D_PRINT_RUSH_ORDERS",

  // Laser Features
  LASER_CUSTOM_MATERIALS: "LASER_CUSTOM_MATERIALS",

  // CNC Features
  CNC_CUSTOM_TOOLING: "CNC_CUSTOM_TOOLING",

  // File Processing
  FILE_UPLOAD_3D: "FILE_UPLOAD_3D",
  FILE_UPLOAD_2D: "FILE_UPLOAD_2D",
  FILE_PREVIEW_3D: "FILE_PREVIEW_3D",
  FILE_ANALYSIS: "FILE_ANALYSIS",
  FILE_AUTO_REPAIR: "FILE_AUTO_REPAIR",

  // Provider Features
  PROVIDER_DASHBOARD: "PROVIDER_DASHBOARD",
  PROVIDER_REAL_TIME_JOBS: "PROVIDER_REAL_TIME_JOBS",
  PROVIDER_INVENTORY_MANAGEMENT: "PROVIDER_INVENTORY_MANAGEMENT",
  PROVIDER_ANALYTICS: "PROVIDER_ANALYTICS",
  PROVIDER_MULTI_SERVICE: "PROVIDER_MULTI_SERVICE",

  // Order Management
  CROSS_PLATFORM_ORDERS: "CROSS_PLATFORM_ORDERS",
  REAL_TIME_ORDER_UPDATES: "REAL_TIME_ORDER_UPDATES",
  ORDER_TRACKING_ADVANCED: "ORDER_TRACKING_ADVANCED",
  ORDER_MODIFICATION: "ORDER_MODIFICATION",

  // Pricing & Payments
  DYNAMIC_PRICING: "DYNAMIC_PRICING",
  BULK_PRICING: "BULK_PRICING",
  SUBSCRIPTION_PRICING: "SUBSCRIPTION_PRICING",

  // Communication
  CUSTOMER_PROVIDER_CHAT: "CUSTOMER_PROVIDER_CHAT",
  VIDEO_CONSULTATIONS: "VIDEO_CONSULTATIONS",
  PHOTO_UPDATES: "PHOTO_UPDATES",

  // Quality & Reviews
  REVIEW_SYSTEM: "REVIEW_SYSTEM",
  QUALITY_ASSURANCE: "QUALITY_ASSURANCE",
  DISPUTE_RESOLUTION: "DISPUTE_RESOLUTION",

  // Admin Features
  ADMIN_FEATURE_FLAGS: "ADMIN_FEATURE_FLAGS",
  ADMIN_ANALYTICS: "ADMIN_ANALYTICS",
  ADMIN_USER_MANAGEMENT: "ADMIN_USER_MANAGEMENT",

  // Experimental Features
  AI_DESIGN_SUGGESTIONS: "AI_DESIGN_SUGGESTIONS",
  AR_PREVIEW: "AR_PREVIEW",
  BLOCKCHAIN_TRACKING: "BLOCKCHAIN_TRACKING",
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = (typeof FEATURE_FLAGS)[FeatureFlagKey];

// Feature tags for categorization
export const FEATURE_TAGS = {
  CORE: "core",
  AUTH: "auth",
  SERVICE: "service",
  PROVIDER: "provider",
  ADMIN: "admin",
  EXPERIMENTAL: "experimental",
  BETA: "beta",
  FILE_PROCESSING: "file-processing",
  ORDERS: "orders",
  PRICING: "pricing",
  COMMUNICATION: "communication",
  QUALITY: "quality",
  ANALYTICS: "analytics",
  "3D_PRINTING": "3d-printing",
  LASER: "laser",
  CNC: "cnc",
  INJECTION_MOLDING: "injection-molding",
} as const;

// Service-specific feature groups
export const SERVICE_FEATURES = {
  "3D_PRINTING": [
    FEATURE_FLAGS.SERVICE_3D_PRINTING,
    FEATURE_FLAGS["3D_PRINT_MATERIAL_CALCULATOR"],
    FEATURE_FLAGS["3D_PRINT_BULK_ORDERS"],
    FEATURE_FLAGS["3D_PRINT_RUSH_ORDERS"],
  ],
  LASER_ENGRAVING: [
    FEATURE_FLAGS.SERVICE_LASER_ENGRAVING,
    FEATURE_FLAGS.LASER_CUSTOM_MATERIALS,
  ],
  CNC: [FEATURE_FLAGS.SERVICE_CNC, FEATURE_FLAGS.CNC_CUSTOM_TOOLING],
  INJECTION_MOLDING: [FEATURE_FLAGS.SERVICE_INJECTION_MOLDING],
} as const;

// Provider-specific features
export const PROVIDER_FEATURES = [
  FEATURE_FLAGS.PROVIDER_DASHBOARD,
  FEATURE_FLAGS.PROVIDER_REAL_TIME_JOBS,
  FEATURE_FLAGS.PROVIDER_INVENTORY_MANAGEMENT,
  FEATURE_FLAGS.PROVIDER_ANALYTICS,
  FEATURE_FLAGS.PROVIDER_MULTI_SERVICE,
] as const;

// Admin-only features
export const ADMIN_FEATURES = [
  FEATURE_FLAGS.ADMIN_FEATURE_FLAGS,
  FEATURE_FLAGS.ADMIN_ANALYTICS,
  FEATURE_FLAGS.ADMIN_USER_MANAGEMENT,
] as const;

// Experimental features requiring special access
export const EXPERIMENTAL_FEATURES = [
  FEATURE_FLAGS.AI_DESIGN_SUGGESTIONS,
  FEATURE_FLAGS.AR_PREVIEW,
  FEATURE_FLAGS.BLOCKCHAIN_TRACKING,
] as readonly FeatureFlagValue[];
