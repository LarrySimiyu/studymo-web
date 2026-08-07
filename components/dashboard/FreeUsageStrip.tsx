'use client';

import { useUsage } from '@/hooks/useUsage';
import type { FreeLimitKey } from '@/lib/api/billing';

const ROWS: Array<{ key: FreeLimitKey; label: string }> = [
  { key: 'uploads', label: 'Uploads' },
  { key: 'notes', label: 'Notes' },
  { key: 'aiMessages', label: 'Tutor messages' },
];

/** The headline free quotas, so running out isn't the first time a student
 *  hears about them. Hidden for subscribers. */
export default function FreeUsageStrip() {
  const { isFree, used, limit } = useUsage();
  if (!isFree) return null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-xl px-2.5 py-2"
      style={{ backgroundColor: 'var(--bg-input)' }}
    >
      <p className="text-2xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
        Free plan
      </p>
      {ROWS.map(({ key, label }) => {
        const max = limit(key);
        const spent = Math.min(used(key), max);
        const pct = max > 0 ? (spent / max) * 100 : 0;
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xs" style={{ color: 'var(--text-2)' }}>{label}</span>
              <span
                className="text-2xs tabular-nums"
                style={{ color: spent >= max ? 'var(--brand-ink)' : 'var(--text-3)' }}
              >
                {spent}/{max}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: 'var(--brand)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
