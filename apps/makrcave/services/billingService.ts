import {
  EquipmentAccessPolicy,
  CostEstimate,
  AccessCheckResult,
  UserSubscription,
  UserWallet,
} from '../types/equipment-access';

export class EquipmentBillingService {
  static async getUserWallet(_userId: string): Promise<UserWallet> {
    return {
      balance: 0,
      currency: 'INR',
      last_updated: new Date().toISOString(),
    };
  }
  static async getUserSubscription(_userId: string): Promise<UserSubscription> {
    return {
      plan: 'basic',
      included_equipment_types: [],
      status: 'active',
      plan_name: 'Basic',
      start_date: '',
      end_date: '',
    };
  }
  static async getDailyUsage(_userId: string, _equipmentId: string, _date: Date): Promise<number> {
    return 0;
  }
  static calculateCost(
    policy: EquipmentAccessPolicy,
    durationMinutes: number,
    _dailyUsage: number,
  ): CostEstimate | null {
    const rate = policy.hourly_rate ?? 0;
    const hours = Math.max(0, durationMinutes) / 60;
    return {
      total: parseFloat((rate * hours).toFixed(2)),
      breakdown: [
        {
          label: 'Usage',
          amount: parseFloat((rate * hours).toFixed(2)),
          value: `₹${(rate * hours).toFixed(2)}`,
        },
      ],
      equipment_name: '',
      estimated_total: parseFloat((rate * hours).toFixed(2)),
      daily_cap_reached: false,
    };
  }
  static checkAccess(
    _policy: EquipmentAccessPolicy,
    _sub?: UserSubscription,
    _wallet?: UserWallet,
    _amount?: number,
  ): AccessCheckResult {
    return { canAccess: true, missingSkills: [], allowed: true };
  }
  static getPricingDisplay(policy: EquipmentAccessPolicy): string {
    if (policy.access_type === 'free') return 'Free';
    if (policy.access_type === 'subscription_only') return 'Subscription';
    return `₹${policy.hourly_rate ?? 0}/hr`;
  }
  static async processPayment(
    _userId: string,
    _amount: number,
    _ref: string,
    _desc?: string,
  ): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
