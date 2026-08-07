'use client';

import { useState } from 'react';
import { documentsApi, docTagsApi, Document } from '@/lib/api/documents';
import TagDropdown from '@/components/ui/TagDropdown';
import { TagBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { TAG_COLORS } from '@/lib/tagColors';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  doc: Document;
  id: string;
  allDocTags: { id: string; name: string; color: string | null }[];
  onRefetch: () => void;
  onLoadSideData: () => void;
}

export default function NoteTagsRow({ doc, id, allDocTags, onRefetch, onLoadSideData }: Props) {
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {(doc.tags ?? []).map(dt => (
          <TagBadge
            key={dt.tagId}
            color={dt.tag.color}
            onRemove={async () => { await documentsApi.removeTag(id, dt.tagId); onRefetch(); }}
            removeLabel={`Remove ${dt.tag.name}`}
          >
            {dt.tag.name}
          </TagBadge>
        ))}
        <TagDropdown
          tags={allDocTags}
          variant="add-tag"
          selectedIds={new Set((doc.tags ?? []).map(dt => dt.tagId))}
          onChange={async tagId => {
            const isApplied = (doc.tags ?? []).some(dt => dt.tagId === tagId);
            if (isApplied) { await documentsApi.removeTag(id, tagId); } else { await documentsApi.addTag(id, tagId); }
            onRefetch();
          }}
          onManageTags={() => setShowCreateTagModal(true)}
          onTagsChanged={onRefetch}
        />
      </div>

      <Dialog
        open={showCreateTagModal}
        onOpenChange={o => { if (!o) { setShowCreateTagModal(false); setNewTagName(''); } }}
      >
        <DialogContent size="sm" className="flex max-w-xs flex-col gap-3 p-5 sm:p-5">
          <DialogHeader className="mb-0">
            <DialogTitle className="text-body-sm">New tag</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="w-full rounded-lg px-3 py-2 text-xs text-[var(--text-1)] outline-none placeholder-[var(--text-3)]"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {TAG_COLORS.map(c => (
              <button key={c} onClick={() => setNewTagColor(c)}
                aria-label={`Colour ${c}`}
                className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: newTagColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => { setShowCreateTagModal(false); setNewTagName(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={async () => {
                if (!newTagName.trim()) return;
                const { data } = await docTagsApi.create({ name: newTagName.trim(), color: newTagColor });
                if (data) { await documentsApi.addTag(id, data.id); onRefetch(); onLoadSideData(); window.dispatchEvent(new CustomEvent('library:refetch')); }
                setShowCreateTagModal(false); setNewTagName('');
              }}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
