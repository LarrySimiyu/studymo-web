'use client';

import { useEffect, useState } from 'react';
import { Folder } from '@/lib/api/organization';
import { TAG_COLORS } from '@/lib/tagColors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
        <DialogHeader className="mb-5 gap-1">
          <DialogTitle className="text-body-lg font-bold">
            {folder ? 'Rename Collection' : 'New Collection'}
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-3)]">
            {folder ? 'Update the name and color.' : 'Group related notes into a collection.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Name</label>
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Collection name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Color</label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                  aria-pressed={color === c}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-105"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${c}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-1">
            <Button
              variant="brand"
              size="lg"
              onClick={submit}
              disabled={!name.trim()}
              className="w-full"
            >
              {folder ? 'Save Changes' : 'Create Collection'}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs transition-opacity hover:opacity-60"
              style={{ color: 'var(--text-3)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
