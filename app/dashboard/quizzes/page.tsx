'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { documentsApi, quizzesApi, Document, Quiz } from '@/lib/api/documents';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import QuestionCard from '@/components/ui/QuestionCard';

const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

interface DeckEntry {
  document: Document;
  quiz: Quiz;
}

interface QuizQuestion {
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

function StartScreen({ documentId, title, count, onStart }: { documentId: string; title: string; count: number; onStart: () => void }) {
  const [iconColor, iconBg] = getPalette(documentId);
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Heart size={52} style={{ color: iconColor }} fill={iconColor} />
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--text-1)]">{title}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{count} Questions</p>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 rounded-xl font-medium text-sm text-white hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
      >
        Start Quiz
      </button>
    </div>
  );
}

// ── Inline quiz runner ──────────────────────────────────────────────

function QuizRunner({ deck, onBack }: { deck: DeckEntry; onBack: () => void }) {
  const questions: QuizQuestion[] = (() => {
    try { return JSON.parse(deck.quiz.questions); } catch { return []; }
  })();

  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  function handleAnswer(answer: string) {
    if (selected !== null) return;
    setSelected(answer);
    setAnswers(prev => ({ ...prev, [qIndex]: answer }));
  }

  function next() {
    if (qIndex + 1 >= questions.length) {
      const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
      setScore(correct);
      setDone(true);
      quizzesApi.submitAttempt(deck.quiz.id, (correct / questions.length) * 100, answers).catch(() => {});
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
      setShortAnswer('');
    }
  }

  function skip() {
    next();
  }

  function reset() {
    setStarted(false);
    setQIndex(0);
    setSelected(null);
    setShortAnswer('');
    setAnswers({});
    setDone(false);
    setScore(0);
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 sm:px-6">
      <div className="mb-8">
        <button onClick={onBack} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      {!started ? (
        <StartScreen
          documentId={deck.document.id}
          title={deck.document.title}
          count={questions.length}
          onStart={() => setStarted(true)}
        />
      ) : done ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-5xl font-bold text-[var(--text-1)]">{score} / {questions.length}</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--brand)' }}>
            {Math.round((score / questions.length) * 100)}%
          </p>
          <p className="text-[var(--text-2)] text-sm">
            {score / questions.length >= 0.8 ? 'Great job! 🎉' : 'Keep studying! 📚'}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Retake Quiz
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-black/5 transition-colors"
              style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >
              All Quizzes
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Progress bar */}
          <div className="mb-6">
            <ProgressBar index={qIndex} total={questions.length} />
          </div>

          <QuestionCard
            question={questions[qIndex].question}
            type={questions[qIndex].type}
            options={questions[qIndex].options}
            correctAnswer={questions[qIndex].correctAnswer}
            explanation={questions[qIndex].explanation}
            revealAnswer={true}
            selected={selected}
            shortAnswerValue={shortAnswer}
            onShortAnswerChange={setShortAnswer}
            onAnswer={handleAnswer}
          />

          <div className="flex gap-2">
            {selected === null && (
              <button
                onClick={skip}
                className="px-4 py-2.5 rounded-lg text-sm text-[var(--text-2)] border hover:bg-black/5 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                Skip
              </button>
            )}
            {selected !== null && (
              <button
                onClick={next}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                {qIndex + 1 >= questions.length ? 'See Results' : 'Next'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quizzes list page ────────────────────────────────────────────────

export default function QuizzesPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<DeckEntry | null>(null);
  const [deckLoading, setDeckLoading] = useState(false);

  useEffect(() => {
    documentsApi.getAll().then(async ({ data: docs }) => {
      if (!docs) { setLoading(false); return; }
      const completed = docs.filter(d => d.status === 'complete');
      const results = await Promise.all(
        completed.map(async doc => {
          const { data } = await quizzesApi.getByDocument(doc.id);
          return data ? { document: doc, quiz: data } : null;
        })
      );
      setDecks(results.filter((r): r is DeckEntry => r !== null));
      setLoading(false);
    });
  }, []);

  async function openDeck(entry: DeckEntry) {
    setDeckLoading(true);
    // Re-fetch to get latest quiz state
    const { data } = await quizzesApi.getByDocument(entry.document.id);
    if (data) setActiveDeck({ document: entry.document, quiz: data });
    setDeckLoading(false);
  }

  if (activeDeck) {
    return <QuizRunner deck={activeDeck} onBack={() => setActiveDeck(null)} />;
  }

  const questions = (quiz: Quiz): number => {
    try { return JSON.parse(quiz.questions).length; } catch { return 0; }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader title="Quizzes" action={{ label: 'New Quiz', href: '/dashboard/library' }} />

      {loading || deckLoading ? (
        <LoadingSpinner size="lg" />
      ) : decks.length === 0 ? (
        <div className="flex items-center gap-6 p-8 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(236,72,153,0.12)' }}>
            <Heart size={40} fill="#EC4899" style={{ color: '#EC4899' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-1)]">No Quizzes</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Test your knowledge and pinpoint weak spots before exam day.</p>
            <Link
              href="/dashboard/library"
              className="mt-4 inline-block px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
            >
              Go to Notes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(entry => {
            const [iconColor, iconBg] = getPalette(entry.document.id);
            const count = questions(entry.quiz);
            return (
              <button
                key={entry.document.id}
                onClick={() => openDeck(entry)}
                className="p-5 rounded-xl transition-colors text-left"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Heart size={26} style={{ color: iconColor }} fill={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">{count}</p>
                      <p className="text-3xl font-bold text-[var(--text-1)] leading-none">Questions</p>
                    </div>
                    <p className="text-xs text-[var(--text-3)] truncate mt-1">{entry.document.title}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
