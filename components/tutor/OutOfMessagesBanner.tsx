'use client';

import { Button } from '@/components/ui/Button';
import { showPaywall } from '@/lib/paywall';

/** Shown in place of a reply when a free user's tutor messages run out. Lives
 *  above the input in both the full tutor page and the in-document panel. */
export default function OutOfMessagesBanner() {
  return (
    <div
      className="mb-2 flex items-start gap-3 rounded-xl px-3 py-2.5"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--brand-border)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>
          You&rsquo;re out of free tutor messages
        </p>
        <p className="text-2xs" style={{ color: 'var(--text-3)' }}>
          Upgrade for unlimited chat with your tutor.
        </p>
      </div>
      <Button
        variant="upgrade"
        size="xs"
        onClick={() => showPaywall('aiMessages')}
        className="shrink-0"
      >
        Upgrade
      </Button>
    </div>
  );
}
