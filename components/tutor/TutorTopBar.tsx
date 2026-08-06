'use client';

import { useState } from 'react';
import TutorModeDropdown, { TutorMode } from './TutorModeDropdown';

interface Props {
  title: string;
  onRename: (next: string) => void;
  mode: TutorMode;
  onModeChange: (mode: TutorMode) => void;
}

export default function TutorTopBar({ title, onRename, mode, onModeChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function save() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== title) onRename(next);
  }

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 sm:px-5 h-14 shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b focus:outline-none text-[var(--text-1)]"
          style={{ borderColor: 'var(--brand)' }}
        />
      ) : (
        <button
          onClick={() => { setDraft(title); setEditing(true); }}
          title="Click to rename"
          className="flex-1 min-w-0 text-left text-sm font-semibold truncate text-[var(--text-1)] hover:text-[var(--text-2)] transition-colors"
        >
          {title}
        </button>
      )}

      <div className="shrink-0">
        <TutorModeDropdown value={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
