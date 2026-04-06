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

  return (
    <main style={{ backgroundColor: '#0A0A0A' }}>
      <Navbar />
      <Hero />
      <SchoolsMarquee />
      <LearningStyleSection />
      <HowItWorks />
    </main>
  );
}
