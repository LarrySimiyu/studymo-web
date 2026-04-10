'use client';

import { useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type TutorMode = 'casual' | 'tutor' | 'strict' | 'teach_back' | 'eli5';

const MODES: { value: TutorMode; label: string; emoji: string; description: string }[] = [
  { value: 'tutor',      emoji: '🎓', label: 'Tutor',      description: 'Guided, step-by-step' },
  { value: 'casual',     emoji: '💬', label: 'Casual',     description: 'Relaxed, conversational' },
  { value: 'strict',     emoji: '🔬', label: 'Strict',     description: 'Precise, no hand-holding' },
  { value: 'teach_back', emoji: '🗣️', label: 'Teach Back', description: 'You explain, I correct' },
  { value: 'eli5',       emoji: '🧩', label: 'Simple',     description: 'Plain language' },
];

interface Props {
  value: TutorMode;
  onChange: (mode: TutorMode) => void;
}

export default function TutorModeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const current = MODES.find(m => m.value === value) ?? MODES[1];

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--bg-hover)]"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff' }}
      >
        <span>{current.emoji}</span>
        <span>{current.label}</span>
        <ChevronDown size={11} style={{ color: 'var(--text-3)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-[9999] rounded-xl shadow-xl py-1 min-w-[190px]"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {MODES.map(mode => {
            const isActive = mode.value === value;
            return (
              <button
                key={mode.value}
                onClick={e => { e.stopPropagation(); onChange(mode.value); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-1)' }}
              >
                <span className="text-sm">{mode.emoji}</span>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span>{mode.label}</span>
                  <span className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--text-3)' }}>{mode.description}</span>
                </div>
                {isActive && <Check size={12} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
