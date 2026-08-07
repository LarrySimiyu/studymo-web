'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageShell from '@/components/dashboard/PageShell';
import { practiceExamsApi, PracticeExam, PracticeExamAttempt, ExamContent, ExamQuestion, ExamSection } from '@/lib/api/organization';
import ProgressBar from '@/components/ui/ProgressBar';
import MultipleChoiceOptions from '@/components/ui/MultipleChoiceOptions';
import QuestionCard from '@/components/ui/QuestionCard';

// ── Circular countdown timer ────────────────────────────────────────────────
function CircularTimer({ totalSeconds, onExpire }: { totalSeconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(remaining / totalSeconds, 0);
  const strokeDashoffset = circumference * (1 - progress);
  const isLow = remaining <= 60 && remaining > 0;
  const isDone = remaining <= 0;

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const mins = Math.floor(Math.abs(remaining) / 60);
  const secs = Math.abs(remaining) % 60;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="var(--border)" strokeWidth="9" />
        <circle cx="45" cy="45" r={radius} fill="none"
          stroke={isDone ? '#ef4444' : isLow ? '#f97316' : 'var(--brand)'}
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={isDone ? circumference : strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[var(--text-1)] text-xs font-mono font-semibold">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
        {isDone && <span className="text-[var(--danger-ink)] text-2xs leading-none mt-0.5">Time up</span>}
      </div>
    </div>
  );
}

export default function PracticeExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'take' | 'results'>(
    searchParams.get('start') === '1' ? 'take' : 'select'
  );

  const STORAGE_KEY = `exam_progress_${id}`;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradingResults, setGradingResults] = useState<Record<number, { correct: boolean; partialCredit: number; feedback: string }>>({});
  const [finalScore, setFinalScore] = useState<{ earned: number; total: number } | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<PracticeExamAttempt | null>(null);
  const progressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      practiceExamsApi.getById(id),
      practiceExamsApi.getProgress(id),
      practiceExamsApi.getAttempts(id),
    ]).then(([examRes, progressRes, attemptsRes]) => {
      if (examRes.data) setExam(examRes.data);
      if (attemptsRes.data?.length) setLatestAttempt(attemptsRes.data[0]);
      // Prefer API progress, fall back to localStorage
      const apiAnswers = progressRes.data?.answers;
      if (apiAnswers && Object.keys(apiAnswers).length > 0) {
        setAnswers(apiAnswers);
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const { answers: savedAnswers } = JSON.parse(saved);
            if (savedAnswers && Object.keys(savedAnswers).length > 0) setAnswers(savedAnswers);
          }
        } catch {}
      }
      setLoading(false);
    });
  }, [id, STORAGE_KEY]);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers })); } catch {}
    if (progressDebounceRef.current) clearTimeout(progressDebounceRef.current);
    progressDebounceRef.current = setTimeout(() => {
      practiceExamsApi.saveProgress(id, answers).catch(() => {});
    }, 2000);
  }, [answers, STORAGE_KEY, id]);

  const setAnswer = useCallback((num: number, val: string) => {
    setAnswers(prev => ({ ...prev, [num]: val }));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!exam) return <div className="text-[var(--text-2)] py-10 text-center">Exam not found.</div>;

  let examContent: ExamContent;
  try {
    examContent = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions as ExamContent;
  } catch {
    return <div className="text-[var(--text-2)] py-10 text-center">Failed to load exam content.</div>;
  }

  const allQuestions: (ExamQuestion & { sectionTitle: string })[] = [];
  for (const section of examContent.sections ?? []) {
    for (const q of section.questions ?? []) {
      allQuestions.push({ ...q, sectionTitle: section.title });
    }
  }

  const totalAnswered = Object.keys(answers).length;
  const durationSeconds = (examContent.estimatedMinutes ?? 25) * 60;

  async function handleSubmit() {
    setGrading(true);
    const results: Record<number, { correct: boolean; partialCredit: number; feedback: string }> = {};
    let earned = 0;
    let total = 0;

    // Grade objective questions immediately
    for (const q of allQuestions) {
      total += q.points;
      const userAnswer = answers[q.number] ?? '';
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const correct = userAnswer === q.correctAnswer;
        results[q.number] = { correct, partialCredit: correct ? 1 : 0, feedback: q.explanation ?? '' };
        if (correct) earned += q.points;
      } else if (!userAnswer.trim()) {
        results[q.number] = { correct: false, partialCredit: 0, feedback: 'No answer provided' };
      }
    }

    // Grade all short answer questions in parallel
    const shortAnswerQuestions = allQuestions.filter(
      q => q.type === 'short_answer' && (answers[q.number] ?? '').trim()
    );
    const shortAnswerResults = await Promise.all(
      shortAnswerQuestions.map(q =>
        practiceExamsApi.gradeAnswer({
          question: q.question,
          correctAnswer: q.correctAnswer ?? '',
          userAnswer: answers[q.number],
        }).then(({ data }) => ({
          number: q.number,
          points: q.points,
          result: data ?? { correct: false, partialCredit: 0, feedback: 'Unable to grade' },
        }))
      )
    );
    for (const { number, points, result } of shortAnswerResults) {
      results[number] = result;
      earned += Math.round(points * result.partialCredit);
    }

    setGradingResults(results);
    setFinalScore({ earned, total });
    setSubmitted(true);
    setGrading(false);
    if (progressDebounceRef.current) clearTimeout(progressDebounceRef.current);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setMode('results');
    // Save attempt to backend — fire-and-forget
    practiceExamsApi.submitAttempt(id, {
      score: total > 0 ? Math.round((earned / total) * 100) : 0,
      earnedPoints: earned,
      totalPoints: total,
      answers,
      results,
    }).then(({ data }) => { if (data) setLatestAttempt(data); }).catch(() => {});
  }

  // ── Select Mode ──────────────────────────────────────────────────────────────
  if (mode === 'select') {
    const typeColors: Record<string, string> = {
      multiple_choice: 'var(--brand)',
      short_answer: '#14B8A6',
      true_false: '#F59E0B',
    };

    const sectionTypes = examContent.sections?.map(s => {
      const q = s.questions?.[0];
      return { title: s.title, count: s.questions?.length ?? 0, type: q?.type };
    }) ?? [];

    return (
      <PageShell width="sm" center>
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-heading-sm md:text-heading text-[var(--text-1)]">{exam.title}</h1>
            <p className="mt-1 text-body-sm text-[var(--text-2)]">
              {examContent.totalPoints ?? '?'} pts · ~{examContent.estimatedMinutes ?? '?'} min
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {sectionTypes.map(s => (
            <div
              key={s.title}
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: typeColors[s.type ?? ''] ?? 'var(--brand)' }} />
              <p className="text-body-lg font-semibold text-[var(--text-1)]">{s.count}</p>
              <p className="mt-0.5 text-xs text-[var(--text-2)]">{s.title}</p>
            </div>
          ))}
        </div>

        {(submitted && finalScore ? true : !!latestAttempt) && (
          <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
            {submitted && finalScore ? (
              <>
                <p className="text-heading text-[var(--text-1)]">{finalScore.earned} / {finalScore.total}</p>
                <p className="mt-1 text-body-sm text-[var(--brand-ink)]">
                  {Math.round((finalScore.earned / finalScore.total) * 100)}%
                </p>
              </>
            ) : latestAttempt ? (
              <>
                <p className="text-xs text-[var(--text-3)] mb-1">Last attempt · {new Date(latestAttempt.createdAt).toLocaleDateString()}</p>
                <p className="text-heading text-[var(--text-1)]">{latestAttempt.earnedPoints} / {latestAttempt.totalPoints}</p>
                <p className="mt-1 text-body-sm text-[var(--brand-ink)]">{Math.round(latestAttempt.score)}%</p>
              </>
            ) : null}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => { setAnswers({}); setSubmitted(false); setTimeExpired(false); setGradingResults({}); setFinalScore(null); setMode('take'); }}
          >
            {submitted || latestAttempt ? 'Retake Exam' : 'Take Exam'}
          </Button>
          {submitted && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setMode('results')}>
              View Results
            </Button>
          )}
        </div>
      </PageShell>
    );
  }

  // ── Take Mode ─────────────────────────────────────────────────────────────────
  if (mode === 'take') {
    return (
      <PageShell center>
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => setMode('select')} aria-label="Back">
            <ArrowLeft size={18} />
          </Button>
          <h1 className="flex-1 truncate text-heading-sm text-[var(--text-1)]">{exam.title}</h1>
          <CircularTimer totalSeconds={durationSeconds} onExpire={() => setTimeExpired(true)} />
        </div>

        {timeExpired && (
          <div className="mb-6 rounded-xl bg-[var(--danger-subtle)] px-4 py-3">
            <span className="text-body-sm font-medium text-[var(--danger-ink)]">Time is up — but you can keep going and submit when ready.</span>
          </div>
        )}

        <div className="mb-8">
          <ProgressBar index={totalAnswered - 1} total={allQuestions.length} />
        </div>

        <div className="space-y-8">
          {(examContent.sections ?? []).map((section: ExamSection) => (
            <div key={section.title}>
              <div className="mb-4">
                <h2 className="text-body-lg font-semibold text-[var(--text-1)]">{section.title}</h2>
                <p className="text-body-sm text-[var(--text-2)]">{section.instructions}</p>
              </div>
              <div className="space-y-4">
                {section.questions.map((q: ExamQuestion) => (
                  <QuestionCard
                    key={q.number}
                    question={q.question}
                    type={q.type}
                    options={q.options}
                    correctAnswer={q.correctAnswer}
                    explanation={q.explanation}
                    revealAnswer={false}
                    selected={q.type !== 'short_answer' ? (answers[q.number] ?? null) : null}
                    shortAnswerValue={q.type === 'short_answer' ? (answers[q.number] ?? '') : ''}
                    onShortAnswerChange={q.type === 'short_answer' ? (val) => setAnswer(q.number, val) : undefined}
                    onAnswer={(val) => setAnswer(q.number, val)}
                    number={q.number}
                    points={q.points}
                    selectionColor="var(--bg-hover)"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              if (progressDebounceRef.current) clearTimeout(progressDebounceRef.current);
              if (Object.keys(answers).length > 0) {
                practiceExamsApi.saveProgress(id, answers).catch(() => {});
              }
              setMode('select');
            }}
          >
            Save &amp; Exit
          </Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={grading}>
            {grading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {grading ? 'Grading…' : 'Submit Exam'}
          </Button>
        </div>
      </PageShell>
    );
  }

  // ── Results Mode ───────────────────────────────────────────────────────────────
  return (
    <PageShell center>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => setMode('select')} aria-label="Back">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="flex-1 truncate text-heading-sm text-[var(--text-1)]">{exam.title} — Results</h1>
      </div>

      {finalScore && (
        <div className="mb-8 p-6 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <p className="text-display text-[var(--text-1)]">{finalScore.earned} / {finalScore.total}</p>
          <p className="mt-1 text-body-lg text-[var(--brand-ink)]">{Math.round((finalScore.earned / finalScore.total) * 100)}%</p>
          <p className="mt-2 text-body-sm text-[var(--text-2)]">
            {finalScore.earned / finalScore.total >= 0.8 ? 'Excellent work' :
             finalScore.earned / finalScore.total >= 0.6 ? 'Good effort — keep studying' :
             'More review needed'}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {(examContent.sections ?? []).map((section: ExamSection) => (
          <div key={section.title}>
            <h2 className="mb-4 text-body-lg font-semibold text-[var(--text-1)]">{section.title}</h2>
            <div className="space-y-4">
              {section.questions.map((q: ExamQuestion) => {
                const result = gradingResults[q.number];
                const userAnswer = answers[q.number];
                const isCorrect = result?.correct;
                const isWrong = result && !result.correct;

                return (
                  <div
                    key={q.number}
                    className="p-5 rounded-xl"
                    style={{ backgroundColor: isCorrect ? 'var(--success-subtle)' : isWrong ? 'var(--danger-subtle)' : 'var(--bg-card)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[var(--text-1)] font-medium text-sm flex-1 pr-4">
                        <span className="text-[var(--text-3)] mr-2">{q.number}.</span>{q.question}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result && (
                          isCorrect
                            ? <Check size={15} className="text-[var(--success-ink)]" />
                            : <X size={15} className="text-[var(--danger-ink)]" />
                        )}
                        <span className="text-xs text-[var(--text-3)]">{q.points} pts</span>
                      </div>
                    </div>

                    {q.type === 'multiple_choice' && (
                      <div className="mb-3">
                        <MultipleChoiceOptions
                          options={q.options ?? []}
                          selected={userAnswer}
                          correctAnswer={q.correctAnswer}
                        />
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="flex gap-3 mb-3">
                        {['True', 'False'].map(opt => {
                          const isAnswer = opt === q.correctAnswer;
                          const isUserWrong = userAnswer === opt && opt !== q.correctAnswer;
                          return (
                            <div
                              key={opt}
                              className="px-3 py-2 rounded-lg text-sm flex-1 text-center"
                              style={{
                                backgroundColor: isAnswer ? '#166534' : isUserWrong ? '#7f1d1d' : 'var(--bg-input)',
                                color: isAnswer ? '#fff' : isUserWrong ? '#fff' : 'var(--text-2)',
                              }}
                            >
                              {opt} {isAnswer && <Check size={13} className="inline shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short_answer' && (
                      <div className="space-y-2 mb-3">
                        {userAnswer && (
                          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <p className="text-[var(--text-2)] text-xs mb-1">Your answer:</p>
                            <p className="text-[var(--text-2)]">{userAnswer}</p>
                          </div>
                        )}
                        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(22,163,74,0.15)' }}>
                          <p className="text-[var(--success-ink)] font-medium mb-1">Expected:</p>
                          <p className="text-[var(--text-2)]">{q.correctAnswer}</p>
                        </div>
                        {result?.feedback && (
                          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,101,0,0.1)' }}>
                            <p className="font-medium mb-1" style={{ color: 'var(--brand)' }}>Feedback:</p>
                            <p className="text-[var(--text-2)]">{result.feedback}</p>
                            <p className="text-[var(--text-3)] text-xs mt-1">
                              Credit: {Math.round((result.partialCredit ?? 0) * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {q.explanation && q.type !== 'short_answer' && (
                      <p className="text-[var(--text-2)] text-xs">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

