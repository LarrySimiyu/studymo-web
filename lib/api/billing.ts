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

export const billingApi = {
  getStatus: () => api.get<SubscriptionStatus>('/billing/status'),
  createCheckout: (priceId: string) =>
    api.post<{ url: string }>('/billing/checkout', { priceId }),
  createPortal: () => api.post<{ url: string }>('/billing/portal', {}),
};
