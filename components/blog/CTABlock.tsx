import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type Props = {
  headline?: string;
  body?: string;
  label?: string;
};

export default function CTABlock({
  headline = 'Ready to study smarter?',
  body = 'Upload your notes and get flashcards, quizzes, and a study plan in minutes.',
  label = 'Try for free',
}: Props) {
  return (
    <div
      className="mt-16 rounded-2xl p-6 sm:p-8 text-center border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
        {headline}
      </p>
      <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
        {body}
      </p>
      <Button variant="primary" size="lg" asChild className="rounded-full px-10">
        <Link href="/sign-up">{label}</Link>
      </Button>
    </div>
  );
}
