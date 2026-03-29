'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { practiceExamsApi, PracticeExam, ExamContent, ExamQuestion, ExamSection } from '@/lib/api/organization';

export default function PracticeExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'take' | 'key'>('select');

  // Exam taking state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    practiceExamsApi.getById(id).then(({ data }) => {
      if (data) setExam(data);
      setLoading(false);
    });
  }, [id]);

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

  function handleSubmit() {
    let pts = 0;
    for (const q of allQuestions) {
      if (q.type === 'multiple_choice' && answers[q.number] === q.correctAnswer) {
        pts += q.points;
      }
    }
    setScore(pts);
    setSubmitted(true);
    setMode('key');
  }

  // ── Select Mode ──────────────────────────────────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="max-w-2xl mx-auto py-2">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">← Back</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
            <p className="text-white/40 text-sm mt-1">
              {examContent.totalPoints ?? 100} pts · ~{examContent.estimatedMinutes ?? 60} min
            </p>
          </div>
        </div>

        {/* Exam info cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Multiple Choice', value: `${examContent.sections?.find(s => s.title.toLowerCase().includes('multiple'))?.questions?.length ?? 15} questions`, color: '#9747FF' },
            { label: 'Short Answer', value: `${examContent.sections?.find(s => s.title.toLowerCase().includes('short'))?.questions?.length ?? 8} questions`, color: '#4ECDC4' },
            { label: 'Essay', value: `${examContent.sections?.find(s => s.title.toLowerCase().includes('essay'))?.questions?.length ?? 3} questions`, color: '#FF6B6B' },
          ].map(card => (
            <div key={card.label} className="p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: card.color }} />
              <p className="text-white font-semibold text-lg">{card.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}>
            <p className="text-white font-bold text-2xl">{score} / {examContent.totalPoints ?? 100}</p>
            <p className="text-[#9747FF] text-sm mt-1">
              {Math.round((score / (examContent.totalPoints ?? 100)) * 100)}% · MC Score
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { setAnswers({}); setSubmitted(false); setMode('take'); }}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
            {submitted ? 'Retake Exam' : 'Take Exam'}
          </button>
          <button onClick={() => setMode('key')}
            className="flex-1 py-3 rounded-xl font-medium text-white/80 border border-white/10 hover:border-white/20 transition-colors">
            View Answer Key
          </button>
        </div>
      </div>
    );
  }

  // ── Take Mode ─────────────────────────────────────────────────────────────────
  if (mode === 'take') {
    return (
      <div className="max-w-3xl mx-auto py-2">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setMode('select')} className="text-white/40 hover:text-white">← Back</button>
          <h1 className="flex-1 text-lg font-bold text-white truncate">{exam.title}</h1>
          <span className="text-white/40 text-sm">{totalAnswered} / {allQuestions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
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
                  <div key={q.number} className="p-5 rounded-xl" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-white font-medium text-sm flex-1 pr-4">
                        <span className="text-white/30 mr-2">{q.number}.</span>{q.question}
                      </p>
                      <span className="text-xs text-white/30 flex-shrink-0">{q.points} pts</span>
                    </div>
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {q.options?.map(opt => (
                          <button key={opt}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.number]: opt }))}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: answers[q.number] === opt ? '#9747FF30' : '#2A2A2A',
                              border: `1px solid ${answers[q.number] === opt ? '#9747FF' : '#333'}`,
                              color: answers[q.number] === opt ? '#fff' : '#aaa',
                            }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === 'short_answer' && (
                      <textarea rows={3} placeholder="Your answer…"
                        value={answers[q.number] ?? ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.number]: e.target.value }))}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50 resize-none" />
                    )}
                    {q.type === 'essay' && (
                      <div>
                        <textarea rows={6} placeholder="Write your essay here…"
                          value={answers[q.number] ?? ''}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.number]: e.target.value }))}
                          className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50 resize-none mb-2" />
                        <p className="text-xs text-white/30">{(answers[q.number] ?? '').split(' ').filter(Boolean).length} words</p>
                      </div>
                    )}
                  </div>
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
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
            Submit Exam
          </button>
        </div>
      </div>
    );
  }

  // ── Answer Key Mode ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto py-2">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('select')} className="text-white/40 hover:text-white">← Back</button>
        <h1 className="flex-1 text-lg font-bold text-white truncate">{exam.title} — Answer Key</h1>
        <button onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/80 transition-all">
          🖨 Print
        </button>
      </div>

      {submitted && (
        <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF40' }}>
          <p className="text-white font-bold text-2xl">{score} / {examContent.totalPoints ?? 100}</p>
          <p className="text-[#9747FF] text-sm mt-1">{Math.round((score / (examContent.totalPoints ?? 100)) * 100)}% on multiple choice</p>
        </div>
      )}

      <div className="space-y-8">
        {(examContent.sections ?? []).map((section: ExamSection) => (
          <div key={section.title}>
            <h2 className="text-white font-semibold text-lg mb-1">{section.title}</h2>
            <p className="text-white/40 text-sm mb-4">{section.instructions}</p>
            <div className="space-y-4">
              {section.questions.map((q: ExamQuestion) => {
                const userAnswer = answers[q.number];
                const isCorrect = q.type === 'multiple_choice' && userAnswer === q.correctAnswer;
                const isWrong = q.type === 'multiple_choice' && userAnswer && userAnswer !== q.correctAnswer;

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
                        {submitted && q.type === 'multiple_choice' && (
                          <span className={`text-xs ${isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-white/30'}`}>
                            {isCorrect ? '✓' : isWrong ? '✗' : '—'}
                          </span>
                        )}
                        <span className="text-xs text-white/30">{q.points} pts</span>
                      </div>
                    </div>

                    {q.type === 'multiple_choice' && (
                      <div className="space-y-1.5 mb-3">
                        {q.options?.map(opt => {
                          const isAnswer = opt === q.correctAnswer;
                          const isUserWrong = submitted && userAnswer === opt && opt !== q.correctAnswer;
                          return (
                            <div key={opt} className="px-3 py-2 rounded-lg text-sm"
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
                      <div className="mb-3 p-3 rounded-lg text-sm" style={{ backgroundColor: '#16a34a15', border: '1px solid #16a34a30' }}>
                        <p className="text-green-400 font-medium mb-1">Expected Answer:</p>
                        <p className="text-white/70">{q.correctAnswer}</p>
                      </div>
                    )}

                    {q.type === 'essay' && q.rubric && (
                      <div className="mb-3 p-3 rounded-lg text-sm" style={{ backgroundColor: '#9747FF15', border: '1px solid #9747FF30' }}>
                        <p className="text-[#9747FF] font-medium mb-1">Rubric:</p>
                        <p className="text-white/70">{q.rubric}</p>
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-white/50 text-xs">{q.explanation}</p>
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
