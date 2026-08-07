'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  state: 'processing' | 'failed';
  errorMessage?: string;
  onRetry: () => void;
  onClose: () => void;
}

export default function ProcessingOverlay({ state, errorMessage, onRetry, onClose }: Props) {
  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--brand-subtle)' }}>
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: 'var(--brand)', borderRightColor: 'var(--brand)' }}
          />
        </div>
        <div>
          <p className="text-body-sm font-semibold text-[var(--text-1)]">Processing your note…</p>
          <p className="mt-1 max-w-xs text-xs text-[var(--text-2)]">
            This may take a minute. You can close this — it will appear in your library when ready.
          </p>
        </div>
        <button onClick={onClose} className="text-xs text-[var(--text-3)] transition-colors hover:text-[var(--text-2)]">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--danger-subtle)' }}>
        <X size={22} strokeWidth={2.5} style={{ color: 'var(--danger)' }} />
      </div>
      <div>
        <p className="font-semibold text-[var(--text-1)]">Upload failed</p>
        <p className="mt-1 max-w-xs text-xs text-[var(--text-2)]">
          {errorMessage ?? 'Something went wrong while processing your note.'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="brand" size="sm" onClick={onRetry}>Try Again</Button>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
