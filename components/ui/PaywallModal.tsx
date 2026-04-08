'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Upload, FileText, Mic, MessageSquare, BookOpen, Check } from 'lucide-react';
import { billingApi } from '@/lib/api/billing';

type PlanId = 'yearly' | 'monthly' | 'weekly';

const PLANS: { id: PlanId; label: string; price: string; sub: string; priceId: string; badge: string | null }[] = [
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$99.99',
    sub: 'per year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? '',
    badge: 'Save 81%',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$14.99',
    sub: 'per month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? '',
    badge: 'Save 65%',
  },
  {
    id: 'weekly',
    label: 'Weekly',
    price: '$9.99',
    sub: 'per week',
    priceId: process.env.NEXT_PUBLIC_STRIPE_WEEKLY_PRICE_ID ?? '',
    badge: null,
  },
];

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

interface Props {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: Props) {
  const [selected, setSelected] = useState<PlanId>('yearly');
  const [loading, setLoading] = useState(false);

  const countdown = useCountdown(120);

  const othersCount = useMemo(
    () => (Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000).toLocaleString(),
    [],
  );

  const plan = PLANS.find(p => p.id === selected)!;

  async function handleCTA() {
    if (!plan.priceId) {
      return;
    }
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
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md flex flex-col gap-7">

          {/* Heading — one line on sm+, wraps naturally on mobile with orange on its own line */}
          <h1 className="font-extrabold tracking-tight" style={{ color: 'var(--text-1)', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', lineHeight: 1.15 }}>
            <span className="sm:hidden">
              Try StudyMo{' '}<br />
              <span style={{ color: '#FF6500' }}>free for 7 days</span>
            </span>
            <span className="hidden sm:inline whitespace-nowrap">
              Try StudyMo <span style={{ color: '#FF6500' }}>free for 7 days</span>
            </span>
          </h1>

          {/* Feature list */}
          <div className="flex flex-col gap-3.5">
            {FEATURES.map(({ icon: Icon, color, bg, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-sm sm:text-base font-medium" style={{ color: 'var(--text-1)' }}>
                  {text}
                </span>
                <Check size={16} className="ml-auto shrink-0" style={{ color: '#22C55E' }} />
              </div>
            ))}
          </div>

          {/* Plan tabs */}
          <div
            className="flex rounded-2xl p-1.5 gap-1.5"
            style={{ backgroundColor: 'var(--bg-input)' }}
          >
            {PLANS.map(p => {
              const isSelected = selected === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="flex-1 flex flex-col items-center py-3 px-1 rounded-xl transition-all"
                  style={{
                    backgroundColor: isSelected ? '#FF6500' : 'transparent',
                  }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-3)' }}
                  >
                    {p.label}
                  </span>
                  <span
                    className="text-base font-bold mt-0.5 tabular-nums"
                    style={{ color: isSelected ? '#fff' : 'var(--text-1)' }}
                  >
                    {p.price}
                  </span>
                  {p.badge ? (
                    <span
                      className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#fff' : 'rgba(34,197,94,0.15)',
                        color: isSelected ? '#000' : '#22C55E',
                      }}
                    >
                      {p.badge}
                    </span>
                  ) : (
                    <span className="mt-1 text-[10px] opacity-0 px-2 py-0.5">-</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCTA}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
            >
              {loading
                ? 'Loading…'
                : selected === 'yearly'
                  ? 'Try StudyMo for $0'
                  : 'Get Unlimited'}
            </button>

            {selected === 'yearly' && (
              <p className="text-center text-xs" style={{ color: 'var(--text-3)' }}>
                No risk, no payment today
              </p>
            )}
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center">
            <span className="text-sm font-medium" style={{ color: '#FF6500' }}>
              {othersCount} others started today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
