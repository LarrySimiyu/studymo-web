'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { documentsApi, Document, docTagsApi } from '@/lib/api/documents';
import { foldersApi, Folder } from '@/lib/api/organization';
import { useLibrary } from '@/context/LibraryContext';
import DocumentDetail, { flushPendingNoteSave } from '@/components/library/DocumentDetail';
import UploadDialog, { UploadType } from '@/components/upload/UploadDialog';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import TagDropdown, { type Tag } from '@/components/ui/TagDropdown';
import { Input } from '@/components/ui/Input';
import { PenLine, Upload, Mic, Youtube, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TAG_COLORS = ['#9747FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#BB8FCE', '#F7DC6F'];

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 2) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function typeIcon(type: string) {
  if (type === 'pdf') return '📄';
  if (type === 'audio') return '🎵';
  if (type === 'recording') return '🎙';
  if (type === 'video_url') return '🎬';
  return '📄';
}

function flattenFolders(folders: Folder[], depth = 0): (Folder & { depth: number })[] {
  const result: (Folder & { depth: number })[] = [];
  for (const f of folders) {
    result.push({ ...f, depth });
    if (f.children?.length) result.push(...flattenFolders(f.children, depth + 1));
  }
  return result;
}

function notifyFoldersChanged() {
  window.dispatchEvent(new CustomEvent('library:folders-changed'));
}

