'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { documentsApi, docTagsApi, watchDocumentStatus } from '@/lib/api/documents';
import { foldersApi } from '@/lib/api/organization';
import { useLibrary } from '@/context/LibraryContext';
import DocumentDetail, { flushPendingNoteSave } from '@/components/library/DocumentDetail';
import UploadDialog, { UploadType } from '@/components/upload/UploadDialog';
import NoteListItem from '@/components/library/NoteListItem';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';
import FolderModal from '@/components/library/FolderModal';
import ManageTagsModal from '@/components/library/ManageTagsModal';
import { flattenFolders, notifyFoldersChanged } from '@/components/library/libraryUtils';
import { TagBadge } from '@/components/ui/badge';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import TagDropdown from '@/components/ui/TagDropdown';
import { Input } from '@/components/ui/Input';
import { PenLine, Upload, Mic, Youtube, Globe, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const selectedFolder = searchParams.get('folder') ?? 'all';
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [debouncedDocId, setDebouncedDocId] = useState<string | null>(null);
  const debounceDocRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteParamRef = useRef(searchParams.get('note'));

  const selectDoc = (id: string | null) => {
    flushPendingNoteSave();
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
  const [deleteTarget, setDeleteTarget] = useState<Set<string> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [, setTick] = useState(0);

  const filteredDocuments = useMemo(() => {
    let docs = documents;
    if (selectedFolder === 'none') docs = docs.filter(d => !d.folderId);
    else if (selectedFolder !== 'all') docs = docs.filter(d => d.folderId === selectedFolder);
    if (tagFilter) docs = docs.filter(d => d.tags?.some(dt => dt.tagId === tagFilter));
    if (search) { const q = search.toLowerCase(); docs = docs.filter(d => d.title.toLowerCase().includes(q)); }
    if (typeFilter) docs = docs.filter(d => d.type === typeFilter);
    return docs;
  }, [documents, selectedFolder, tagFilter, search, typeFilter]);

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

  // Clear selection when filters change
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

  // SSE: one connection per processing doc, refetch once on completion/failure
  useEffect(() => {
    const processing = documents.filter(d => d.status === 'processing');
    if (processing.length === 0) return;
    const cancels = processing.map(doc => watchDocumentStatus(doc.id, () => { refetch(); }));
    return () => { cancels.forEach(cancel => cancel()); };
  }, [documents, refetch]);

  async function confirmDelete(ids: Set<string>) {
    setDeleting(true);
    const results = await Promise.all([...ids].map(id => documentsApi.delete(id)));
    setDeleting(false);
    const failed = results.some(r => r.error);
    if (failed) {
      await refetch();
      setDeleteTarget(null);
      return;
    }
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
      <div className="flex h-full overflow-hidden">

        {/* LEFT: Note list */}
        <div
          className={`flex-col shrink-0 overflow-hidden ${selectedDocId ? 'hidden md:flex' : 'flex w-full'} md:w-[260px]`}
          style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-page)' }}
        >
          {/* Header */}
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
                      { type: 'video' as UploadType, label: 'YouTube URL', icon: Youtube, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
                      { type: 'webpage' as UploadType, label: 'Import Website', icon: Globe, color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
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
                onTagsChanged={refetch}
                align="right"
              />
            </div>
            {tagFilter && (() => {
              const tag = availableTags.find(t => t.id === tagFilter);
              return tag ? (
                <div className="flex items-center gap-1 mt-1.5">
                  <TagBadge
                    color={tag.color}
                    onRemove={() => setTagFilter('')}
                    removeLabel={`Clear ${tag.name} filter`}
                  >
                    {tag.name}
                  </TagBadge>
                </div>
              ) : null;
            })()}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <LoadingSpinner size="md" />
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 px-4 gap-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
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

        {/* RIGHT: Document detail */}
        <div className={`flex-1 overflow-hidden ${selectedDocId ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`} style={{ backgroundColor: 'var(--bg-page)' }}>
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
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                <PenLine size={28} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="text-body font-semibold text-[var(--text-1)]">Select a note to view it</p>
                <p className="text-body-sm text-[var(--text-3)] mt-1">Or create a new note to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {uploadType && (
        <UploadDialog
          type={uploadType}
          onClose={() => { setUploadType(null); refetch(); }}
          onSuccess={(docId) => { setUploadType(null); refetch(); if (docId) selectDoc(docId); }}
        />
      )}
      <FolderModal
        open={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSave={async (name, color) => {
          await foldersApi.create({ name, color });
          setShowFolderModal(false);
          refetch();
          notifyFoldersChanged();
        }}
      />
      <ManageTagsModal
        open={showManageTags}
        onClose={() => setShowManageTags(false)}
        onChange={() => refetch()}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        count={deleteTarget?.size ?? 0}
        onConfirm={() => { if (deleteTarget) confirmDelete(deleteTarget); }}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </DndContext>
  );
}
