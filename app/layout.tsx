import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import RouteTracker from '@/components/analytics/RouteTracker';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'StudyMo - AI Notes, Tutoring and Study App',
  description: 'Upload your notes, lectures, and slides. StudyMo instantly builds your study plan, generates flashcards, quizzes, and gives you an AI tutor available 24/7.',
  keywords: ['AI study app', 'study plan generator', 'AI flashcards', 'AI tutor', 'college study tool'],
  openGraph: {
    title: 'StudyMo - AI Notes, Tutoring and Study App',
    description: 'Upload your notes and let AI build your entire study plan, flashcards, quizzes and more.',
    url: 'https://studymo.app',
    siteName: 'StudyMo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyMo - AI Notes, Tutoring and Study App',
    description: 'Upload your notes and let AI build your entire study plan, flashcards, quizzes and more.',
  },
  metadataBase: new URL('https://studymo.app'),
  alternates: {
    canonical: 'https://studymo.app',
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={playfair.variable}>
      <body className={inter.className}>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <RouteTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
