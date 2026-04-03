'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { practiceExamsApi, PracticeExam, ExamContent, ExamQuestion, ExamSection } from '@/lib/api/organization';
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
        {isDone && <span className="text-red-400 text-[10px] leading-none mt-0.5">Time up</span>}
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

  useEffect(() => {
    practiceExamsApi.getById(id).then(({ data }) => {
      if (data) setExam(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { answers: savedAnswers } = JSON.parse(saved);
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
          setAnswers(savedAnswers);
        }
      }
    } catch {}
  }, [id, STORAGE_KEY]);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers }));
    } catch {}
  }, [answers, STORAGE_KEY]);

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

    for (const q of allQuestions) {
      total += q.points;
      const userAnswer = answers[q.number] ?? '';

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const correct = userAnswer === q.correctAnswer;
        results[q.number] = { correct, partialCredit: correct ? 1 : 0, feedback: q.explanation ?? '' };
        if (correct) earned += q.points;
      } else if (q.type === 'short_answer' && userAnswer.trim()) {
        const { data } = await practiceExamsApi.gradeAnswer({
          question: q.question,
          correctAnswer: q.correctAnswer ?? '',
          userAnswer,
        });
        const res = data ?? { correct: false, partialCredit: 0, feedback: 'Unable to grade' };
        results[q.number] = res;
        earned += Math.round(q.points * res.partialCredit);
      } else {
        results[q.number] = { correct: false, partialCredit: 0, feedback: 'No answer provided' };
      }
    }

    setGradingResults(results);
    setFinalScore({ earned, total });
    setSubmitted(true);
    setGrading(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setMode('results');
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
      <div className="max-w-2xl mx-auto py-2">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">← Back</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-1)]">{exam.title}</h1>
            <p className="text-[var(--text-2)] text-sm mt-1">
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
              <p className="text-[var(--text-1)] font-semibold text-lg">{s.count}</p>
              <p className="text-[var(--text-2)] text-xs mt-0.5">{s.title}</p>
            </div>
          ))}
        </div>

        {submitted && finalScore && (
          <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <p className="text-[var(--text-1)] font-bold text-2xl">{finalScore.earned} / {finalScore.total}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--brand)' }}>
              {Math.round((finalScore.earned / finalScore.total) * 100)}%
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setAnswers({}); setSubmitted(false); setTimeExpired(false); setGradingResults({}); setFinalScore(null); setMode('take'); }}
            className="flex-1 py-3 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            {submitted ? 'Retake Exam' : 'Take Exam'}
          </button>
          {submitted && (
            <button
              onClick={() => setMode('results')}
              className="flex-1 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
            >
              View Results
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Take Mode ─────────────────────────────────────────────────────────────────
  if (mode === 'take') {
    return (
      <div className="max-w-3xl mx-auto py-2">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setMode('select')} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-base font-bold text-[var(--text-1)] truncate">{exam.title}</h1>
          <CircularTimer totalSeconds={durationSeconds} onExpire={() => setTimeExpired(true)} />
        </div>

        {timeExpired && (
          <div className="mb-6 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
            <span className="text-red-400 text-sm font-medium">Time is up — but you can keep going and submit when ready.</span>
          </div>
        )}

        <div className="mb-8">
          <ProgressBar index={totalAnswered - 1} total={allQuestions.length} />
        </div>

        <div className="space-y-8">
          {(examContent.sections ?? []).map((section: ExamSection) => (
            <div key={section.title}>
              <div className="mb-4">
                <h2 className="text-[var(--text-1)] font-semibold text-lg">{section.title}</h2>
                <p className="text-[var(--text-2)] text-sm">{section.instructions}</p>
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
          <button
            onClick={() => setMode('select')}
            className="px-6 py-3 rounded-xl transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
          >
            Save & Exit
          </button>
          <button
            onClick={handleSubmit}
            disabled={grading}
            className="flex-1 py-3 rounded-xl font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            {grading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {grading ? 'Grading…' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  }

  // ── Results Mode ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('select')} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">← Back</button>
        <h1 className="flex-1 text-lg font-bold text-[var(--text-1)] truncate">{exam.title} — Results</h1>
      </div>

      {finalScore && (
        <div className="mb-8 p-6 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <p className="text-[var(--text-1)] font-bold text-4xl">{finalScore.earned} / {finalScore.total}</p>
          <p className="text-lg mt-1" style={{ color: 'var(--brand)' }}>{Math.round((finalScore.earned / finalScore.total) * 100)}%</p>
          <p className="text-[var(--text-2)] text-sm mt-2">
            {finalScore.earned / finalScore.total >= 0.8 ? 'Excellent work! 🎉' :
             finalScore.earned / finalScore.total >= 0.6 ? 'Good effort, keep studying! 📚' :
             'More review needed. 💪'}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {(examContent.sections ?? []).map((section: ExamSection) => (
          <div key={section.title}>
            <h2 className="text-[var(--text-1)] font-semibold text-lg mb-4">{section.title}</h2>
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
                    style={{ backgroundColor: isCorrect ? 'rgba(22,163,74,0.1)' : isWrong ? 'rgba(220,38,38,0.1)' : 'var(--bg-card)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[var(--text-1)] font-medium text-sm flex-1 pr-4">
                        <span className="text-[var(--text-3)] mr-2">{q.number}.</span>{q.question}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result && (
                          <span className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
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
                              {opt} {isAnswer && '✓'}
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
                          <p className="text-green-400 font-medium mb-1">Expected:</p>
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
    </div>
  );
}

