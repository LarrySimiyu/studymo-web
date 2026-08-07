'use client';

import { Check } from 'lucide-react';
import type { Plan } from '@/lib/api/billing';
import { Button } from '@/components/ui/Button';
import { effectiveMonthly, featuresFor, featuresHeading, periodLabel } from './pricingContent';

interface Props {
  plan: Plan;
  ctaLabel: string;
  /** Rendered in the badge slot. Yearly gets the savings figure. */
  badge: string | null;
  isCurrent: boolean;
  /** Column is on screen for reference only — its CTA leads nowhere. */
  disabled?: boolean;
  /** This column's CTA is mid-redirect. */
  pending: boolean;
  /** Some column is mid-redirect — every CTA locks so a second click can't double-charge. */
  busy: boolean;
  onSelect: () => void;
}

export default function PlanColumn({
  plan,
  ctaLabel,
  badge,
  isCurrent,
  disabled = false,
  pending,
  busy,
  onSelect,
}: Props) {
  const effective = effectiveMonthly(plan);
  const badgeText = isCurrent ? 'Current plan' : badge;

  return (
    <div
      className="flex h-full flex-col rounded-xl p-5 sm:p-6"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Fixed-height slot so a column without a badge still lines up with one that has it. */}
      <div className="flex h-6 items-center">
        {badgeText && (
          <span
            className="rounded-full px-2.5 py-1 text-2xs font-bold"
            style={{
              backgroundColor: isCurrent ? 'var(--success-subtle)' : 'var(--brand-subtle)',
              color: isCurrent ? 'var(--success-ink)' : 'var(--brand-ink)',
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      <p className="mt-3 text-body-sm font-medium" style={{ color: 'var(--text-2)' }}>
        {plan.label}
      </p>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="text-title font-extrabold tabular-nums leading-none sm:text-display"
          style={{ color: 'var(--text-1)' }}
        >
          {plan.price}
        </span>
        <span className="text-body-sm" style={{ color: 'var(--text-3)' }}>
          {periodLabel(plan.id)}
        </span>
      </div>

      <p className="mt-1.5 h-4 text-xs" style={{ color: 'var(--text-3)' }}>
        {effective ?? ''}
      </p>

      {/* Above the feature list on purpose — it keeps every CTA on the same
          baseline no matter how long each column's list runs. */}
      <Button
        variant="primary"
        size="lg"
        onClick={onSelect}
        disabled={busy || isCurrent || disabled}
        className="mt-5 h-11 w-full text-base font-bold"
      >
        {pending ? 'Loading…' : isCurrent ? 'Current plan' : ctaLabel}
      </Button>

      <p className="mt-6 text-body-sm font-semibold" style={{ color: 'var(--text-1)' }}>
        {featuresHeading(plan)}
      </p>

      <ul className="mt-3 flex flex-col gap-2.5">
        {featuresFor(plan).map(text => (
          <li key={text} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: 'var(--success-subtle)' }}
            >
              <Check size={12} style={{ color: 'var(--success-ink)' }} />
            </span>
            <span className="text-body-sm" style={{ color: 'var(--text-1)' }}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
