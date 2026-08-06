'use client';

import TutorInput from '@/components/tutor/TutorInput';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  creating: boolean;
}

export default function TutorWelcome({ value, onChange, onSend, creating }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center gap-8 max-w-xl w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-heading-sm md:text-heading font-bold text-[var(--text-1)]">Welcome to AI Tutor</h1>
          <p className="text-[var(--text-2)] text-body-sm mt-2">Ask anything to get started</p>
        </div>

        <div className="w-full">
          <TutorInput
            value={value}
            onChange={onChange}
            onSend={onSend}
            disabled={creating}
            autoFocus
            placeholder={creating ? 'Starting…' : 'Message your tutor…'}
          />
        </div>

        <p className="text-xs text-[var(--text-3)]">Pick a study mode once the session opens</p>
      </div>
    </div>
  );
}
