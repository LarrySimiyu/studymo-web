'use client';

import { useState } from 'react';
import { Folder } from '@/lib/api/organization';
import { TAG_COLORS } from './libraryUtils';

interface Props {
  folder?: Folder;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

export default function FolderModal({ folder, onClose, onSave }: Props) {
  const [name, setName] = useState(folder?.name ?? '');
  const [color, setColor] = useState(folder?.color ?? TAG_COLORS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border border-black/10 rounded-2xl w-full max-w-sm p-5" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-1)]">{folder ? 'Rename Collection' : 'New Collection'}</h3>
          <button onClick={onClose} className="text-[var(--text-1)] opacity-40 hover:opacity-100 text-xl leading-none">×</button>
        </div>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), color)}
          placeholder="Collection name"
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50 mb-3"
          style={{ backgroundColor: 'var(--bg-input)' }}
        />
        <div className="flex gap-2 mb-4">
          {TAG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? 'var(--text-1)' : 'transparent' }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-black/10 text-[var(--text-2)] text-sm">
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), color)}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-lg bg-[#9747FF] text-white text-sm disabled:opacity-40"
          >
            {folder ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
