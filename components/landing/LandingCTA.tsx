'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { buildCTAHref, trackCTAClick } from '@/lib/landing/tracking';

type Props = {
  segment: string;
  utmCampaign: string;
  position: 'hero' | 'mid' | 'bottom';
  label?: string;
  className?: string;
};

export default function LandingCTA({
  segment,
  utmCampaign,
  position,
  label = 'Start For Free',
  className = '',
}: Props) {
  const searchParams = useSearchParams();

  const utmParams = {
    utm_source: searchParams.get('utm_source') ?? undefined,
    utm_medium: searchParams.get('utm_medium') ?? undefined,
    utm_campaign: searchParams.get('utm_campaign') ?? undefined,
    utm_content: searchParams.get('utm_content') ?? undefined,
    utm_term: searchParams.get('utm_term') ?? undefined,
  };

  const href = buildCTAHref(utmParams, utmCampaign);

  return (
    <Button
      asChild
      variant="brand"
      size="lg"
      className={`rounded-full px-10 hover:scale-105 hover:opacity-100 transition-transform ${className}`}
      onClick={() => trackCTAClick(segment, position)}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}
