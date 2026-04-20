import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import chatScreenshot from '@/assets/chat-screenshot.png';
import LandingCTA from './LandingCTA';

type Props = {
  segment: string;
  utmCampaign: string;
  h1: string;
  subheadline: string;
  screenshotAlt: string;
  badge: string;
};

export default function LandingHero({ segment, utmCampaign, h1, subheadline, screenshotAlt, badge }: Props) {
  return (
    <section
      className="relative flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[700px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.2) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 pt-28 sm:pt-40 pb-20 max-w-4xl mx-auto w-full">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-wide"
          style={{
            backgroundColor: 'rgba(255,101,0,0.1)',
            border: '1px solid rgba(255,101,0,0.25)',
            color: '#FF6500',
          }}
        >
          {badge}
        </div>

        <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white">
          {h1}
        </h1>

        <p
          className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {subheadline}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 w-full">
          <Suspense
            fallback={
              <Button asChild variant="brand" size="lg" className="rounded-full px-10 w-full max-w-[280px]">
                <Link href="/sign-up">Start For Free</Link>
              </Button>
            }
          >
            <LandingCTA
              segment={segment}
              utmCampaign={utmCampaign}
              position="hero"
              className="w-full max-w-[280px]"
            />
          </Suspense>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No credit card required. Cancel any time.
          </p>
        </div>

        {/* App screenshot mockup */}
        <div className="relative w-full mt-20">
          <div
            className="absolute bottom-0 left-0 right-0 h-56 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
          />
          <div className="border-beam-wrap rounded-2xl p-[1.5px] shadow-2xl">
            <div className="rounded-[14px] overflow-hidden">
              <Image
                src={chatScreenshot}
                alt={screenshotAlt}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @property --beam-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes beam-spin {
            to { --beam-angle: 360deg; }
          }
          .border-beam-wrap {
            background: conic-gradient(
              from var(--beam-angle),
              transparent 0%,
              transparent 72%,
              rgba(255, 101, 0, 0.04) 78%,
              rgba(255, 101, 0, 0.25) 86%,
              rgba(255, 101, 0, 0.75) 93%,
              #FF6500 98%,
              transparent 100%
            );
            animation: beam-spin 10s linear infinite;
          }
        ` }} />
      </div>
    </section>
  );
}
