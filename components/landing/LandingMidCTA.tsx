import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LandingCTA from './LandingCTA';

type Props = {
  segment: string;
  utmCampaign: string;
  midCTACopy: string;
};

export default function LandingMidCTA({ segment, utmCampaign, midCTACopy }: Props) {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div
        className="max-w-2xl mx-auto rounded-2xl p-8 sm:p-10 text-center"
        style={{
          backgroundColor: '#141414',
          border: '1px solid rgba(255,101,0,0.15)',
        }}
      >
        <p
          className="text-base sm:text-lg leading-relaxed mb-8"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {midCTACopy}
        </p>
        <Suspense
          fallback={
            <Button asChild variant="brand" size="lg" className="rounded-full px-10">
              <Link href="/sign-up">Start For Free</Link>
            </Button>
          }
        >
          <LandingCTA segment={segment} utmCampaign={utmCampaign} position="mid" />
        </Suspense>
      </div>
    </section>
  );
}
