'use client';

import { useState } from 'react';

const PLANS = [
  {
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'Perfect for individuals and small projects.',
    features: ['5 AI requests/day', '1 workspace', 'Email support', 'Basic analytics'],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: 'For teams that move fast and need more power.',
    features: [
      'Unlimited AI requests',
      '10 workspaces',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start for free. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border p-1 bg-muted">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !yearly
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                yearly
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-green-600 font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-3 py-1">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="text-primary font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
