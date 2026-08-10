'use client';

import TutorInput from '@/components/tutor/TutorInput';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  creating: boolean;
}

export default function TutorWelcome({ value, onChange, onSend, creating }: Props) {
  const { currentUser, dbUser } = useAuth();
  const firstName = (dbUser?.name ?? currentUser?.displayName ?? currentUser?.email?.split('@')[0] ?? 'there').split(' ')[0];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center gap-8 max-w-xl w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-heading-sm md:text-heading font-bold text-[var(--text-1)]">Hey {firstName}, what are we studying?</h1>
          <p className="text-[var(--text-2)] text-body-sm mt-2">Ask anything to get started</p>
        </div>

        <div className="w-full">
          <TutorInput
            value={value}
            onChange={onChange}
            onSend={onSend}
            disabled={creating}
            autoFocus
            placeholder={creating ? 'Starting…' : 'Write a message…'}
          />
        </div>
      </div>
    </div>
  );
}
