'use client';

import { useRef, useState, useEffect } from 'react';
import { documentsApi, docTagsApi, Document } from '@/lib/api/documents';
import TagDropdown from '@/components/ui/TagDropdown';

interface Props {
  doc: Document;
  id: string;
  embedded?: boolean;
  editableTitle: string;
  onTitleChange: (val: string) => void;
  titleDebounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  onBack?: () => void;
  onShowTutorPanel: () => void;
  showNote: boolean;
  allDocTags: { id: string; name: string; color: string | null }[];
  setAllDocTags: (tags: { id: string; name: string; color: string | null }[]) => void;
  onRefetch: () => void;
  onLoadSideData: () => void;
  onDeleteConfirm: () => void;
}

export default function NoteHeader({
  doc, id, embedded, editableTitle, onTitleChange, titleDebounceRef,
  onBack, onShowTutorPanel, showNote, allDocTags, onRefetch, onLoadSideData, onDeleteConfirm,
}: Props) {
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('var(--brand)');
  const dotsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDotsMenu) return;
    const h = (e: MouseEvent) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target as Node)) setShowDotsMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showDotsMenu]);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4">
        {!embedded && (
          <button onClick={() => onBack?.()} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors text-xs">
            ← Back
          </button>
        )}
        <span className="text-xs text-[var(--text-1)] truncate flex-1">{doc.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          {showNote && (
            <button
              onClick={onShowTutorPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FF6500 0%, #FF9A3C 100%)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Tutor
            </button>
          )}
          <div className="relative" ref={dotsMenuRef}>
            <button
              onClick={() => setShowDotsMenu(v => !v)}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-2)]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/>
              </svg>
            </button>
            {showDotsMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1 min-w-[140px]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {doc.fileUrl && (
                  <button
                    onClick={async () => {
                      setShowDotsMenu(false);
                      const { data } = await documentsApi.getFileUrl(id);
                      if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ color: 'var(--text-1)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View original
                  </button>
                )}
                <button
                  onClick={() => { setShowDotsMenu(false); onDeleteConfirm(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--danger)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editable title */}
      <input
        value={editableTitle}
        onChange={e => {
          const val = e.target.value;
          onTitleChange(val);
          if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
          titleDebounceRef.current = setTimeout(async () => {
            if (val.trim()) {
              await documentsApi.rename(id, val.trim());
              window.dispatchEvent(new CustomEvent('library:refetch'));
            }
          }, 600);
        }}
        placeholder="Untitled"
        className="w-full bg-transparent border-none outline-none text-heading-sm md:text-heading font-semibold text-[var(--text-1)] placeholder-[var(--text-3)] mb-3"
      />

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {(doc.tags ?? []).map(dt => (
          <span
            key={dt.tagId}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full cursor-pointer group"
            style={{ backgroundColor: (dt.tag.color ?? 'var(--brand)') + '22', color: dt.tag.color ?? 'var(--brand)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dt.tag.color ?? 'var(--brand)' }} />
            {dt.tag.name}
            <button
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 ml-0.5 leading-none"
              onClick={async () => { await documentsApi.removeTag(id, dt.tagId); onRefetch(); }}
            >×</button>
          </span>
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
        />
      </div>

      {/* Create tag modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl w-full max-w-xs p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-[var(--text-1)]">New tag</p>
            <input
              autoFocus
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none text-[var(--text-1)] placeholder-[var(--text-3)]"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setShowCreateTagModal(false); setNewTagName(''); }
              }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {['var(--brand)','#FF6B6B','#4ECDC4','#45B7D1','#F59E0B','#22C55E','#EC4899','#64748B'].map(c => (
                <button key={c} onClick={() => setNewTagColor(c)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: newTagColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowCreateTagModal(false); setNewTagName(''); }}
                className="flex-1 py-2 rounded-lg text-xs text-[var(--text-2)] hover:bg-[var(--bg-hover)] transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTagName.trim()) return;
                  const { data } = await docTagsApi.create({ name: newTagName.trim(), color: newTagColor });
                  if (data) { await documentsApi.addTag(id, data.id); onRefetch(); onLoadSideData(); window.dispatchEvent(new CustomEvent('library:refetch')); }
                  setShowCreateTagModal(false); setNewTagName('');
                }}
                className="flex-1 py-2 rounded-lg text-xs text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
