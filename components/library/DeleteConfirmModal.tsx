'use client';

interface Props {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

export default function DeleteConfirmModal({ count, onConfirm, onCancel, deleting }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border border-black/10 rounded-2xl w-full max-w-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--danger-subtle)' }}>🗑</div>
          <div>
            <p className="text-[var(--text-1)] font-semibold">Delete {count} note{count !== 1 ? 's' : ''}?</p>
            <p className="text-[var(--text-2)] opacity-60 text-sm mt-1">
              This action cannot be undone. All notes, flashcards, and quizzes for {count !== 1 ? 'these notes' : 'this note'} will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[var(--text-2)] opacity-60 text-sm hover:bg-black/5 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#EF4444' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
