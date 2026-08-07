'use client';

import { useEffect, useState } from 'react';
import { Folder } from '@/lib/api/organization';
import { TAG_COLORS } from '@/lib/tagColors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  folder?: Folder;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

export default function FolderModal({ open, folder, onClose, onSave }: Props) {
  const [name, setName] = useState(folder?.name ?? '');
  const [color, setColor] = useState(folder?.color ?? TAG_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    setName(folder?.name ?? '');
    setColor(folder?.color ?? TAG_COLORS[0]);
  }, [open, folder]);

  const submit = () => { if (name.trim()) onSave(name.trim(), color); };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{folder ? 'Rename Collection' : 'New Collection'}</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Collection name"
          className="mb-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-body-sm text-[var(--text-1)] outline-none focus:border-[var(--brand-border)]"
          style={{ backgroundColor: 'var(--bg-input)' }}
        />
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              className="h-7 w-7 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? 'var(--text-1)' : 'transparent' }}
            />
          ))}
        </div>
        <DialogFooter className="sm:justify-stretch">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2 text-body-sm text-[var(--text-2)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="flex-1 rounded-lg bg-[var(--brand)] py-2 text-body-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {folder ? 'Save' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
