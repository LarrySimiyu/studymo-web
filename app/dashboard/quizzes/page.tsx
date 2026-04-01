'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { documentsApi, quizzesApi, Document, Quiz } from '@/lib/api/documents';

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
    <div className="max-w-2xl mx-auto py-4">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text-1)]">{deck.document.title}</h1>
          <p className="text-xs text-[var(--text-2)]">{questions.length} questions</p>
        </div>
      </div>

      {!started ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: 'var(--bg-input)' }}>❓</div>
          <p className="text-[var(--text-1)] font-medium">{questions.length} questions ready</p>
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-2.5 rounded-xl font-medium text-sm text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Start Quiz
          </button>
        </div>
      ) : done ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-5xl font-bold text-[var(--text-1)]">{score} / {questions.length}</p>
          <p className="text-2xl font-semibold" style={{ color: '#9747FF' }}>
            {Math.round((score / questions.length) * 100)}%
          </p>
          <p className="text-[var(--text-2)] text-sm">
            {score / questions.length >= 0.8 ? 'Great job! 🎉' : 'Keep studying! 📚'}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#9747FF' }}
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
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${((qIndex) / questions.length) * 100}%`, backgroundColor: '#9747FF' }}
              />
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>
              {qIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[var(--text-1)] font-medium mb-5">{questions[qIndex].question}</p>

            {questions[qIndex].type === 'multiple_choice' && (
              <div className="space-y-2">
                {questions[qIndex].options?.map(opt => {
                  const isCorrect = opt === questions[qIndex].correctAnswer;
                  const isSelected = selected === opt;
                  let bg = 'var(--bg-input)';
                  let border = 'var(--border-md)';
                  if (selected) {
                    if (isCorrect) { bg = '#16a34a15'; border = '#16a34a'; }
                    else if (isSelected) { bg = '#dc262615'; border = '#dc2626'; }
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm text-[var(--text-1)] transition-colors"
                      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {questions[qIndex].type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(opt => {
                  const isCorrect = opt === questions[qIndex].correctAnswer;
                  const isSelected = selected === opt;
                  let bg = 'var(--bg-input)';
                  let border = 'var(--border-md)';
                  if (selected) {
                    if (isCorrect) { bg = '#16a34a15'; border = '#16a34a'; }
                    else if (isSelected) { bg = '#dc262615'; border = '#dc2626'; }
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="flex-1 py-3 rounded-lg text-sm font-medium text-[var(--text-1)] transition-colors"
                      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {questions[qIndex].type === 'short_answer' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={shortAnswer}
                  onChange={e => setShortAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !selected && shortAnswer && handleAnswer(shortAnswer)}
                  disabled={selected !== null}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
                  placeholder="Type your answer…"
                />
                {selected === null && (
                  <button
                    onClick={() => shortAnswer && handleAnswer(shortAnswer)}
                    disabled={!shortAnswer}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: '#9747FF' }}
                  >
                    Submit
                  </button>
                )}
              </div>
            )}

            {selected !== null && questions[qIndex].explanation && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--brand-subtle)', border: '1px solid var(--brand-border)' }}>
                <p className="font-medium mb-1" style={{ color: '#9747FF' }}>
                  {questions[qIndex].type === 'short_answer'
                    ? `Expected: ${questions[qIndex].correctAnswer}`
                    : selected === questions[qIndex].correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                <p className="text-[var(--text-1)]">{questions[qIndex].explanation}</p>
              </div>
            )}
          </div>

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
                style={{ backgroundColor: '#9747FF' }}
              >
                {qIndex + 1 >= questions.length ? 'See Results' : 'Next →'}
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Quizzes</h1>
        <Link
          href="/dashboard/library"
          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#9747FF' }}
        >
          + Upload Note
        </Link>
      </div>

      {loading || deckLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#9747FF' }} />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">❓</div>
          <p className="text-[var(--text-2)] text-sm">No quizzes yet.</p>
          <p className="text-[var(--text-3)] text-sm mt-1">Open a note and generate a quiz from the Quiz tab.</p>
          <Link
            href="/dashboard/library"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Go to Notes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(entry => (
            <button
              key={entry.document.id}
              onClick={() => openDeck(entry)}
              className="block p-5 rounded-xl transition-colors hover:border-purple-500/50 text-left"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  ❓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-medium text-sm truncate">{entry.document.title}</p>
                  <p className="text-[var(--text-2)] text-xs mt-0.5">{questions(entry.quiz)} questions</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
