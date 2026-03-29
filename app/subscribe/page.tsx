'use client';

import { useState } from 'react';
import Link from 'next/link';
import { billingApi } from '@/lib/api/billing';

const WEEKLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_WEEKLY_PRICE_ID!;
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!;
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!;

const FEATURES = [
  'Unlimited document uploads',
  'AI-generated notes, flashcards & quizzes',
  'Practice exam generation',
  'AI study plans',
  'Pomodoro & time block timer',
  'Weak topic tracking',
  'Study streak tracking',
  'Note sharing',
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="7" fill="#9747FF" fillOpacity="0.2" />
      <path d="M4 7l2 2 4-4" stroke="#9747FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SubscribePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSubscribe(priceId: string, planKey: string) {
    setLoadingPlan(planKey);
    try {
      const { data, error } = await billingApi.createCheckout(priceId);
      if (error || !data?.url) {
        alert(error ?? 'Failed to start checkout');
        return;
      }
      window.location.href = data.url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#111111' }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold text-white tracking-tight">Studymo</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Choose your plan</h1>
        <p className="text-gray-400">Get full access to AI-powered studying</p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
        {/* Weekly */}
        <div className="rounded-2xl p-6 flex flex-col" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="mb-5">
            <p className="text-sm text-gray-400 mb-1">Weekly</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">$9.99</span>
              <span className="text-gray-500 text-sm mb-1">/ week</span>
            </div>
            <p className="text-xs text-gray-600">Billed weekly</p>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(WEEKLY_PRICE_ID, 'weekly')}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A' }}
          >
            {loadingPlan === 'weekly' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading…
              </span>
            ) : 'Get Started'}
          </button>
        </div>

        {/* Monthly — Most Popular */}
        <div className="rounded-2xl p-6 flex flex-col relative" style={{ backgroundColor: '#1A1A1A', border: '2px solid #9747FF' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#9747FF' }}>
              Most Popular
            </span>
          </div>

          <div className="mb-5">
            <p className="text-sm text-gray-400 mb-1">Monthly</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">$14.99</span>
              <span className="text-gray-500 text-sm mb-1">/ month</span>
            </div>
            <p className="text-xs text-gray-600">Billed monthly</p>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(MONTHLY_PRICE_ID, 'monthly')}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#9747FF' }}
          >
            {loadingPlan === 'monthly' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading…
              </span>
            ) : 'Get Started'}
          </button>
        </div>

        {/* Yearly — Best Value */}
        <div className="rounded-2xl p-6 flex flex-col relative" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>
              Best Value
            </span>
          </div>

          <div className="mb-5">
            <p className="text-sm text-gray-400 mb-1">Yearly</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white">$99.99</span>
              <span className="text-gray-500 text-sm mb-1">/ year</span>
            </div>
            <p className="text-xs font-medium" style={{ color: '#22C55E' }}>$8.33/month — save 45%</p>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(YEARLY_PRICE_ID, 'yearly')}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#22C55E' }}
          >
            {loadingPlan === 'yearly' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading…
              </span>
            ) : 'Try Free for 7 Days'}
          </button>
          <p className="text-xs text-gray-600 text-center mt-2">
            7 day free trial — then $99.99/year. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
        <Link href="/sign-in" className="hover:text-gray-300 transition-colors">
          Already subscribed? Sign in
        </Link>
        <span>·</span>
        <a href="mailto:support@studymo.app" className="hover:text-gray-300 transition-colors">
          Questions? Contact us
        </a>
      </div>
    </div>
  );
}
