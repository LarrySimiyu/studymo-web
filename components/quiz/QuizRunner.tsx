'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Document, Quiz } from '@/lib/api/documents';
import { quizzesApi } from '@/lib/api/documents';
import { analytics } from '@/lib/analytics';
import ProgressBar from '@/components/ui/ProgressBar';
import QuestionCard from '@/components/ui/QuestionCard';

interface QuizQuestion {
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Props {
  document: Document;
  quiz: Quiz;
  /** Called when back arrow or "All Quizzes" is pressed — optional, omit to hide the button */
  onBack?: () => void;
}

function StartScreen({ document: doc, count, onStart }: { document: Document; count: number; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
        <Heart size={44} style={{ color: '#FF6500' }} fill="#FF6500" />
      </div>
      <div>
        <p className="text-title md:text-3xl font-bold text-[var(--text-1)]">{count} Questions</p>
        <p className="text-body-sm text-[var(--text-3)] mt-1">{doc.title}</p>
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

export default function QuizRunner({ document: doc, quiz, onBack }: Props) {
  const questions: QuizQuestion[] = (() => {
    try { return JSON.parse(quiz.questions); } catch { return []; }
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
      quizzesApi.submitAttempt(quiz.id, (correct / questions.length) * 100, answers).catch(() => {});
      analytics.quizCompleted(doc.id, Math.round((correct / questions.length) * 100), questions.length);
    } else {
      setQIndex(i => i + 1);
      setSelected(null);
      setShortAnswer('');
    }
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

  if (!started) {
    return <StartScreen document={doc} count={questions.length} onStart={() => setStarted(true)} />;
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-display md:text-5xl font-bold text-[var(--text-1)]">{score} / {questions.length}</p>
        <p className="text-heading font-semibold" style={{ color: 'var(--brand)' }}>
          {Math.round((score / questions.length) * 100)}%
        </p>
        <p className="text-[var(--text-2)] text-body-sm">
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
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-black/5 transition-colors"
              style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >
              All Quizzes
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
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
      <div className="flex gap-2 mt-4">
        {selected === null && (
          <button
            onClick={next}
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
  );
}
