import AuthRedirect from '@/components/landing/AuthRedirect';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SchoolsMarquee from '@/components/landing/SchoolsMarquee';
import LearningStyleSection from '@/components/landing/LearningStyleSection';
import HowItWorks from '@/components/landing/HowItWorks';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
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
    <main className="light" style={{ backgroundColor: 'var(--bg-page)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthRedirect />
      <Navbar />
      <Hero />
      <SchoolsMarquee />
      <HowItWorks />
      <LearningStyleSection />
      <LandingFooter />
    </main>
  );
}
