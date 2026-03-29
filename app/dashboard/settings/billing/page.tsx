'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { billingApi, SubscriptionStatus } from '@/lib/api/billing';

const PLAN_PRICES: Record<string, string> = {
  weekly: '$9.99/week',
  monthly: '$14.99/month',
  yearly: '$99.99/year',
};

const PLAN_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    active: { label: 'Active', bg: '#22C55E20', color: '#22C55E' },
    trialing: { label: 'Free Trial', bg: '#9747FF20', color: '#9747FF' },
    past_due: { label: 'Past Due', bg: '#EF444420', color: '#EF4444' },
    canceled: { label: 'Canceled', bg: '#6B728020', color: '#9CA3AF' },
    incomplete: { label: 'Incomplete', bg: '#F59E0B20', color: '#F59E0B' },
    none: { label: 'No Subscription', bg: '#6B728020', color: '#9CA3AF' },
  };
  const c = config[status] ?? config.none;
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function BillingSettingsPage() {
  const { subscriptionStatus, refreshSubscription } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(subscriptionStatus);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Refresh on mount to get latest data
    refreshSubscription().then(() => {
      billingApi.getStatus().then(({ data }) => {
        if (data) setStatus(data);
      });
    });
  }, []);

  useEffect(() => {
    if (subscriptionStatus) setStatus(subscriptionStatus);
  }, [subscriptionStatus]);

  async function handleManage() {
    setPortalLoading(true);
    try {
      const { data, error } = await billingApi.createPortal();
      if (error || !data?.url) {
        alert(error ?? 'Failed to open billing portal');
        return;
      }
      window.location.href = data.url;
    } catch {
      alert('Something went wrong');
    } finally {
      setPortalLoading(false);
    }
  }

  const noSub = !status || status.status === 'none' || status.status === 'canceled';

  return (
    <div className="max-w-2xl mx-auto py-2">
      <div className="mb-6">
        <a href="/dashboard/settings" className="text-xs text-gray-500 hover:text-gray-300 mb-3 block">
          ← Back to Settings
        </a>
        <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
        {noSub ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: '#9747FF20' }}>💳</div>
            <h2 className="text-lg font-semibold text-white mb-1">No active subscription</h2>
            <p className="text-gray-400 text-sm mb-5">Subscribe to get full access to Studymo</p>
            <a
              href="/subscribe"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#9747FF' }}
            >
              View Plans
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Plan header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-white">
                    {status.plan ? PLAN_LABELS[status.plan] : 'Studymo Pro'} Plan
                  </h2>
                  <StatusBadge status={status.status} />
                </div>
                {status.plan && (
                  <p className="text-sm text-gray-400">{PLAN_PRICES[status.plan]}</p>
                )}
              </div>
            </div>

            {/* Trial info */}
            {status.isTrial && status.trialEnd && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#9747FF10', border: '1px solid #9747FF30' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium" style={{ color: '#9747FF' }}>
                    {status.daysLeftInTrial !== null ? `${status.daysLeftInTrial} days left in your free trial` : 'Free Trial Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Your trial ends on {new Date(status.trialEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  You will be charged $99.99 on that date.
                </p>
              </div>
            )}

            {/* Active info */}
            {status.status === 'active' && status.currentPeriodEnd && !status.cancelAtPeriodEnd && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}>
                <p className="text-xs text-gray-400">
                  Next billing date:{' '}
                  <span className="text-white font-medium">
                    {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  {status.plan && (
                    <span className="ml-2 text-gray-500">· {PLAN_PRICES[status.plan]}</span>
                  )}
                </p>
              </div>
            )}

            {/* Canceling at period end */}
            {status.cancelAtPeriodEnd && status.currentPeriodEnd && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#F59E0B10', border: '1px solid #F59E0B30' }}>
                <p className="text-sm font-medium text-yellow-400 mb-1">Subscription ending</p>
                <p className="text-xs text-gray-400">
                  Your subscription will end on{' '}
                  {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  You will lose access after this date.
                </p>
                <button
                  onClick={handleManage}
                  disabled={portalLoading}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B40' }}
                >
                  {portalLoading ? 'Loading…' : 'Reactivate Subscription'}
                </button>
              </div>
            )}

            {/* Past due */}
            {status.status === 'past_due' && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#EF444410', border: '1px solid #EF444430' }}>
                <p className="text-sm font-medium text-red-400 mb-1">Payment failed</p>
                <p className="text-xs text-gray-400">
                  Your last payment failed. Please update your payment method to keep access.
                </p>
              </div>
            )}

            {/* Manage button */}
            <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #2A2A2A' }}>
              <button
                onClick={handleManage}
                disabled={portalLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#9747FF' }}
              >
                {portalLoading ? 'Loading…' : 'Manage Subscription'}
              </button>
              <button
                onClick={handleManage}
                disabled={portalLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ color: '#9CA3AF', border: '1px solid #2A2A2A' }}
              >
                Change Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
