export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  max_organizations: number;
  max_products: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  plan_slug: string;
  price: number;
  max_organizations: number;
  max_products: number;
  features: string[];
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  organizations: {
    current: number;
    max: number;
    unlimited: boolean;
  };
  products: {
    current: number;
    max: number;
    unlimited: boolean;
  };
}

export interface SubscriptionResponse {
  subscription: UserSubscription;
  usage: UsageStats;
}

export interface SubscriptionHistory {
  id: number;
  user_id: number;
  from_plan_id: number | null;
  to_plan_id: number;
  from_plan_name: string | null;
  from_plan_slug: string | null;
  to_plan_name: string;
  to_plan_slug: string;
  changed_at: string;
  reason: 'upgrade' | 'downgrade' | 'initial' | 'renewal' | 'cancellation';
  notes: string | null;
}
