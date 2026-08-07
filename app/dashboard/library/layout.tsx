'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, useSelectedLayoutSegment } from 'next/navigation';
import { documentsApi, watchDocumentStatus } from '@/lib/api/documents';
import { foldersApi } from '@/lib/api/organization';
import { useLibrary } from '@/context/LibraryContext';
import { flushPendingNoteSave } from '@/components/library/DocumentDetail';
import NoteListItem from '@/components/library/NoteListItem';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';
import FolderModal from '@/components/library/FolderModal';
import ManageTagsModal from '@/components/library/ManageTagsModal';
import LibraryUploadMenu from '@/components/library/LibraryUploadMenu';
import { flattenFolders, notifyFoldersChanged } from '@/components/library/libraryUtils';
import { TagBadge } from '@/components/ui/badge';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import TagDropdown from '@/components/ui/TagDropdown';
import { Input } from '@/components/ui/Input';
import { PenLine } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Null on /dashboard/library, the document id on /dashboard/library/[id].
  const selectedDocId = useSelectedLayoutSegment();
  const selectedFolder = searchParams.get('folder') ?? 'all';

  const { documents, folders, availableTags, notePreviews, initialized, refetch, removeDocument } = useLibrary();
  const [loading, setLoading] = useState(!initialized);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showManageTags, setShowManageTags] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeFilter] = useState('');
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

  // ?folder= has to survive the hop into a note, or the list and sidebar reset to "all".
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : '';

  function openDoc(id: string) {
    flushPendingNoteSave();
    router.push(`/dashboard/library/${id}${suffix}`);
  }

  // Tick every 30s so relative timestamps stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

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

  // Keep a note open whenever there is one to open: land on the first match, and
  // fall to the first match again when the open note is filtered or deleted away.
  // router.replace, not push — these are corrections, not steps the user took, and
  // pushing them would make Back walk through every filter keystroke.
  useEffect(() => {
    if (!initialized) return;
    if (selectedDocId && filteredDocuments.some(d => d.id === selectedDocId)) return;
    const first = filteredDocuments[0];
    if (first) router.replace(`/dashboard/library/${first.id}${suffix}`);
    else if (selectedDocId) router.replace(`/dashboard/library${suffix}`);
  }, [filteredDocuments, selectedDocId, initialized, router, suffix]);

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
    setDeleteTarget(null);
    if (results.some(r => r.error)) {
      await refetch();
      return;
    }
    ids.forEach(id => removeDocument(id));
  }

  const folderName = selectedFolder === 'all' ? 'Notes'
    : selectedFolder === 'none' ? 'Unfiled'
    : flattenFolders(folders).find(f => f.id === selectedFolder)?.name ?? 'Notes';

  const activeTag = tagFilter ? availableTags.find(t => t.id === tagFilter) : null;

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
          <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-body-sm font-semibold text-[var(--text-1)]">{folderName}</h1>
              <LibraryUploadMenu
                onDismiss={refetch}
                // Await the refetch — navigating first would land on a note the
                // list doesn't know about yet, and the filter guard would bounce it.
                onUploaded={async docId => { await refetch(); if (docId) openDoc(docId); }}
              />
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
            {activeTag && (
              <div className="flex items-center gap-1 mt-1.5">
                <TagBadge
                  color={activeTag.color}
                  onRemove={() => setTagFilter('')}
                  removeLabel={`Clear ${activeTag.name} filter`}
                >
                  {activeTag.name}
                </TagBadge>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <LoadingSpinner size="md" />
            ) : filteredDocuments.length === 0 ? (
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
                  onClick={() => openDoc(doc.id)}
                  onDelete={id => setDeleteTarget(new Set([id]))}
                  onMoveToFolder={async (docId, folderId) => { await documentsApi.setFolder(docId, folderId); refetch(); }}
                  folders={folders}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Document detail route */}
        <div
          className={`flex-1 overflow-hidden ${selectedDocId ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}
          style={{ backgroundColor: 'var(--bg-page)' }}
        >
          {children}
        </div>
      </div>

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
