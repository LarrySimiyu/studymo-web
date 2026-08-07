'use client';

import { useState, useCallback, useEffect } from 'react';
import { docTagsApi } from '@/lib/api/documents';
import TagRowMenu from '@/components/ui/tagRowMenu';
import { Button } from '@/components/ui/Button';
import { TAG_COLORS, tagColor } from '@/lib/tagColors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onChange: () => void;
}

export default function ManageTagsModal({ open, onClose, onChange }: Props) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await docTagsApi.getAll();
    if (data) setTags(data);
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const create = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    await docTagsApi.create({ name: newName.trim(), color: newColor });
    setSaving(false);
    setNewName('');
    load();
    onChange();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent size="sm" showClose>
        <DialogHeader>
          <DialogTitle>Note Tags</DialogTitle>
        </DialogHeader>
        <div className="mb-4 rounded-xl p-3" style={{ backgroundColor: 'var(--bg-input)' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="New tag name"
            className="mb-2 w-full bg-transparent text-body-sm text-[var(--text-1)] outline-none placeholder-[var(--text-3)]"
          />
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  aria-label={`Colour ${c}`}
                  className="h-5 w-5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: newColor === c ? 'var(--text-1)' : 'transparent' }}
                />
              ))}
            </div>
            <Button variant="primary" size="xs" onClick={create} disabled={saving || !newName.trim()}>
              Add
            </Button>
          </div>
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {tags.map(t => (
            <div
              key={t.id}
              className="group/row flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-hover)]"
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tagColor(t.color) }} />
              <span className="flex-1 text-body-sm text-[var(--text-2)]">{t.name}</span>
              <TagRowMenu
                tag={t}
                onChanged={() => { load(); onChange(); }}
                className="opacity-0 group-hover/row:opacity-100 data-[state=open]:opacity-100"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
