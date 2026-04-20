import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import LandingHero from '@/components/landing/LandingHero';
import LandingProof from '@/components/landing/LandingProof';
import LandingProblem from '@/components/landing/LandingProblem';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingMidCTA from '@/components/landing/LandingMidCTA';
import LandingComparison from '@/components/landing/LandingComparison';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingBottomCTA from '@/components/landing/LandingBottomCTA';
import HowItWorks from '@/components/landing/HowItWorks';
import SchoolsMarquee from '@/components/landing/SchoolsMarquee';
import LearningStyleSection from '@/components/landing/LearningStyleSection';
import { segments } from '@/lib/landing/segments';
import LandingFooter from '@/components/landing/LandingFooter';

type Props = {
  params: { segment: string };
};

export function generateStaticParams() {
  return Object.keys(segments).map((slug) => ({ segment: slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const seg = segments[params.segment];
  if (!seg) return {};

  const url = `https://studymo.app/landing/${seg.slug}`;

  return {
    title: seg.title,
    description: seg.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: seg.title,
      description: seg.metaDescription,
      url,
      siteName: 'Studymo',
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default function LandingPage({ params }: Props) {
  const seg = segments[params.segment];
  if (!seg) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: seg.title,
        description: seg.metaDescription,
        url: `https://studymo.app/landing/${seg.slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'Studymo',
          url: 'https://studymo.app',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: seg.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <main style={{ backgroundColor: '#0A0A0A' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <LandingHero
        segment={seg.slug}
        utmCampaign={seg.utmCampaign}
        h1={seg.h1}
        subheadline={seg.subheadline}
        screenshotAlt={seg.screenshotAlt}
        badge={seg.badge}
      />

      <LearningStyleSection
        label={seg.learningStyleSection.label}
        heading={seg.learningStyleSection.heading}
        body={seg.learningStyleSection.body}
      />

      <SchoolsMarquee />

      <LandingProof quotes={seg.socialProofQuotes} />

      <LandingProblem problemStatement={seg.problemStatement} />

      <HowItWorks steps={seg.howItWorksSteps} />

      <LandingFeatures features={seg.features} />

      <LandingMidCTA
        segment={seg.slug}
        utmCampaign={seg.utmCampaign}
        midCTACopy={seg.midCTACopy}
      />

      {seg.isComparison && seg.comparisonTarget && seg.comparisonRows && (
        <LandingComparison
          comparisonTarget={seg.comparisonTarget}
          rows={seg.comparisonRows}
        />
      )}

      <LandingFAQ faq={seg.faq} />

      <LandingBottomCTA
        segment={seg.slug}
        utmCampaign={seg.utmCampaign}
        bottomCTACopy={seg.bottomCTACopy}
      />

      <LandingFooter />
    </main>
  );
}
