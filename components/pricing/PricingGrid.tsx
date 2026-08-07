'use client';

import type { Plan } from '@/lib/api/billing';
import PlanColumn from './PlanColumn';
import { gridColumns, yearlySavings } from './pricingContent';

interface Props {
  plans: Plan[];
  includeFree: boolean;
  ctaLabel: string;
  pendingId: Plan['id'] | null;
  /** The plan the user is subscribed to. May be null even when `hasSubscription` is true. */
  currentPlanId: string | null;
  hasSubscription: boolean;
  onSelect: (plan: Plan) => void;
}

export default function PricingGrid({
  plans,
  includeFree,
  ctaLabel,
  pendingId,
  currentPlanId,
  hasSubscription,
  onSelect,
}: Props) {
  const visible = plans.filter(p => p.id !== 'free' || includeFree);
  const savings = yearlySavings(plans);

  return (
    <div className={`grid w-full gap-4 sm:gap-5 ${gridColumns(visible.length)}`}>
      {visible.map(plan => {
        // A subscriber can't start free, but the column still has to be on screen —
        // it's what the paid columns' "Everything in Free" refers to.
        const locked = plan.id === 'free' && hasSubscription;
        return (
          <PlanColumn
            key={plan.id}
            plan={plan}
            ctaLabel={locked ? 'Included' : hasSubscription ? 'Manage billing' : ctaLabel}
            badge={plan.id === 'yearly' && savings ? `Save ${savings}%` : null}
            isCurrent={plan.id === currentPlanId}
            disabled={locked}
            pending={pendingId === plan.id}
            busy={pendingId !== null}
            onSelect={() => onSelect(plan)}
          />
        );
      })}
    </div>
  );
}
