'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Clock, CalendarX, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { billingApi, SubscriptionStatus } from '@/lib/api/billing';
import { Button } from '@/components/ui/Button';
import { getPalette } from '@/components/dashboard/PlanCard';

const PLAN_PRICES: Record<string, string> = {
  weekly:  '$9.99/week',
  monthly: '$14.99/month',
  yearly:  '$99.99/year',
};

const PLAN_LABELS: Record<string, string> = {
  weekly:  'Weekly',
  monthly: 'Monthly',
  yearly:  'Yearly',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: 'Active',           color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   },
  trialing:   { label: 'Free Trial',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  past_due:   { label: 'Past Due',         color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
  canceled:   { label: 'Canceled',         color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
  incomplete: { label: 'Incomplete',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  none:       { label: 'No Subscription',  color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.none;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function InfoBlock({ icon: Icon, color, bg, children }: {
  icon: React.ElementType; color: string; bg: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: bg, border: `1px solid ${color}30` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}20` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { subscriptionStatus, refreshSubscription } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(subscriptionStatus);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    refreshSubscription().then(() => {
      billingApi.getStatus().then(({ data }) => { if (data) setStatus(data); });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subscriptionStatus) setStatus(subscriptionStatus);
  }, [subscriptionStatus]);

  async function handleManage() {
    setPortalLoading(true);
    try {
      const { data, error } = await billingApi.createPortal();
      if (error || !data?.url) { alert(error ?? 'Failed to open billing portal'); return; }
      window.location.href = data.url;
    } catch {
      alert('Something went wrong');
    } finally {
      setPortalLoading(false);
    }
  }

  const noSub = !status || status.status === 'none' || status.status === 'canceled';
  const [iconColor, iconBg] = getPalette(status?.plan ?? 'billing');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard/settings" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-xl font-bold text-[var(--text-1)]">Billing & Subscription</h1>
      </div>

      {noSub ? (
        /* ── No subscription ── */
        <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
            <CreditCard size={28} style={{ color: '#FF6500' }} />
          </div>
          <h2 className="text-base font-semibold text-[var(--text-1)] mb-1">No active subscription</h2>
          <p className="text-sm text-[var(--text-3)] mb-6">Subscribe to get full access to Studymo</p>
          <Button variant="brand" size="lg" asChild>
            <a href="/subscribe">View Plans</a>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* ── Plan card ── */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
                <CreditCard size={15} style={{ color: iconColor }} />
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Your Plan</h2>
            </div>

            <div className="px-5 py-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-bold text-[var(--text-1)]">
                    {status.plan ? PLAN_LABELS[status.plan] : 'Studymo Pro'} Plan
                  </p>
                  <StatusBadge status={status.status} />
                </div>
                {status.plan && (
                  <p className="text-sm text-[var(--text-3)]">{PLAN_PRICES[status.plan]}</p>
                )}
              </div>
            </div>

            {/* Info blocks */}
            <div className="px-5 pb-5 flex flex-col gap-3">
              {status.isTrial && status.trialEnd && (
                <InfoBlock icon={Clock} color="#8B5CF6" bg="rgba(139,92,246,0.06)">
                  <p className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
                    {status.daysLeftInTrial !== null ? `${status.daysLeftInTrial} days left in your free trial` : 'Free Trial Active'}
                  </p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Trial ends {new Date(status.trialEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You will be charged $99.99 on that date.
                  </p>
                </InfoBlock>
              )}

              {status.status === 'active' && status.currentPeriodEnd && !status.cancelAtPeriodEnd && (
                <InfoBlock icon={CheckCircle} color="#22C55E" bg="rgba(34,197,94,0.06)">
                  <p className="text-sm font-medium" style={{ color: '#22C55E' }}>Subscription active</p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Next billing date: <span className="text-[var(--text-2)] font-medium">
                      {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {status.plan && <span className="ml-1">· {PLAN_PRICES[status.plan]}</span>}
                  </p>
                </InfoBlock>
              )}

              {status.cancelAtPeriodEnd && status.currentPeriodEnd && (
                <InfoBlock icon={CalendarX} color="#F59E0B" bg="rgba(245,158,11,0.06)">
                  <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>Subscription ending</p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Access ends {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You will lose access after this date.
                  </p>
                  <button
                    onClick={handleManage}
                    disabled={portalLoading}
                    className="mt-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ color: '#F59E0B' }}
                  >
                    {portalLoading ? 'Loading…' : 'Reactivate →'}
                  </button>
                </InfoBlock>
              )}

              {status.status === 'past_due' && (
                <InfoBlock icon={AlertCircle} color="#EF4444" bg="rgba(239,68,68,0.06)">
                  <p className="text-sm font-medium" style={{ color: '#EF4444' }}>Payment failed</p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Your last payment failed. Please update your payment method to keep access.
                  </p>
                </InfoBlock>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Button variant="brand" size="sm" disabled={portalLoading} onClick={handleManage}>
                {portalLoading ? <><RefreshCw size={13} className="animate-spin" /> Loading…</> : 'Manage Subscription'}
              </Button>
              <Button variant="outline" size="sm" disabled={portalLoading} onClick={handleManage}>
                Change Plan
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
