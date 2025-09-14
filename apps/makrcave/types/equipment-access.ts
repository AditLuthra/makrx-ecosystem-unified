export interface EquipmentAccessPolicy {
  id: string;
  equipment_id: string;
  access_type: 'free' | 'subscription_only' | 'pay_per_use';
  membership_required?: boolean;
  price_per_unit?: number;
  cost_unit?: string;
  minimum_billing_time?: number;
  grace_period_minutes?: number;
  max_daily_cap?: number;
  overuse_penalty_flat?: number;
  overuse_penalty_percent?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  hourly_rate?: number;
}

export interface CostEstimate {
  total: number;
  breakdown: Array<{ label: string; amount: number }>;
}

export interface AccessCheckResult {
  canAccess: boolean;
  missingSkills: string[];
  reason?: string;
}

export interface UserSubscription {
  plan: string;
  included_equipment_types: string[];
}

export interface UserWallet {
  balance: number;
  currency: string;
}
