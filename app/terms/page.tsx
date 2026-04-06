import Link from 'next/link';

export const metadata = { title: 'Terms of Service — StudyMo' };

export default function TermsPage() {
  return (
    <div className="min-h-screen px-5 py-12" style={{ backgroundColor: '#0A0A0A', color: 'rgba(255,255,255,0.85)' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">StudyMo</Link>
          <h1 className="mt-6 text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: April 6, 2026</p>
        </div>

        <Section title="1. Acceptance of Terms">
          By creating an account or using StudyMo, you agree to these Terms of Service. If you do not agree, please do not use the service.
        </Section>

        <Section title="2. Use of the Service">
          StudyMo is an AI-powered study platform for personal, non-commercial educational use. You agree not to misuse the service, attempt to reverse-engineer it, or use it for any unlawful purpose.
        </Section>

        <Section title="3. Accounts">
          You are responsible for maintaining the security of your account. You must provide accurate information when signing up. We reserve the right to terminate accounts that violate these terms.
        </Section>

        <Section title="4. Subscriptions & Billing">
          Some features require a paid subscription. Payments are processed securely through Stripe. Subscriptions renew automatically unless cancelled before the renewal date. You can manage or cancel your subscription at any time through your billing settings.
        </Section>

        <Section title="5. Your Content">
          You retain ownership of any files, notes, or content you upload. By uploading content, you grant StudyMo a limited licence to process it solely for the purpose of providing the service to you. We do not sell your content to third parties.
        </Section>

        <Section title="6. AI-Generated Content">
          StudyMo uses AI to generate notes, quizzes, flashcards, and other study materials. AI-generated content may not always be accurate. You are responsible for verifying any information before relying on it.
        </Section>

        <Section title="7. Intellectual Property">
          The StudyMo name, logo, and platform are owned by us. You may not copy, reproduce, or distribute any part of the platform without permission.
        </Section>

        <Section title="8. Disclaimer of Warranties">
          StudyMo is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that AI-generated content will be accurate.
        </Section>

        <Section title="9. Limitation of Liability">
          To the fullest extent permitted by law, StudyMo is not liable for any indirect, incidental, or consequential damages arising from your use of the service.
        </Section>

        <Section title="10. Changes to These Terms">
          We may update these terms from time to time. Continued use of StudyMo after changes are posted constitutes your acceptance of the updated terms.
        </Section>

        <Section title="11. Contact">
          For questions about these terms, contact us at{' '}
          <a href="mailto:support@studymo.app" className="underline underline-offset-2" style={{ color: '#FF6500' }}>
            support@studymo.app
          </a>.
        </Section>

        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link href="/privacy" className="text-sm underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Privacy Policy →
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
