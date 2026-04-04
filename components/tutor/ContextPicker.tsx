'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Search } from 'lucide-react';

export interface PickerNote {
  id: string;
  title: string;
}

interface Props {
  open: boolean;
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
  open,
  loadedNotes,
  availableNotes,
  noteSearch,
  onNoteSearchChange,
  onRemove,
  onAdd,
  maxNotes = 15,
  onClose,
}: Props) {
  const loadedIds = new Set(loadedNotes.map(n => n.id));
  const allNotes = [
    ...loadedNotes,
    ...availableNotes.filter(n => !loadedIds.has(n.id)),
  ];

  function toggle(id: string) {
    if (loadedIds.has(id)) onRemove(id);
    else onAdd(id);
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
        <Dialog.Content
          className="fixed z-50 w-full max-w-sm rounded-2xl shadow-2xl outline-none p-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--text-1)]">Add Context</Dialog.Title>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {loadedNotes.length} / {maxNotes} selected
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              value={noteSearch}
              onChange={e => onNoteSearchChange(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent text-xs outline-none text-[var(--text-1)] placeholder-[var(--text-3)]"
              autoFocus
            />
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto">
            {allNotes.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-3)' }}>No notes found</p>
            ) : (
              <div className="flex flex-col gap-1">
                {allNotes.map(n => {
                  const selected = loadedIds.has(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => toggle(n.id)}
                      disabled={!selected && loadedNotes.length >= maxNotes}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-left transition-colors disabled:opacity-40"
                      style={{
                        backgroundColor: selected ? 'var(--brand)' : 'var(--bg-input)',
                        color: selected ? '#fff' : 'var(--text-1)',
                      }}
                      onMouseEnter={e => { if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                    >
                      <span className="text-xs truncate flex-1">{n.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
