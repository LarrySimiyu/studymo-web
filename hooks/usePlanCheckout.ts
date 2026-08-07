'use client';

import { useState, useEffect, useCallback } from 'react';
import { billingApi, type Plan } from '@/lib/api/billing';
import { analytics } from '@/lib/analytics';
import { gaPlanSelected } from '@/lib/analytics/ga';
import { useAuth } from '@/hooks/useAuth';

interface Options {
  /** The paywall only fetches while it's open. The pricing page is always on. */
  enabled?: boolean;
  /** A signed-in user picking Free — the surface decides where it goes. */
  onFree?: () => void;
  /** Signed out: every column just means "make me an account". */
  onUnauthenticated?: () => void;
}

/**
 * Plan list + CTA behaviour, shared by /pricing and PaywallModal.
 *
 * A subscriber never reaches Checkout — a second session would open a second
 * parallel Stripe subscription and bill them twice. They go to the billing
 * portal's plan picker instead.
 */
export function usePlanCheckout({ enabled = true, onFree, onUnauthenticated }: Options = {}) {
  const { currentUser, subscriptionStatus } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pendingId, setPendingId] = useState<Plan['id'] | null>(null);

  // Access is the gate, not the plan name — an active subscription whose plan didn't
  // resolve (an old price id) must still be kept away from Checkout.
  const hasSubscription = subscriptionStatus?.hasAccess === true;
  // A signed-in user without a subscription is on Free — say so, or the Free column
  // offers "Start free" to someone already there. Signed out it stays the live CTA.
  const currentPlanId = hasSubscription ? subscriptionStatus.plan : currentUser ? 'free' : null;

  useEffect(() => {
    if (!enabled) return;
    billingApi.getPlans().then(({ data }) => {
      if (data) setPlans(data);
    });
  }, [enabled]);

  const select = useCallback(
    async (plan: Plan) => {
      // Everyone starts on a free account. Picking a paid column while signed out
      // means "sign me up", not "take my card" — the card comes later, when the
      // free quotas run out and the paywall opens.
      if (!currentUser) {
        onUnauthenticated?.();
        return;
      }
      if (plan.id === 'free') {
        onFree?.();
        return;
      }
      if (!plan.priceId) return;

      setPendingId(plan.id);
      try {
        const { data, error } = hasSubscription
          ? await billingApi.createPortal('update')
          : await billingApi.createCheckout(plan.priceId);

        if (!data?.url) {
          alert(error ?? 'Something went wrong. Please try again.');
          setPendingId(null);
          return;
        }
        if (!hasSubscription) {
          analytics.subscriptionStarted(plan.id);
          gaPlanSelected(plan.id);
        }
        window.location.href = data.url;
      } catch {
        alert('Something went wrong. Please try again.');
        setPendingId(null);
      }
    },
    [currentUser, hasSubscription, onFree, onUnauthenticated]
  );

  return { plans, pendingId, currentPlanId, hasSubscription, select };
}
