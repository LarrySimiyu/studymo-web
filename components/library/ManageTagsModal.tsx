'use client';

import { useState, useCallback, useEffect } from 'react';
import { docTagsApi } from '@/lib/api/documents';
import TagRowMenu from '@/components/ui/tagRowMenu';
import { TAG_COLORS, tagColor } from '@/lib/tagColors';

interface Props {
  onClose: () => void;
  onChange: () => void;
}

export default function ManageTagsModal({ onClose, onChange }: Props) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await docTagsApi.getAll();
    if (data) setTags(data);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border border-black/10 rounded-2xl w-full max-w-sm p-5" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-1)]">Note Tags</h3>
          <button onClick={onClose} className="text-[var(--text-1)] opacity-40 hover:opacity-100 text-xl leading-none">×</button>
        </div>
        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="New tag name"
            className="w-full bg-transparent text-sm text-[var(--text-1)] outline-none placeholder-[var(--text-3)] mb-2"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-5 h-5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: newColor === c ? 'var(--text-1)' : 'transparent' }}
                />
              ))}
            </div>
            <button
              onClick={create}
              disabled={saving || !newName.trim()}
              className="px-3 py-1 bg-[var(--brand)] text-white text-xs rounded-lg disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {tags.map(t => (
            <div key={t.id} className="group/row flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tagColor(t.color) }} />
              <span className="flex-1 text-sm text-[var(--text-2)]">{t.name}</span>
              <TagRowMenu
                tag={t}
                onChanged={() => { load(); onChange(); }}
                className="opacity-0 group-hover/row:opacity-100 data-[state=open]:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
