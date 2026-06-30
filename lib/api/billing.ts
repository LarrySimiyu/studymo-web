import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export interface SubscriptionStatus {
  status: string; // 'none' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  plan: string | null; // 'weekly' | 'monthly' | 'yearly' | null
  isActive: boolean;
  hasAccess: boolean;
  isTrial: boolean;
  trialEnd: string | null;
  daysLeftInTrial: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  daysUntilRenewal: number | null;
}

export interface Plan {
  id: 'weekly' | 'monthly' | 'yearly';
  label: string;
  price: string;
  sub: string;
  priceId: string;
  trialDays: number | null;
  badge: string | null;
}

export const billingApi = {
  // Public endpoint — no auth token needed
  getPlans: async (): Promise<{ data: Plan[] | null; error: string | null }> => {
    try {
      const res = await fetch(`${API_URL}/billing/plans`);
      if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
      const data = await res.json() as Plan[];
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
  getStatus: () => api.get<SubscriptionStatus>('/billing/status'),
  createCheckout: (priceId: string) =>
    api.post<{ url: string }>('/billing/checkout', { priceId }),
  createPortal: () => api.post<{ url: string }>('/billing/portal', {}),
};
