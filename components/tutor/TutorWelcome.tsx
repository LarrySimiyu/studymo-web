'use client';

interface Props {
  creating: boolean;
  onStart: () => void;
}

export default function TutorWelcome({ creating, onStart }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-8 max-w-xl w-full text-center">
        <div>
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-heading-sm md:text-heading font-bold text-[var(--text-1)]">Welcome to AI Tutor</h1>
          <p className="text-[var(--text-2)] text-body-sm mt-2">Choose a mode to get started</p>
        </div>

        <button
          onClick={onStart}
          disabled={creating}
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 max-w-xs"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          {creating ? 'Starting…' : 'Start a Session'}
        </button>

        <p className="text-xs text-[var(--text-3)]">Pick a study mode once the session opens</p>
      </div>
    </div>
  );
}
