'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { documentsApi, Document, docTagsApi, notesApi } from '@/lib/api/documents';
import { foldersApi, Folder } from '@/lib/api/organization';
import UploadModal from '@/components/upload/UploadModal';
import DocumentDetail from '@/components/library/DocumentDetail';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import TagDropdown, { type Tag } from '@/components/ui/TagDropdown';

const TAG_COLORS = ['#9747FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#BB8FCE', '#F7DC6F'];

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

function twoSentences(text: string | null | undefined): string {
  if (!text) return '';
  // Strip HTML tags first
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const matches = plain.match(/[^.!?]+[.!?]+/g);
  if (!matches) return plain.slice(0, 120);
  return matches.slice(0, 2).join(' ').trim();
}

function NoteListItem({ doc, preview, isSelected, onClick, onDelete, onMoveToFolder, folders, availableTags, onAddTag, onManageTags }: {
  doc: Document;
  preview?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  onAddTag: (docId: string, tagId: string) => void;
  onManageTags: () => void;
  folders: Folder[];
  availableTags: Tag[];
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
      className="group relative mx-2 my-1 px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
      style={{
        backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
      }}
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

                  {/* Move to folder */}
                  <button
                    className="w-full text-left px-3 py-2 text-body-sm text-[var(--text-2)] hover:bg-black/5 flex justify-between items-center"
                    onClick={e => { e.stopPropagation(); setOpenSub(s => s === 'folder' ? null : 'folder'); }}
                  >
                    Move to collection
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-3)', transform: openSub === 'folder' ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {openSub === 'folder' && (
                    <div className="border-t mx-2" style={{ borderColor: 'var(--border)' }}>
                      {doc.folderId && (
                        <button className="w-full text-left px-3 py-1.5 text-body-sm text-[var(--text-3)] hover:bg-black/5"
                          onClick={e => { e.stopPropagation(); onMoveToFolder(doc.id, null); setShowMenu(false); }}>
                          Remove from folder
                        </button>
                      )}
                      {flat.map(f => (
                        <button key={f.id} className="w-full text-left px-3 py-1.5 text-body-sm text-[var(--text-2)] hover:bg-black/5 flex items-center gap-2"
                          onClick={e => { e.stopPropagation(); onMoveToFolder(doc.id, f.id); setShowMenu(false); }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? '#9747FF' }} />
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add tag */}
                  <div className="px-3 py-2" onClick={e => e.stopPropagation()}>
                    <TagDropdown
                      tags={availableTags}
                      placeholder="Add tag"
                      align="right"
                      onChange={id => { onAddTag(doc.id, id); setShowMenu(false); }}
                      onManageTags={() => { setShowMenu(false); onManageTags(); }}
                    />
                  </div>

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
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              Created {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              Edited {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    setSelectedDocId(id);
    if (debounceDocRef.current) clearTimeout(debounceDocRef.current);
    debounceDocRef.current = setTimeout(() => setDebouncedDocId(id), 300);
  };
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [notePreviews, setNotePreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showManageTags, setShowManageTags] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState<Set<string> | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clear selection when folder changes so auto-select picks the new first doc
  useEffect(() => { selectDoc(null); }, [selectedFolder, search, tagFilter, typeFilter]);

  useEffect(() => {
    const handler = () => setShowFolderModal(true);
    window.addEventListener('library:new-folder', handler);
    return () => window.removeEventListener('library:new-folder', handler);
  }, []);

  // Listen for global upload success → refetch
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener('library:refetch', handler);
    return () => window.removeEventListener('library:refetch', handler);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = useCallback(async () => {
    const params: Record<string, string> = {};
    if (selectedFolder === 'none') params.folderId = 'none';
    else if (selectedFolder !== 'all') params.folderId = selectedFolder;
    if (tagFilter) params.tagId = tagFilter;
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (sort !== 'newest') params.sort = sort;
    const [docsRes, foldersRes, tagsRes, notesRes] = await Promise.all([
      documentsApi.getAll(params),
      foldersApi.getAll(),
      docTagsApi.getAll(),
      notesApi.getAll(),
    ]);
    if (docsRes.data) setDocuments(docsRes.data);
    if (foldersRes.data) setFolders(foldersRes.data);
    if (tagsRes.data) setAvailableTags(tagsRes.data);
    if (notesRes.data) {
      const map: Record<string, string> = {};
      for (const n of notesRes.data) {
        if (n.summary) map[n.document.id] = twoSentences(n.summary);
      }
      setNotePreviews(map);
    }
  }, [selectedFolder, tagFilter, search, typeFilter, sort]);

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, [fetchAll]);

  // Auto-select: prefer ?note= param on first load, otherwise keep current or pick first
  useEffect(() => {
    if (documents.length === 0) { selectDoc(null); return; }
    setSelectedDocId(prev => {
      if (!prev && noteParamRef.current && documents.some(d => d.id === noteParamRef.current)) {
        const id = noteParamRef.current!;
        selectDoc(id);
        return id;
      }
      const next = prev && documents.some(d => d.id === prev) ? prev : documents[0].id;
      if (next !== prev) selectDoc(next);
      return next;
    });
  }, [documents]);

  useEffect(() => {
    if (!documents.some(d => d.status === 'processing')) return;
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, [documents, fetchAll]);

  async function confirmDelete(ids: Set<string>) {
    setDeleting(true);
    await Promise.all([...ids].map(id => documentsApi.delete(id)));
    setDeleting(false);
    setDeleteTarget(null);
    if (selectedDocId && ids.has(selectedDocId)) selectDoc(null);
    fetchAll();
  }

  const folderName = selectedFolder === 'all' ? 'Notes'
    : selectedFolder === 'none' ? 'Unfiled'
      : flattenFolders(folders).find(f => f.id === selectedFolder)?.name ?? 'Notes';

  return (
    <DndContext onDragEnd={async (e: DragEndEvent) => {
      const overId = e.over?.id as string | undefined;
      if (!overId?.startsWith('folder-')) return;
      await documentsApi.setFolder(e.active.id as string, overId.replace('folder-', ''));
      fetchAll();
    }}>
      {/* Full-height split panel: negate the parent's p-6 padding */}
      <div className="flex h-full -mx-6 -mt-6 -mb-6">

        {/* LEFT: Note list */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 280, borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
        >
          {/* Left header: title + upload */}
          <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-body-sm font-semibold text-[var(--text-1)]">{folderName}</h1>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-white hover:opacity-90 transition-opacity text-xl leading-none"
                style={{ backgroundColor: '#9747FF' }}
              >
                +
              </button>
            </div>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full px-3 py-1.5 rounded-lg text-body-sm outline-none text-[var(--text-1)] placeholder-[var(--text-3)] mb-2"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            />
            {/* Tag filter pill */}
            <TagDropdown
              tags={availableTags}
              value={tagFilter}
              onChange={setTagFilter}
              onManageTags={() => setShowManageTags(true)}
            />
            {/* Manage Tags link */}
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto py-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-body-sm text-[var(--text-2)]">{search || tagFilter || typeFilter ? 'No matches' : 'No notes yet'}</p>
              </div>
            ) : (
              documents.map(doc => (
                <NoteListItem
                  key={doc.id}
                  doc={doc}
                  preview={notePreviews[doc.id]}
                  isSelected={selectedDocId === doc.id}
                  onClick={() => selectDoc(doc.id)}
                  onDelete={(id) => setDeleteTarget(new Set([id]))}
                  onMoveToFolder={async (docId, folderId) => { await documentsApi.setFolder(docId, folderId); fetchAll(); }}
                  onAddTag={async (docId, tagId) => { await documentsApi.addTag(docId, tagId); fetchAll(); }}
                  onManageTags={() => setShowManageTags(true)}
                  folders={folders}
                  availableTags={availableTags}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Document detail */}
        <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
          {debouncedDocId ? (
            <DocumentDetail
              key={debouncedDocId}
              id={debouncedDocId}
              embedded
              onBack={() => selectDoc(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="text-5xl">📝</div>
              <p className="text-body text-[var(--text-2)]">Select a note to view it</p>
              <p className="text-body-sm text-[var(--text-3)]">Or upload a new note to get started</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 px-4 py-2 rounded-xl text-body-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#9747FF' }}
              >
                + Upload Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchAll(); }} />}
      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onSave={async (name, color) => {
            await foldersApi.create({ name, color });
            setShowFolderModal(false);
            fetchAll();
            notifyFoldersChanged();
          }}
        />
      )}
      {showManageTags && <ManageTagsModal onClose={() => setShowManageTags(false)} onChange={fetchAll} />}
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
