'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent, ExamQuestion, ExamSection } from '@/lib/api/organization';

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
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="#2A2A2A" strokeWidth="5" />
          <circle cx="45" cy="45" r={radius} fill="none"
            stroke={isDone ? '#ef4444' : isLow ? '#f97316' : '#9747FF'}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={isDone ? circumference : strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-mono font-semibold">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-white/30 text-xs">{isDone ? 'Time up' : 'remaining'}</span>
    </div>
  );
}

export default function PracticeExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'take' | 'results'>('select');

  const STORAGE_KEY = `exam_progress_${id}`;

  // Exam taking state
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

  // Load saved progress from localStorage
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

  // Save progress to localStorage on every answer change
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
        <div className="w-8 h-8 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!exam) return <div className="text-white/50 py-10 text-center">Exam not found.</div>;

  let examContent: ExamContent;
  try {
    examContent = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions as ExamContent;
  } catch {
    return <div className="text-white/50 py-10 text-center">Failed to load exam content.</div>;
  }

  const allQuestions: (ExamQuestion & { sectionTitle: string })[] = [];
  for (const section of examContent.sections ?? []) {
    for (const q of section.questions ?? []) {
      allQuestions.push({ ...q, sectionTitle: section.title });
    }
  }

  const totalAnswered = Object.keys(answers).length;
  const progress = allQuestions.length > 0 ? totalAnswered / allQuestions.length : 0;
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
    // Clear saved progress after submission
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setMode('results');
  }

  // ── Select Mode ──────────────────────────────────────────────────────────────
  if (mode === 'select') {
    const sectionTypes = examContent.sections?.map(s => {
      const q = s.questions?.[0];
      return { title: s.title, count: s.questions?.length ?? 0, type: q?.type };
    }) ?? [];

    const typeColors: Record<string, string> = {
      multiple_choice: '#9747FF',
      short_answer: '#4ECDC4',
      true_false: '#F59E0B',
    };

    return (
      <div className="max-w-2xl mx-auto py-2">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">← Back</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
            <p className="text-white/40 text-sm mt-1">
              {examContent.totalPoints ?? '?'} pts · ~{examContent.estimatedMinutes ?? '?'} min
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {sectionTypes.map(s => (
            <div key={s.title} className="p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: typeColors[s.type ?? ''] ?? '#9747FF' }} />
              <p className="text-white font-semibold text-lg">{s.count}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.title}</p>
            </div>
          ))}
        </div>

        {submitted && finalScore && (
          <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}>
            <p className="text-white font-bold text-2xl">{finalScore.earned} / {finalScore.total}</p>
            <p className="text-[#9747FF] text-sm mt-1">
              {Math.round((finalScore.earned / finalScore.total) * 100)}%
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setAnswers({}); setSubmitted(false); setTimeExpired(false); setGradingResults({}); setFinalScore(null); setMode('take'); }}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
            {submitted ? 'Retake Exam' : 'Take Exam'}
          </button>
          {submitted && (
            <button onClick={() => setMode('results')}
              className="flex-1 py-3 rounded-xl font-medium text-white/80 border border-white/10 hover:border-white/20 transition-colors">
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
        {/* Header with timer */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setMode('select')} className="text-white/40 hover:text-white">← Exit</button>
          <h1 className="flex-1 text-base font-bold text-white truncate">{exam.title}</h1>
          <span className="text-white/40 text-sm">{totalAnswered}/{allQuestions.length} answered</span>
          <CircularTimer totalSeconds={durationSeconds} onExpire={() => setTimeExpired(true)} />
        </div>

        {/* Time expired banner */}
        {timeExpired && (
          <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: '#ef444420', border: '1px solid #ef444440' }}>
            <span className="text-red-400 text-sm font-medium">Time is up — but you can keep going and submit when ready.</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-[#9747FF] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="space-y-8">
          {(examContent.sections ?? []).map((section: ExamSection) => (
            <div key={section.title}>
              <div className="mb-4">
                <h2 className="text-white font-semibold text-lg">{section.title}</h2>
                <p className="text-white/40 text-sm">{section.instructions}</p>
              </div>
              <div className="space-y-4">
                {section.questions.map((q: ExamQuestion) => (
                  <QuestionCard key={q.number} q={q} answer={answers[q.number]} onAnswer={setAnswer} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={() => setMode('select')}
            className="px-6 py-3 rounded-xl text-white/50 border border-white/10 hover:border-white/20 transition-colors">
            Save & Exit
          </button>
          <button onClick={handleSubmit} disabled={grading}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {grading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {grading ? 'Grading…' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  }

  // ── Results Mode ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto py-2">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('select')} className="text-white/40 hover:text-white">← Back</button>
        <h1 className="flex-1 text-lg font-bold text-white truncate">{exam.title} — Results</h1>
      </div>

      {finalScore && (
        <div className="mb-8 p-6 rounded-xl text-center" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}>
          <p className="text-white font-bold text-4xl">{finalScore.earned} / {finalScore.total}</p>
          <p className="text-[#9747FF] text-lg mt-1">{Math.round((finalScore.earned / finalScore.total) * 100)}%</p>
          <p className="text-white/40 text-sm mt-2">
            {finalScore.earned / finalScore.total >= 0.8 ? 'Excellent work! 🎉' :
             finalScore.earned / finalScore.total >= 0.6 ? 'Good effort, keep studying! 📚' :
             'More review needed. 💪'}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {(examContent.sections ?? []).map((section: ExamSection) => (
          <div key={section.title}>
            <h2 className="text-white font-semibold text-lg mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.questions.map((q: ExamQuestion) => {
                const result = gradingResults[q.number];
                const userAnswer = answers[q.number];
                const isCorrect = result?.correct;
                const isWrong = result && !result.correct;

                return (
                  <div key={q.number} className="p-5 rounded-xl"
                    style={{
                      backgroundColor: '#1A1A1A',
                      border: `1px solid ${isCorrect ? '#16a34a40' : isWrong ? '#dc262640' : '#2A2A2A'}`,
                    }}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-white font-medium text-sm flex-1 pr-4">
                        <span className="text-white/30 mr-2">{q.number}.</span>{q.question}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result && (
                          <span className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                        <span className="text-xs text-white/30">{q.points} pts</span>
                      </div>
                    </div>

                    {(q.type === 'multiple_choice' || q.type === 'true_false') && (
                      <div className={`space-y-1.5 mb-3 ${q.type === 'true_false' ? 'flex gap-3 space-y-0' : ''}`}>
                        {(q.type === 'true_false' ? ['True', 'False'] : q.options ?? []).map(opt => {
                          const isAnswer = opt === q.correctAnswer;
                          const isUserWrong = userAnswer === opt && opt !== q.correctAnswer;
                          return (
                            <div key={opt} className="px-3 py-2 rounded-lg text-sm flex-1"
                              style={{
                                backgroundColor: isAnswer ? '#16a34a20' : isUserWrong ? '#dc262620' : '#2A2A2A',
                                border: `1px solid ${isAnswer ? '#16a34a60' : isUserWrong ? '#dc262660' : '#333'}`,
                                color: isAnswer ? '#4ade80' : isUserWrong ? '#f87171' : '#888',
                              }}>
                              {opt} {isAnswer && '✓'}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short_answer' && (
                      <div className="space-y-2 mb-3">
                        {userAnswer && (
                          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#2A2A2A' }}>
                            <p className="text-white/40 text-xs mb-1">Your answer:</p>
                            <p className="text-white/70">{userAnswer}</p>
                          </div>
                        )}
                        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#16a34a15', border: '1px solid #16a34a30' }}>
                          <p className="text-green-400 font-medium mb-1">Expected:</p>
                          <p className="text-white/70">{q.correctAnswer}</p>
                        </div>
                        {result?.feedback && (
                          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF30' }}>
                            <p className="text-[#9747FF] font-medium mb-1">Feedback:</p>
                            <p className="text-white/70">{result.feedback}</p>
                            <p className="text-white/40 text-xs mt-1">
                              Credit: {Math.round((result.partialCredit ?? 0) * 100)}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {q.explanation && q.type !== 'short_answer' && (
                      <p className="text-white/40 text-xs">{q.explanation}</p>
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

// ── Question card (take mode) ─────────────────────────────────────────────────
function QuestionCard({
  q,
  answer,
  onAnswer,
}: {
  q: ExamQuestion;
  answer: string | undefined;
  onAnswer: (num: number, val: string) => void;
}) {
  return (
    <div className="p-5 rounded-xl" style={{ backgroundColor: '#1A1A1A', border: `1px solid ${answer ? '#9747FF30' : '#2A2A2A'}` }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-white font-medium text-sm flex-1 pr-4">
          <span className="text-white/30 mr-2">{q.number}.</span>{q.question}
        </p>
        <span className="text-xs text-white/30 flex-shrink-0">{q.points} pts</span>
      </div>

      {q.type === 'multiple_choice' && (
        <div className="space-y-2">
          {q.options?.map(opt => (
            <button key={opt} onClick={() => onAnswer(q.number, opt)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: answer === opt ? '#9747FF30' : '#2A2A2A',
                border: `1px solid ${answer === opt ? '#9747FF' : '#333'}`,
                color: answer === opt ? '#fff' : '#aaa',
              }}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'true_false' && (
        <div className="flex gap-3">
          {['True', 'False'].map(opt => (
            <button key={opt} onClick={() => onAnswer(q.number, opt)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: answer === opt ? '#9747FF30' : '#2A2A2A',
                border: `1px solid ${answer === opt ? '#9747FF' : '#333'}`,
                color: answer === opt ? '#fff' : '#aaa',
              }}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'short_answer' && (
        <textarea rows={3} placeholder="Your answer…"
          value={answer ?? ''}
          onChange={e => onAnswer(q.number, e.target.value)}
          className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50 resize-none" />
      )}
    </div>
  );
}
