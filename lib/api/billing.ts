import { api } from '@/lib/api';

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
  getPlans: () => api.get<Plan[]>('/billing/plans'),
  getStatus: () => api.get<SubscriptionStatus>('/billing/status'),
  createCheckout: (priceId: string) =>
    api.post<{ url: string }>('/billing/checkout', { priceId }),
  createPortal: () => api.post<{ url: string }>('/billing/portal', {}),
};