function DeleteConfirmModal({ count, onConfirm, onCancel, deleting }: {
  count: number; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border border-black/10 rounded-2xl w-full max-w-sm p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--danger-subtle)' }}>🗑</div>
          <div>
            <p className="text-[var(--text-1)] font-semibold">Delete {count} note{count !== 1 ? 's' : ''}?</p>
            <p className="text-[var(--text-2)] opacity-60 text-sm mt-1">This action cannot be undone. All notes, flashcards, and quizzes for {count !== 1 ? 'these notes' : 'this note'} will be permanently deleted.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-black/10 text-[var(--text-2)] opacity-60 text-sm hover:bg-black/5 disabled:opacity-40 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#EF4444' }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageTagsModal({ onClose, onChange }: { onClose: () => void; onChange: () => void }) {
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
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="New tag name"
            className="w-full bg-transparent text-sm text-[var(--text-1)] outline-none placeholder-[var(--text-3)] mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TAG_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} className="w-5 h-5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: newColor === c ? 'var(--text-1)' : 'transparent' }} />
              ))}
            </div>
            <button onClick={create} disabled={saving || !newName.trim()}
              className="px-3 py-1 bg-[#9747FF] text-white text-xs rounded-lg disabled:opacity-40">Add</button>
          </div>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {tags.map(t => (
            <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color ?? '#9747FF' }} />
              <span className="flex-1 text-sm text-[var(--text-2)]">{t.name}</span>
              <button onClick={async () => { await docTagsApi.delete(t.id); load(); onChange(); }}
                className="text-[var(--text-1)] opacity-20 hover:text-red-400 hover:opacity-100 text-xl leading-none">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FolderModal({ folder, onClose, onSave }: {
  folder?: Folder; onClose: () => void; onSave: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(folder?.name ?? '');
  const [color, setColor] = useState(folder?.color ?? TAG_COLORS[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border border-black/10 rounded-2xl w-full max-w-sm p-5" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-1)]">{folder ? 'Rename Collection' : 'New Collection'}</h3>
          <button onClick={onClose} className="text-[var(--text-1)] opacity-40 hover:opacity-100 text-xl leading-none">×</button>
        </div>
        <input autoFocus value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), color)}
          placeholder="Collection name"
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50 mb-3" style={{ backgroundColor: 'var(--bg-input)' }} />
        <div className="flex gap-2 mb-4">
          {TAG_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? 'var(--text-1)' : 'transparent' }} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-black/10 text-[var(--text-2)] text-sm">Cancel</button>
          <button onClick={() => name.trim() && onSave(name.trim(), color)}
            disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-[#9747FF] text-white text-sm disabled:opacity-40">
            {folder ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}


function NoteListItem({ doc, preview, isSelected, onClick, onDelete, onMoveToFolder, folders }: {
  doc: Document;
  preview?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  folders: Folder[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [openSub, setOpenSub] = useState<'folder' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const flat = flattenFolders(folders);
  const docTags = doc.tags ?? [];

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setOpenSub(null);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  return (
    <div
      onClick={onClick}
      className="group relative mx-2 my-2 px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
      style={{ backgroundColor: isSelected ? 'var(--bg-hover)' : 'var(--bg-card)' }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)'; }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-medium leading-snug text-[var(--text-1)]">
              {doc.title}
            </p>
            {/* ⋯ menu */}
            <div ref={menuRef} className="shrink-0 relative">
              <button
                onClick={e => { e.stopPropagation(); setShowMenu(v => !v); setOpenSub(null); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/5 transition-all text-[var(--text-2)] leading-none"
              >
                ⋯
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl min-w-[170px]"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>

                  {/* Collections list */}
                  {flat.map(f => (
                    <button key={f.id} className="w-full text-left px-3 py-1.5 text-body-sm text-[var(--text-2)] hover:bg-black/5 flex items-center gap-2"
                      onClick={e => { e.stopPropagation(); onMoveToFolder(doc.id, f.id); setShowMenu(false); }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? '#9747FF' }} />
                      {f.name}
                    </button>
                  ))}

                  <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--border)' }} />
                  <button className="w-full text-left px-3 py-2 text-body-sm text-red-400 hover:bg-black/5"
                    onClick={e => { e.stopPropagation(); onDelete(doc.id); setShowMenu(false); }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview text — 1 line */}
          {preview && (
            <p className="text-xs mt-0 line-clamp-1 leading-snug" style={{ color: 'var(--text-2)' }}>
              {preview}
            </p>
          )}

          {doc.status === 'processing' && (
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs text-yellow-500">Processing…</span>
            </div>
          )}

          {/* Tags */}
          {docTags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {docTags.slice(0, 3).map(dt => (
                <span key={dt.tagId} className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: (dt.tag.color ?? '#9747FF') + '25', color: dt.tag.color ?? '#9747FF' }}>
                  {dt.tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Dates */}
          <div className="mt-1.5">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              Edited {timeAgo(doc.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const selectedFolder = searchParams.get('folder') ?? 'all';
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [debouncedDocId, setDebouncedDocId] = useState<string | null>(null);
  const debounceDocRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Capture the ?note= param once on mount so we can pre-select that doc
  const noteParamRef = useRef(searchParams.get('note'));

  const selectDoc = (id: string | null) => {
    flushPendingNoteSave(); // save before switching, fire-and-forget
    setSelectedDocId(id);
    if (debounceDocRef.current) clearTimeout(debounceDocRef.current);
    debounceDocRef.current = setTimeout(() => setDebouncedDocId(id), 300);
  };
  const { documents, folders, availableTags, notePreviews, initialized, refetch, removeDocument } = useLibrary();
  const [loading, setLoading] = useState(!initialized);
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [uploadDropdownPos, setUploadDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const uploadDropdownRef = useRef<HTMLDivElement>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showManageTags, setShowManageTags] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const filteredDocuments = useMemo(() => {
    let docs = documents;
    if (selectedFolder === 'none') docs = docs.filter(d => !d.folderId);
    else if (selectedFolder !== 'all') docs = docs.filter(d => d.folderId === selectedFolder);
    if (tagFilter) docs = docs.filter(d => d.tags?.some(dt => dt.tagId === tagFilter));
    if (search) { const q = search.toLowerCase(); docs = docs.filter(d => d.title.toLowerCase().includes(q)); }
    if (typeFilter) docs = docs.filter(d => d.type === typeFilter);
    return docs;
  }, [documents, selectedFolder, tagFilter, search, typeFilter]);
  const [deleteTarget, setDeleteTarget] = useState<Set<string> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [, setTick] = useState(0);

  // Tick every 30s so relative timestamps stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Close upload dropdown on outside click
  useEffect(() => {
    if (!showUploadDropdown) return;
    function handler(e: MouseEvent) {
      if (uploadDropdownRef.current && !uploadDropdownRef.current.contains(e.target as Node)) {
        setShowUploadDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUploadDropdown]);

  // Clear selection when folder changes so auto-select picks the new first doc
  useEffect(() => { selectDoc(null); }, [selectedFolder, search, tagFilter, typeFilter]);

  useEffect(() => {
    const handler = () => setShowFolderModal(true);
    window.addEventListener('library:new-folder', handler);
    return () => window.removeEventListener('library:new-folder', handler);
  }, []);

  useEffect(() => {
    if (!initialized) {
      refetch().finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select: prefer ?note= param on first load, otherwise keep current or pick first
  useEffect(() => {
    if (filteredDocuments.length === 0) { selectDoc(null); return; }
    setSelectedDocId(prev => {
      if (!prev && noteParamRef.current && filteredDocuments.some(d => d.id === noteParamRef.current)) {
        const id = noteParamRef.current!;
        selectDoc(id);
        return id;
      }
      const next = prev && filteredDocuments.some(d => d.id === prev) ? prev : filteredDocuments[0].id;
      if (next !== prev) selectDoc(next);
      return next;
    });
  }, [filteredDocuments]);

  useEffect(() => {
    if (!documents.some(d => d.status === 'processing')) return;
    const iv = setInterval(refetch, 3000);
    return () => clearInterval(iv);
  }, [documents, refetch]);

  async function confirmDelete(ids: Set<string>) {
    setDeleting(true);
    await Promise.all([...ids].map(id => documentsApi.delete(id)));
    setDeleting(false);
    setDeleteTarget(null);
    if (selectedDocId && ids.has(selectedDocId)) selectDoc(null);
    ids.forEach(id => removeDocument(id));
  }

  const folderName = selectedFolder === 'all' ? 'Notes'
    : selectedFolder === 'none' ? 'Unfiled'
      : flattenFolders(folders).find(f => f.id === selectedFolder)?.name ?? 'Notes';

  return (
    <DndContext onDragEnd={async (e: DragEndEvent) => {
      const overId = e.over?.id as string | undefined;
      if (!overId?.startsWith('folder-')) return;
      await documentsApi.setFolder(e.active.id as string, overId.replace('folder-', ''));
      refetch();
    }}>
      {/* Full-height split panel */}
      <div className="flex h-full overflow-hidden">

        {/* LEFT: Note list — full width on mobile when no doc selected, hidden when doc selected */}
        <div
          className={`flex-col shrink-0 overflow-hidden ${selectedDocId ? 'hidden lg:flex' : 'flex w-full'} lg:w-[280px]`}
          style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
        >
          {/* Left header: title + upload */}
          <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-body-sm font-semibold text-[var(--text-1)]">{folderName}</h1>
              <div ref={uploadDropdownRef} className="relative">
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const isDesktop = window.innerWidth >= 1024;
                    setUploadDropdownPos(
                      isDesktop
                        ? { top: rect.top, left: rect.right + 6 }
                        : { top: rect.bottom + 6, left: Math.max(rect.right - 176, 8) }
                    );
                    setShowUploadDropdown(v => !v);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  <Plus size={14} />
                </button>
                {showUploadDropdown && uploadDropdownPos && (
                  <div
                    className="fixed z-50 rounded-xl shadow-xl py-1 min-w-[176px]"
                    style={{ top: uploadDropdownPos.top, left: uploadDropdownPos.left, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    {([
                      { type: 'blank' as UploadType, label: 'New Note', icon: PenLine, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
                      { type: 'file' as UploadType, label: 'Upload File', icon: Upload, color: '#FF6500', bg: 'rgba(255,101,0,0.12)' },
                      { type: 'record' as UploadType, label: 'Record Audio', icon: Mic, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
                      { type: 'video' as UploadType, label: 'Upload Video URL', icon: Youtube, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
                    ] as const).map(({ type, label, icon: Icon, color, bg }) => (
                      <button
                        key={type}
                        onClick={() => { setShowUploadDropdown(false); setUploadType(type); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                      >
                        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                          <Icon size={11} style={{ color }} />
                        </span>
                        <span className="text-xs text-[var(--text-1)]">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Search + filter */}
            <div className="flex items-center gap-3">
              <Input
                variant="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="flex-1"
              />
              <TagDropdown
                tags={availableTags}
                value={tagFilter}
                onChange={setTagFilter}
                onManageTags={() => setShowManageTags(true)}
                align="right"
              />
            </div>
            {tagFilter && (() => {
              const tag = availableTags.find(t => t.id === tagFilter);
              return tag ? (
                <div className="flex items-center gap-1 mt-1.5">
                  <span
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: (tag.color ?? 'var(--brand)') + '25', color: tag.color ?? 'var(--brand)' }}
                  >
                    {tag.name}
                    <button onClick={() => setTagFilter('')} className="leading-none hover:opacity-70 ml-0.5">×</button>
                  </span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto py-1 scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <LoadingSpinner size="md" />
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 px-4 gap-2">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}
                >
                  <PenLine size={20} style={{ color: 'var(--brand)' }} />
                </div>
                <p className="text-body-sm font-medium text-[var(--text-1)]">
                  {search || tagFilter || typeFilter ? 'No matches' : 'No notes yet'}
                </p>
                {!search && !tagFilter && !typeFilter && (
                  <p className="text-xs text-[var(--text-3)]">Upload a file or create a blank note to get started</p>
                )}
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <NoteListItem
                  key={doc.id}
                  doc={doc}
                  preview={notePreviews[doc.id]}
                  isSelected={selectedDocId === doc.id}
                  onClick={() => selectDoc(doc.id)}
                  onDelete={(id) => setDeleteTarget(new Set([id]))}
                  onMoveToFolder={async (docId, folderId) => { await documentsApi.setFolder(docId, folderId); refetch(); }}
                  folders={folders}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Document detail — hidden on mobile when no doc selected */}
        <div className={`flex-1 overflow-hidden ${selectedDocId ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`} style={{ backgroundColor: 'var(--bg-page)' }}>
          {debouncedDocId ? (
            <DocumentDetail
              key={debouncedDocId}
              id={debouncedDocId}
              embedded
              onBack={() => selectDoc(null)}
              availableTags={availableTags}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}
              >
                <PenLine size={28} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="text-body font-semibold text-[var(--text-1)]">Select a note to view it</p>
                <p className="text-body-sm text-[var(--text-3)] mt-1">Or create a new note to get started</p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-1 px-5 py-2.5 rounded-xl text-body-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
              >
                + New Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {uploadType && (
        <UploadDialog
          type={uploadType}
          onClose={() => setUploadType(null)}
          onSuccess={(docId) => { setUploadType(null); refetch(); if (docId) selectDoc(docId); }}
        />
      )}
      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onSave={async (name, color) => {
            await foldersApi.create({ name, color });
            setShowFolderModal(false);
            refetch();
            notifyFoldersChanged();
          }}
        />
      )}
      {showManageTags && <ManageTagsModal onClose={() => setShowManageTags(false)} onChange={() => refetch()} />}
      {deleteTarget && (
        <DeleteConfirmModal
          count={deleteTarget.size}
          onConfirm={() => confirmDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </DndContext>
  );
}
