'use client';

import { X } from 'lucide-react';
import PricingGrid from '@/components/pricing/PricingGrid';
import PricingSkeleton from '@/components/pricing/PricingSkeleton';
import { usePlanCheckout } from '@/hooks/usePlanCheckout';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: Props) {
  // Free is a column here too — it's the plan the user is on, and it's what the paid
  // columns' "Everything in Free" is measured against. It renders as "Current plan".
  const { plans, pendingId, currentPlanId, hasSubscription, select } = usePlanCheckout({
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent variant="fullscreen" className="flex flex-col">
        <div
          className="sticky top-0 z-10 flex shrink-0 items-center justify-end px-4 py-3 sm:px-6"
          style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}
        >
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close" className="h-8 w-8">
            <X size={18} />
          </Button>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-6 sm:px-6">
          <div className="flex w-full max-w-6xl flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <DialogTitle asChild>
                <h2
                  className="font-extrabold tracking-tight"
                  style={{ color: 'var(--text-1)', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: 1.15 }}
                >
                  Upgrade to unlimited
                </h2>
              </DialogTitle>
              <p className="text-body sm:text-body-lg" style={{ color: 'var(--text-2)' }}>
                Cancel anytime
              </p>
            </div>

            {plans.length === 0 ? (
              <PricingSkeleton count={4} />
            ) : (
              <PricingGrid
                plans={plans}
                includeFree
                ctaLabel="Upgrade"
                pendingId={pendingId}
                currentPlanId={currentPlanId}
                hasSubscription={hasSubscription}
                onSelect={select}
              />
            )}

            <Button variant="link" size="link" onClick={onClose} className="text-body-sm">
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
