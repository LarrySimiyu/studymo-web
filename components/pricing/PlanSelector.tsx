'use client';

import { useEffect, useRef } from 'react';
import { Plan } from '@/lib/api/billing';

interface Props {
  plans: Plan[];
  selected: Plan['id'];
  onSelect: (id: Plan['id']) => void;
  yearlySavings: number | null;
}

export default function PlanSelector({ plans, selected, onSelect, yearlySavings }: Props) {
  const isYearly = selected === 'yearly';
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevSelected = useRef(selected);

  useEffect(() => {
    if (selected === 'yearly' && prevSelected.current !== 'yearly' && badgeRef.current) {
      const el = badgeRef.current;
      el.animate(
        [
          { transform: 'scale(0.6)', opacity: 0 },
          { transform: 'scale(1.2)', opacity: 1 },
          { transform: 'scale(0.95)' },
          { transform: 'scale(1)' },
        ],
        { duration: 400, easing: 'ease-out' }
      );
    }
    prevSelected.current = selected;
  }, [selected]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-7 flex items-center">
        {isYearly && yearlySavings && (
          <span
            ref={badgeRef}
            className="text-sm font-bold px-4 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', display: 'inline-block' }}
          >
            {yearlySavings}% OFF
          </span>
        )}
      </div>
      <div className="flex rounded-full p-1 gap-1" style={{ backgroundColor: 'var(--bg-input)' }}>
        {plans.map(p => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
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
  );
}
