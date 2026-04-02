'use client';

import { useState } from 'react';
import MultipleChoiceOptions from './MultipleChoiceOptions';

interface Props {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  /**
   * When true, reveals correct/wrong feedback immediately after the user answers.
   * When false (exam mode), just highlights the selection — no reveal.
   */
  revealAnswer?: boolean;
  /** Controlled: current answer value */
  selected?: string | null;
  /** Uncontrolled short-answer text (only needed when type=short_answer) */
  shortAnswerValue?: string;
  onShortAnswerChange?: (val: string) => void;
  onAnswer: (answer: string) => void;
  /** Optional exam metadata shown in the header */
  number?: number;
  points?: number;
  /** Override selected-state colour. Defaults to var(--brand). */
  selectionColor?: string;
}

export default function QuestionCard({
  question,
  type,
  options = [],
  correctAnswer,
  explanation,
  revealAnswer = false,
  selected,
  shortAnswerValue = '',
  onShortAnswerChange,
  onAnswer,
  number,
  points,
  selectionColor = 'var(--brand)',
}: Props) {
  const [localShortAnswer, setLocalShortAnswer] = useState('');

  const shortAnswer = onShortAnswerChange !== undefined ? shortAnswerValue : localShortAnswer;
  const setShortAnswer = onShortAnswerChange ?? setLocalShortAnswer;

  const answered = selected !== null && selected !== undefined && selected !== '';
  const showFeedback = revealAnswer && answered;

  // True/false option styling
  function getTFStyle(opt: string) {
    if (!showFeedback) {
      const isSelected = selected === opt;
      return {
        bg: isSelected ? selectionColor : 'var(--bg-input)',
        color: isSelected ? '#fff' : 'var(--text-1)',
        locked: showFeedback,
      };
    }
    const isCorrect = opt === correctAnswer;
    const isWrongSelected = selected === opt && opt !== correctAnswer;
    return {
      bg: isCorrect ? '#166534' : isWrongSelected ? '#7f1d1d' : 'var(--bg-input)',
      color: isCorrect || isWrongSelected ? '#fff' : 'var(--text-1)',
      locked: true,
    };
  }

  return (
    <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
      {/* Header — only shown when number/points are provided (exam mode) */}
      {(number !== undefined || points !== undefined) && (
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1 pr-4">
            {number !== undefined && (
              <span className="text-sm font-medium shrink-0" style={{ color: answered ? 'var(--text-1)' : 'var(--text-3)' }}>{number}.</span>
            )}
            <p className="text-[var(--text-1)] font-medium text-sm">{question}</p>
          </div>
          {points !== undefined && (
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-1)' }}>{points} pts</span>
          )}
        </div>
      )}

      {/* Question text — shown standalone when no metadata */}
      {number === undefined && points === undefined && (
        <p className="text-[var(--text-1)] font-medium mb-5">{question}</p>
      )}

      {/* Multiple choice */}
      {type === 'multiple_choice' && (
        <MultipleChoiceOptions
          options={options}
          selected={selected ?? undefined}
          correctAnswer={revealAnswer && answered ? correctAnswer : undefined}
          selectionColor={selectionColor}
          onSelect={onAnswer}
        />
      )}

      {/* True / False */}
      {type === 'true_false' && (
        <div className="flex gap-3">
          {['True', 'False'].map(opt => {
            const { bg, color, locked } = getTFStyle(opt);
            const dimmed = answered && opt !== selected;
            return (
              <button
                key={opt}
                onClick={() => !locked && onAnswer(opt)}
                className={`flex-1 py-3 rounded-lg text-sm transition-colors transition-opacity ${selected === opt ? 'font-semibold' : 'font-medium'}`}
                style={{ backgroundColor: bg, color, opacity: dimmed ? 0.4 : 1 }}
                onMouseEnter={e => { if (!locked) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!locked) e.currentTarget.style.backgroundColor = bg; }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Short answer */}
      {type === 'short_answer' && (
        <input
          type="text"
          value={shortAnswer}
          onChange={e => setShortAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !answered && shortAnswer && onAnswer(shortAnswer)}
          disabled={answered}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] focus:outline-none"
          style={{ backgroundColor: 'var(--bg-input)' }}
          placeholder="Type your answer…"
        />
      )}

      {/* Explanation — only shown in reveal mode after answering */}
      {showFeedback && explanation && (() => {
        const isCorrect = type === 'short_answer' || selected === correctAnswer;
        return (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: isCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)' }}>
            <p className="font-medium mb-1" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
              {type === 'short_answer'
                ? `Expected: ${correctAnswer}`
                : isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-[var(--text-1)]">{explanation}</p>
          </div>
        );
      })()}
    </div>
  );
}
