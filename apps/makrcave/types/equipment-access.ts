export type EquipmentAccessType = 'free' | 'subscription_only' | 'pay_per_use';

export interface EquipmentAccessPolicy {
  id: string;
  equipment_id: string;
  access_type: EquipmentAccessType;
  membership_required?: boolean;
  price_per_unit?: number;
  cost_unit?: 'minute' | 'hour';
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

export interface CostEstimateBreakdownEntry {
  label: string;
  value: string;
  amount?: number;
  description?: string;
}

export interface CostEstimate {
  equipment_id?: string;
  equipment_name?: string;
  duration_minutes?: number;
  base_cost?: number;
  grace_period_applied?: boolean;
  estimated_total: number;
  total?: number;
  currency?: string;
  breakdown: CostEstimateBreakdownEntry[];
  daily_usage_so_far?: number;
  daily_cap_reached?: boolean;
  notes?: string[];
}

export type AccessActionRequirement =
  | 'upgrade_subscription'
  | 'add_funds'
  | 'get_approval'
  | (string & {});

export interface AccessCheckResult {
  canAccess: boolean;
  missingSkills: string[];
  reason?: string;
  allowed?: boolean;
  required_action?: AccessActionRequirement;
}

export interface UserSubscription {
  plan: string;
  included_equipment_types: string[];
  status?: string;
  plan_name?: string;
  start_date?: string;
  end_date?: string;
}

export interface UserWallet {
  balance: number;
  currency: string;
  last_updated?: string;
}
