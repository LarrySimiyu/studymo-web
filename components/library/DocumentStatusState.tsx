'use client';

import { AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  status: string;
  errorMessage?: string | null;
  onDelete: () => void;
}

export default function DocumentStatusState({ status, errorMessage, onDelete }: Props) {
  if (status !== 'processing' && status !== 'failed') return null;

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Loader2 size={22} className="animate-spin" style={{ color: 'var(--brand)' }} />
        <div>
          <p className="text-sm font-semibold text-[var(--text-1)]">Still processing</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            Notes, flashcards, and quizzes appear here once this finishes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--danger-subtle)' }}>
        <AlertCircle size={22} style={{ color: 'var(--danger-ink)' }} />
      </div>
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-[var(--text-1)]">This upload failed</p>
        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {errorMessage ?? 'Something went wrong while processing this file.'}
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
          Nothing was generated from it. Upload the file again to retry.
        </p>
      </div>
      <button
        onClick={onDelete}
        className="mt-1 text-xs px-3 py-1.5 rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: 'var(--danger-ink)', border: '1px solid var(--border-md)' }}
      >
        Delete this upload
      </button>
    </div>
  );
}
