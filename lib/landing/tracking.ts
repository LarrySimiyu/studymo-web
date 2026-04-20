import { track } from '@/lib/analytics';
import { gaCtaClick } from '@/lib/analytics/ga';

export const SIGNUP_URL = '/sign-up';

type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export function buildCTAHref(utmParams: UTMParams, campaign: string): string {
  const params = new URLSearchParams();

  const source = utmParams.utm_source || 'direct';
  const medium = utmParams.utm_medium || 'organic';
  const utmCampaign = utmParams.utm_campaign || campaign;

  params.set('utm_source', source);
  params.set('utm_medium', medium);
  params.set('utm_campaign', utmCampaign);

  if (utmParams.utm_content) params.set('utm_content', utmParams.utm_content);
  if (utmParams.utm_term) params.set('utm_term', utmParams.utm_term);

  return `${SIGNUP_URL}?${params.toString()}`;
}

export function trackCTAClick(segment: string, position: 'hero' | 'mid' | 'bottom'): void {
  track('landing_cta_click', { segment, position });
  gaCtaClick(segment, position);
}
