'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Star, Upload, FileText, Mic, MessageSquare, BookOpen, Check } from 'lucide-react';
import { billingApi, type Plan } from '@/lib/api/billing';

const FEATURES = [
  { icon: Upload, color: '#FF6500', bg: 'rgba(255,101,0,0.12)', text: 'Unlimited uploads, files, audio & video' },
  { icon: FileText, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', text: 'AI notes, flashcards & quizzes' },
  { icon: Mic, color: '#EC4899', bg: 'rgba(236,72,153,0.12)', text: 'Podcast from any document' },
  { icon: MessageSquare, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', text: 'Chat with your AI tutor' },
  { icon: BookOpen, color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', text: 'Practice exams & study plans' },
];

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

  useEffect(() => {
    billingApi.getPlans().then(({ data }) => {
      if (data) setPlans(data);
    });
  }, []);

  const countdown = useCountdown(120);

  const othersCount = useMemo(
    () => (Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000).toLocaleString(),
    [],
  );

  const plan = plans.find(p => p.id === selected);

  // Compute yearly savings vs weekly (weekly * 52 weeks)
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

  async function handleCTA() {
    if (!plan?.priceId) return;
    setLoading(true);
    try {
      const { data, error } = await billingApi.createCheckout(plan.priceId);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(error ?? 'Failed to start checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('checkout error:', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const isYearly = selected === 'yearly';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
        style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          <span>Your free trial is reserved for:</span>
          <span className="font-bold tabular-nums" style={{ color: '#FF6500' }}>{countdown}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-3)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center pt-6 pb-10 px-4">
        <div className="w-full max-w-lg flex flex-col gap-10 items-center text-center">

          {/* Heading */}
          <h1 className="font-extrabold tracking-tight w-full" style={{ color: 'var(--text-1)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', lineHeight: 1.15 }}>
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

          {/* Plan toggle + savings callout */}
          <div className="flex flex-col items-center gap-6">
            {/* Savings callout — always reserves space to prevent layout shift */}
            <div className="h-8 flex items-center">
              {isYearly && yearlySavings && (
                <span
                  className="text-base font-bold px-4 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                >
                  {yearlySavings}% OFF
                </span>
              )}
            </div>

            {/* Toggle pill */}
            <div
              className="flex rounded-full p-1 gap-1"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              {plans.map(p => {
                const isSelected = selected === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: isSelected ? '#FF6500' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-3)',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan card */}
          <div
            className="rounded-3xl p-6 flex flex-col gap-5 transition-all w-full text-left"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border)',
            }}
          >
            {/* Card top row: icon + most popular badge */}
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 flex items-center justify-center">
                <Star
                  size={32}
                  style={{
                    color: selected === 'yearly' ? '#22C55E' : selected === 'monthly' ? '#FF6500' : '#fff',
                    fill: selected === 'yearly' ? '#22C55E' : selected === 'monthly' ? '#FF6500' : '#fff',
                  }}
                />
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full transition-opacity"
                style={{
                  backgroundColor: 'rgba(34,197,94,0.15)',
                  color: '#22C55E',
                  opacity: isYearly ? 1 : 0,
                  pointerEvents: 'none',
                }}
              >
                Most popular
              </span>
            </div>

            {/* Plan name */}
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
                {plan?.label ?? '—'} Plan
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                {isYearly ? 'Best value, one simple payment' : `Billed ${plan?.sub ?? ''}`}
              </p>
            </div>

            {/* Price row */}
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-end gap-1.5">
                <span className="font-extrabold tabular-nums leading-none" style={{ color: 'var(--text-1)', fontSize: 'clamp(2.5rem, 8vw, 3.25rem)' }}>
                  {plan?.price ?? '—'}
                </span>
                <span className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
                  {plan?.sub}
                </span>
              </div>
              <span className="text-sm text-right shrink-0 mb-1.5" style={{ color: 'var(--text-3)' }}>
                Cancel<br />any time
              </span>
            </div>

            {/* Features inner box */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              {FEATURES.map(({ icon: Icon, color, bg, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-1)' }}>
                    {text}
                  </span>
                  <Check size={14} className="shrink-0" style={{ color: '#22C55E' }} />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCTA}
                disabled={loading || !plan}
                className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
              >
                {loading
                  ? 'Loading…'
                  : plan?.trialDays
                    ? 'Try for $0'
                    : 'Get Unlimited'}
              </button>
              {plan?.trialDays && (
                <p className="text-center text-xs" style={{ color: 'var(--text-3)' }}>
                  No risk, no payment today
                </p>
              )}
            </div>
          </div>

          {/* Social proof */}
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
