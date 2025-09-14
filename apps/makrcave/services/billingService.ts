export interface EquipmentAccessPolicy {
  id: string;
  equipment_id: string;
  access_type: "free" | "subscription_only" | "pay_per_use";
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
  equipment_name?: string;
  estimated_total?: number; // for compatibility
  daily_cap_reached?: boolean;
}

export interface AccessCheckResult {
  canAccess: boolean;
  missingSkills: string[];
  reason?: string;
  allowed?: boolean; // for compatibility
  required_action?: string;
}

export interface UserSubscription {
  plan: string;
  included_equipment_types: string[];
  status?: string;
  plan_name?: string;
  end_date?: string;
  start_date?: string;
}

export interface UserWallet {
  balance: number;
  currency: string;
  last_updated?: string;
}

export class EquipmentBillingService {
  static async getUserWallet(_userId: string): Promise<UserWallet> {
    return {
      balance: 0,
      currency: "INR",
      last_updated: new Date().toISOString(),
    };
  }
  static async getUserSubscription(_userId: string): Promise<UserSubscription> {
    return {
      plan: "basic",
      included_equipment_types: [],
      status: "active",
      plan_name: "Basic",
      start_date: "",
      end_date: "",
    };
  }
  static async getDailyUsage(
    _userId: string,
    _equipmentId: string,
    _date: Date
  ): Promise<number> {
    return 0;
  }
  static calculateCost(
    policy: EquipmentAccessPolicy,
    durationMinutes: number,
    _dailyUsage: number
  ): CostEstimate | null {
    const rate = policy.hourly_rate ?? 0;
    const hours = Math.max(0, durationMinutes) / 60;
    return {
      total: parseFloat((rate * hours).toFixed(2)),
      breakdown: [
        { label: "Usage", amount: parseFloat((rate * hours).toFixed(2)) },
      ],
      equipment_name: "",
      estimated_total: parseFloat((rate * hours).toFixed(2)),
      daily_cap_reached: false,
    };
  }
  static checkAccess(
    _policy: EquipmentAccessPolicy,
    _sub?: UserSubscription,
    _wallet?: UserWallet,
    _amount?: number
  ): AccessCheckResult {
    return { canAccess: true, missingSkills: [], allowed: true };
  }
  static getPricingDisplay(policy: EquipmentAccessPolicy): string {
    if (policy.access_type === "free") return "Free";
    if (policy.access_type === "subscription_only") return "Subscription";
    return `₹${policy.hourly_rate ?? 0}/hr`;
  }
  static async processPayment(
    _userId: string,
    _amount: number,
    _ref: string,
    _desc?: string
  ): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
