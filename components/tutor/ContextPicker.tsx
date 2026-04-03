'use client';

import { useEffect, useRef } from 'react';

export interface PickerNote {
  id: string;
  title: string;
}

interface Props {
  loadedNotes: PickerNote[];
  availableNotes: PickerNote[];
  noteSearch: string;
  onNoteSearchChange: (v: string) => void;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
  maxNotes?: number;
  onClose: () => void;
}

export default function ContextPicker({
  loadedNotes,
  availableNotes,
  onAdd,
  maxNotes = 15,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 z-50 w-72 rounded-xl overflow-hidden shadow-xl"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-1)]">Add Notes</span>
          <span className="text-[10px] text-[var(--text-2)]">{loadedNotes.length} / {maxNotes}</span>
        </div>
        <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
        {availableNotes.length === 0 ? (
          <p className="text-xs text-[var(--text-3)] px-3 py-3">No more notes to add.</p>
        ) : (
          availableNotes.map(n => (
            <div key={n.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)]">
              <p className="text-xs text-[var(--text-1)] truncate flex-1">{n.title}</p>
              <button
                onClick={() => onAdd(n.id)}
                disabled={loadedNotes.length >= maxNotes}
                title={loadedNotes.length >= maxNotes ? 'Max notes reached' : 'Add note'}
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30 hover:opacity-80"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 1v10M1 6h10" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
