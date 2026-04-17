'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import PlanSelector from '@/components/pricing/PlanSelector';
import PlanCard from '@/components/pricing/PlanCard';
import { billingApi, type Plan } from '@/lib/api/billing';
import { useAuth } from '@/hooks/useAuth';
import { analytics } from '@/lib/analytics';
import PricingSkeleton from '@/components/pricing/PricingSkeleton';

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

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan['id']>('yearly');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
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
    if (!currentUser) {
      router.push(`/sign-up?priceId=${plan.priceId}`);
      return;
    }
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
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />

      {/* Exact same content as PaywallModal, just without the modal wrapper */}
      <div className="flex-1 flex items-start justify-center pt-28 pb-10 px-4">
        <div className="w-full max-w-lg flex flex-col gap-10 items-center text-center">

          <div className="h-7 flex items-center justify-center">
            {selected === 'yearly' && (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>Your free trial is reserved for:</span>
                <span className="font-bold tabular-nums" style={{ color: '#FF6500' }}>{countdown}</span>
              </div>
            )}
          </div>

          <h1
            className="font-extrabold tracking-tight w-full"
            style={{ color: '#fff', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', lineHeight: 1.15 }}
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

          {plans.length === 0 ? (
            <PricingSkeleton />
          ) : (
            <>
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
            </>
          )}

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
