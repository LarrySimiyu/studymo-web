'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { billingApi, type Plan } from '@/lib/api/billing';
import { analytics } from '@/lib/analytics';
import PlanSelector from '@/components/pricing/PlanSelector';
import PlanCard from '@/components/pricing/PlanCard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

/** Ticks only while `active`, and restarts each time `active` flips on. */
function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    const iv = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(iv);
  }, [active, seconds]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseDollars(price: string): number {
  return parseFloat(price.replace('$', '')) || 0;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan['id']>('yearly');
  const [loading, setLoading] = useState(false);
  const countdown = useCountdown(180, open);

  useEffect(() => {
    if (!open) return;
    billingApi.getPlans().then(({ data }) => {
      if (data) setPlans(data);
    });
  }, [open]);

  const plan = plans.find(p => p.id === selected);

  const yearlySavings = useMemo(() => {
    const weekly = plans.find(p => p.id === 'weekly');
    const yearly = plans.find(p => p.id === 'yearly');
    if (!weekly || !yearly) return null;
    const weeklyAnnual = parseDollars(weekly.price) * 52;
    const yearlyPrice = parseDollars(yearly.price);
    if (weeklyAnnual <= 0) return null;
    const pct = Math.round(((weeklyAnnual - yearlyPrice) / weeklyAnnual) * 100);
    return pct > 0 ? pct : null;
  }, [plans]);

  const [othersCount, setOthersCount] = useState('');
  useEffect(() => {
    if (!open) return;
    setOthersCount((Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000).toLocaleString());
  }, [open]);

  async function handleCTA() {
    if (!plan?.priceId) return;
    setLoading(true);
    try {
      const { data, error } = await billingApi.createCheckout(plan.priceId);
      if (data?.url) {
        analytics.subscriptionStarted(plan.id);
        window.location.href = data.url;
      } else {
        alert(error ?? 'Failed to start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent variant="fullscreen" className="flex flex-col">
        {/* Top bar with countdown */}
        <div
          className="sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
          style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex h-6 items-center gap-2 text-body-sm font-medium" style={{ color: 'var(--text-2)' }}>
            {selected === 'yearly' && (
              <>
                <span>Your free trial is reserved for:</span>
                <span className="font-bold tabular-nums" style={{ color: 'var(--brand)' }}>{countdown}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-3)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-6">
          <div className="flex w-full max-w-lg flex-col items-center gap-10 text-center">

            <DialogTitle asChild>
              <h1
                className="w-full font-extrabold tracking-tight"
                style={{ color: 'var(--text-1)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', lineHeight: 1.15 }}
              >
                {plan?.trialDays ? (
                  <>
                    <span className="sm:hidden">
                      Try StudyMo{' '}<br />
                      <span style={{ color: 'var(--brand)' }}>free for {plan.trialDays} days</span>
                    </span>
                    <span className="hidden whitespace-nowrap sm:inline">
                      Try StudyMo <span style={{ color: 'var(--brand)' }}>free for {plan.trialDays} days</span>
                    </span>
                  </>
                ) : (
                  <span>Get Unlimited Access</span>
                )}
              </h1>
            </DialogTitle>

            <PlanSelector
              plans={plans}
              selected={selected}
              onSelect={setSelected}
              yearlySavings={yearlySavings}
            />

            <PlanCard
              plan={plan}
              selected={selected}
              loading={loading}
              onCTA={handleCTA}
            />

            <div className="-mt-4 flex items-center justify-center">
              <span className="text-body-sm font-medium" style={{ color: 'var(--brand)' }}>
                {othersCount} others started today
              </span>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
