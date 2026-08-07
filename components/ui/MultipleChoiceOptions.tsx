interface Props {
  options: string[];
  /** The option the user picked */
  selected?: string;
  /**
   * When provided alongside `selected`, enables correct/wrong colour feedback.
   * Omit (or leave undefined) to use plain selection (exam take mode).
   */
  correctAnswer?: string;
  /** Override the selected-state background colour. Defaults to var(--brand). */
  selectionColor?: string;
  /** Omit to render read-only (results view) */
  onSelect?: (opt: string) => void;
}

export default function MultipleChoiceOptions({ options, selected, correctAnswer, selectionColor = 'var(--brand)', onSelect }: Props) {
  const answered = selected !== undefined && selected !== '';
  const showFeedback = answered && correctAnswer !== undefined;

  function getBg(opt: string): string {
    if (showFeedback) {
      if (opt === correctAnswer) return '#166534';
      if (opt === selected) return '#7f1d1d';
      return 'var(--bg-input)';
    }
    if (answered && opt === selected) return selectionColor;
    return 'var(--bg-input)';
  }

  function getColor(opt: string): string {
    if (showFeedback) {
      if (opt === correctAnswer) return '#fff';
      if (opt === selected) return '#fff';
      return 'var(--text-1)';
    }
    if (answered && opt === selected) return '#fff';
    return 'var(--text-1)';
  }

  // Lock interaction once feedback is visible (quiz reveal) or in read-only mode.
  // Exam take mode (no correctAnswer) stays interactive so users can change their answer.
  const isLocked = showFeedback || !onSelect;

  return (
    <div className="space-y-2">
      {options.map(opt => {
        const bg = getBg(opt);
        const color = getColor(opt);

        const dimmed = answered && opt !== selected;

        if (!onSelect) {
          return (
            <div
              key={opt}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-opacity ${opt === selected ? 'font-semibold' : ''}`}
              style={{ backgroundColor: bg, color, opacity: dimmed ? 0.4 : 1 }}
            >
              {opt}
              {showFeedback && opt === correctAnswer && (
                <span className="ml-2 text-[var(--success-ink)]">✓</span>
              )}
            </div>
          );
        }

        return (
          <button
            key={opt}
            onClick={() => !isLocked && onSelect(opt)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors transition-opacity ${opt === selected ? 'font-semibold' : ''}`}
            style={{ backgroundColor: bg, color, opacity: dimmed ? 0.4 : 1 }}
            onMouseEnter={e => { if (!isLocked) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (!isLocked) e.currentTarget.style.backgroundColor = getBg(opt); }}
          >
            {opt}
            {showFeedback && opt === correctAnswer && (
              <span className="ml-2 text-[var(--success-ink)]">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
