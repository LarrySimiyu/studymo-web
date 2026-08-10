'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { billingApi, SubscriptionStatus, type Plan } from '@/lib/api/billing';
import { Button } from '@/components/ui/Button';
import PageShell from '@/components/dashboard/PageShell';
import { priceWithPeriod } from '@/components/pricing/pricingContent';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alertDialog';

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  trialing: 'Free trial',
  past_due: 'Past due',
  incomplete: 'Incomplete',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function StatusPill({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'bad' }) {
  const color = tone === 'bad' ? 'var(--danger-ink)' : tone === 'warn' ? 'var(--warning-ink)' : 'var(--success-ink)';
  const bg = tone === 'bad' ? 'var(--danger-subtle)' : tone === 'warn' ? 'var(--warning-subtle)' : 'var(--success-subtle)';
  return (
    <span className="rounded-full px-2 py-0.5 text-2xs font-semibold" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-body-sm text-[var(--text-2)]">{label}</span>
      <span className="text-body-sm font-medium text-[var(--text-1)]">{value}</span>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { subscriptionStatus, refreshSubscription } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(subscriptionStatus);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    refreshSubscription().then(() => {
      billingApi.getStatus().then(({ data }) => { if (data) setStatus(data); });
    });
    // Prices come from Stripe, never a local table — a hardcoded one drifts the
    // moment a price changes there.
    billingApi.getPlans().then(({ data }) => { if (data) setPlans(data); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subscriptionStatus) setStatus(subscriptionStatus);
  }, [subscriptionStatus]);

  // The API has no cancel endpoint — Stripe's portal owns every plan change.
  async function openPortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const { data, error } = await billingApi.createPortal();
      if (error || !data?.url) { setPortalError(error ?? 'Could not open the billing portal'); return; }
      window.location.href = data.url;
    } catch {
      setPortalError('Something went wrong');
    } finally {
      setPortalLoading(false);
    }
  }

  const noSub = !status || status.status === 'none' || status.status === 'canceled';
  const currentPlan = plans.find(p => p.id === status?.plan);
  const planPrice = currentPlan ? priceWithPeriod(currentPlan) : null;
  const ending = !!status?.cancelAtPeriodEnd;

  return (
    <PageShell width="sm" center>

      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild aria-label="Back to settings">
          <a href="/dashboard/settings"><ArrowLeft size={18} /></a>
        </Button>
        <h1 className="text-heading-sm md:text-heading text-[var(--text-1)]">Billing &amp; Subscription</h1>
      </div>

      {noSub ? (
        <div
          className="rounded-2xl px-6 py-10 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-heading-sm text-[var(--text-1)]">You&rsquo;re on the free plan</h2>
          <p className="mb-6 mt-1 text-body-sm text-[var(--text-2)]">
            Upgrade for unlimited uploads, AI generation, and tutor chat
          </p>
          <Button variant="primary" size="lg" asChild>
            <a href="/pricing">View plans</a>
          </Button>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <p className="text-body-lg font-semibold text-[var(--text-1)]">
                {currentPlan?.label ?? 'Studymo Pro'}
              </p>
              <StatusPill
                label={ending ? 'Ending' : STATUS_LABEL[status.status] ?? 'Active'}
                tone={status.status === 'past_due' ? 'bad' : ending ? 'warn' : 'ok'}
              />
            </div>
            {planPrice && <p className="mt-0.5 text-body-sm text-[var(--text-2)]">{planPrice}</p>}
          </div>

          <div className="px-5 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            {status.isTrial && status.trialEnd && (
              <Row label="Trial ends" value={formatDate(status.trialEnd)} />
            )}
            {status.currentPeriodEnd && (
              <Row
                label={ending ? 'Access ends' : 'Next billing'}
                value={formatDate(status.currentPeriodEnd)}
              />
            )}
          </div>

          {status.status === 'past_due' && (
            <p
              className="px-5 py-3 text-body-sm text-[var(--danger-ink)]"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              Your last payment failed. Update your payment method to keep access.
            </p>
          )}

          {portalError && (
            <p
              className="px-5 py-3 text-body-sm text-[var(--danger-ink)]"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {portalError}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <Button variant="secondary" size="sm" onClick={openPortal} disabled={portalLoading}>
              {portalLoading ? 'Opening…' : 'Manage billing'}
            </Button>
            {ending ? (
              <Button variant="primary" size="sm" onClick={openPortal} disabled={portalLoading}>
                Reactivate
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirmCancel(true)}>
                Cancel subscription
              </Button>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={confirmCancel} onOpenChange={o => { if (!portalLoading) setConfirmCancel(o); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--danger-subtle)' }}
            >
              <CalendarX size={22} style={{ color: 'var(--danger-ink)' }} />
            </div>
            <div>
              <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                {status?.currentPeriodEnd
                  ? `You'll keep full access until ${formatDate(status.currentPeriodEnd)}. We'll send you to Stripe to confirm.`
                  : "We'll send you to Stripe to confirm."}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={portalLoading}>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              disabled={portalLoading}
              onClick={e => { e.preventDefault(); openPortal(); }}
            >
              {portalLoading ? 'Opening…' : 'Cancel subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
