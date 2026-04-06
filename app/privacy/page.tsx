import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — StudyMo' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-5 py-12" style={{ backgroundColor: '#0A0A0A', color: 'rgba(255,255,255,0.85)' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">StudyMo</Link>
          <h1 className="mt-6 text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: April 6, 2026</p>
        </div>

        <Section title="1. What We Collect">
          When you sign up, we collect your name and email address via Google or Apple sign-in. When you use the service, we collect the files and content you upload, the study materials generated for you, and usage data such as session activity and quiz results.
        </Section>

        <Section title="2. How We Use Your Data">
          We use your data to provide and improve the StudyMo service — including generating notes, quizzes, flashcards, and podcasts from your uploads. We also use it to maintain your account, process payments, and send important service-related emails.
        </Section>

        <Section title="3. AI Processing">
          Content you upload is sent to third-party AI providers (Anthropic and OpenAI) solely to generate study materials for you. These providers process your content under their own privacy policies and do not use it to train their models.
        </Section>

        <Section title="4. Data Storage">
          Your files and generated content are stored securely on Cloudflare R2. Your account data is stored in a private PostgreSQL database. We do not sell your data to advertisers or third parties.
        </Section>

        <Section title="5. Payments">
          Payments are handled by Stripe. We do not store your payment card details. Stripe&apos;s privacy policy governs how your payment information is handled.
        </Section>

        <Section title="6. Cookies & Analytics">
          We use cookies to keep you signed in. We may use anonymous usage analytics to understand how the product is used. We do not use third-party advertising trackers.
        </Section>

        <Section title="7. Data Retention">
          We retain your data for as long as your account is active. If you delete your account, your data is permanently removed within 30 days.
        </Section>

        <Section title="8. Your Rights">
          You have the right to access, correct, or delete the personal data we hold about you. To make a request, contact us at the email below.
        </Section>

        <Section title="9. Children">
          StudyMo is not directed at children under 13. We do not knowingly collect personal information from children under 13.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this policy from time to time. We will notify you of significant changes by email or in-app notice.
        </Section>

        <Section title="11. Contact">
          Questions about your privacy? Reach us at{' '}
          <a href="mailto:support@studymo.app" className="underline underline-offset-2" style={{ color: '#FF6500' }}>
            support@studymo.app
          </a>.
        </Section>

        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link href="/terms" className="text-sm underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{children}</p>
    </div>
  );
}
