import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LandingCTA from './LandingCTA';

type Props = {
  segment: string;
  utmCampaign: string;
  bottomCTACopy: string;
};

export default function LandingBottomCTA({ segment, utmCampaign, bottomCTACopy }: Props) {
  return (
    <section
      className="py-20 sm:py-28 px-4 sm:px-8 text-center"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center gap-8">
        <h2
          className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white"
        >
          {bottomCTACopy}
        </h2>
        <Suspense
          fallback={
            <Button asChild variant="primary" size="lg" className="rounded-full px-10">
              <Link href="/sign-up">Start For Free</Link>
            </Button>
          }
        >
          <LandingCTA
            segment={segment}
            utmCampaign={utmCampaign}
            position="bottom"
            label="Start For Free"
          />
        </Suspense>
      </div>
    </section>
  );
}
