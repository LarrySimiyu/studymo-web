'use client';

import { cn } from '@/lib/utils';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  active: T;
  onChange: (value: T) => void;
  /** Stretches each segment to fill the track. */
  fill?: boolean;
  className?: string;
}

/**
 * Pill-in-a-track switch for two or three peer views. Distinct from SlidingTabs,
 * which is the underlined tab bar for navigating sections of a page.
 */
export default function SegmentedTabs<T extends string>({
  segments, active, onChange, fill, className,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 rounded-lg bg-[var(--bg-input)] p-1', fill ? 'w-full' : 'w-fit', className)}
    >
      {segments.map(seg => (
        <button
          key={seg.value}
          role="tab"
          aria-selected={active === seg.value}
          onClick={() => onChange(seg.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            fill && 'flex-1',
            active === seg.value
              ? 'bg-[var(--bg-card)] text-[var(--text-1)] shadow-[var(--shadow-card)]'
              : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
          )}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
