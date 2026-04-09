'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SchoolsMarquee from '@/components/landing/SchoolsMarquee';
import LearningStyleSection from '@/components/landing/LearningStyleSection';
import HowItWorks from '@/components/landing/HowItWorks';

export default function LandingPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, loading, router]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'StudyMo',
    url: 'https://studymo.app',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web',
    description:
      'StudyMo is an AI-powered study app for students. Upload your notes, lectures, and slides to instantly generate flashcards, quizzes, study plans, and get 24/7 AI tutoring.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    featureList: [
      'AI-generated flashcards',
      'AI-generated quizzes',
      'Personalized study plans',
      'AI tutor chat',
      'Weak topic tracking',
      'Podcast generation from notes',
      'Practice exams',
    ],
  };

  return (
    <main style={{ backgroundColor: '#0A0A0A' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <SchoolsMarquee />
      <LearningStyleSection />
      <HowItWorks />
      <footer className="flex justify-center gap-6 py-6">
        <a href="/privacy" className="text-xs" style={{ color: 'var(--text-2)' }}>Privacy Policy</a>
        <a href="/terms" className="text-xs" style={{ color: 'var(--text-2)' }}>Terms of Service</a>
      </footer>
    </main>
  );
}
