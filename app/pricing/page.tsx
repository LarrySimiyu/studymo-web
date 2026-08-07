'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import PricingGrid from '@/components/pricing/PricingGrid';
import PricingSkeleton from '@/components/pricing/PricingSkeleton';
import { usePlanCheckout } from '@/hooks/usePlanCheckout';

export default function PricingPage() {
  const router = useRouter();

  const { plans, pendingId, currentPlanId, hasSubscription, select } = usePlanCheckout({
    onFree: () => router.push('/dashboard'),
    onUnauthenticated: () => router.push('/sign-up'),
  });

  return (
    <div className="light" style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-14">
          <h1
            className="font-extrabold tracking-tight"
            style={{ color: 'var(--text-1)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.1 }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-body sm:text-body-lg" style={{ color: 'var(--text-2)' }}>
            No credit card required, cancel anytime
          </p>
        </div>

        {plans.length === 0 ? (
          <PricingSkeleton count={4} />
        ) : (
          <PricingGrid
            plans={plans}
            includeFree
            ctaLabel="Start for free"
            pendingId={pendingId}
            currentPlanId={currentPlanId}
            hasSubscription={hasSubscription}
            onSelect={select}
          />
        )}
      </div>
    </div>
  );
}
