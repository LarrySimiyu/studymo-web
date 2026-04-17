'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { billingApi, type Plan } from '@/lib/api/billing';
import { analytics } from '@/lib/analytics';
import PlanSelector from '@/components/pricing/PlanSelector';
import PlanCard from '@/components/pricing/PlanCard';

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const iv = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(iv);
  }, []);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseDollars(price: string): number {
  return parseFloat(price.replace('$', '')) || 0;
}

interface Props {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan['id']>('yearly');
  const [loading, setLoading] = useState(false);
  const countdown = useCountdown(180);

  useEffect(() => {
    billingApi.getPlans().then(({ data }) => {
      if (data) setPlans(data);
    });
  }, []);

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
    setOthersCount((Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000).toLocaleString());
  }, []);

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
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Top bar with countdown */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="h-6 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          {selected === 'yearly' && (
            <>
              <span>Your free trial is reserved for:</span>
              <span className="font-bold tabular-nums" style={{ color: '#FF6500' }}>{countdown}</span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-3)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-6 pb-10 px-4">
        <div className="w-full max-w-lg flex flex-col gap-10 items-center text-center">

          <h1
            className="font-extrabold tracking-tight w-full"
            style={{ color: 'var(--text-1)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', lineHeight: 1.15 }}
          >
            {plan?.trialDays ? (
              <>
                <span className="sm:hidden">
                  Try StudyMo{' '}<br />
                  <span style={{ color: '#FF6500' }}>free for {plan.trialDays} days</span>
                </span>
                <span className="hidden sm:inline whitespace-nowrap">
                  Try StudyMo <span style={{ color: '#FF6500' }}>free for {plan.trialDays} days</span>
                </span>
              </>
            ) : (
              <span>Get Unlimited Access</span>
            )}
          </h1>

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

          <div className="flex items-center justify-center -mt-4">
            <span className="text-sm font-medium" style={{ color: '#FF6500' }}>
              {othersCount} others started today
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
