'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import QuizRunner from '@/components/quiz/QuizRunner';
import { documentsApi, quizzesApi, Document, Quiz } from '@/lib/api/documents';
import PageShell from '@/components/dashboard/PageShell';
import { Button } from '@/components/ui/Button';

export default function QuizPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      documentsApi.getById(params.documentId),
      quizzesApi.getByDocument(params.documentId),
    ]).then(([{ data: document }, { data: quizData }]) => {
      setDoc(document ?? null);
      setQuiz(quizData ?? null);
      setLoading(false);
    });
  }, [params.documentId]);

  const exit = () => router.push('/dashboard/quizzes');

  return (
    <PageShell width="sm" center>
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" size="icon-sm" onClick={exit} aria-label="Back to quizzes">
          <ArrowLeft size={18} />
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : !doc || !quiz ? (
        <p className="text-body-sm text-[var(--text-3)] text-center py-16">
          This quiz is no longer available.
        </p>
      ) : (
        <QuizRunner key={quiz.id} document={doc} quiz={quiz} onBack={exit} />
      )}
    </PageShell>
  );
}
