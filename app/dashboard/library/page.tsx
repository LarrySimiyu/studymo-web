'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
} from '@dnd-kit/core';
import { documentsApi, Document, docTagsApi } from '@/lib/api/documents';
import { foldersApi, Folder } from '@/lib/api/organization';
import UploadModal from '@/components/upload/UploadModal';

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

// Notify sidebar to refresh its folder list
function notifyFoldersChanged() {
  window.dispatchEvent(new CustomEvent('library:folders-changed'));
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'complete')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Ready</span>;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />Processing
    </span>
  );
}


function DraggableDocCard({ doc, onOpen, onMoveToFolder, onAddTag, onDelete, folders, availableTags, selected, onSelect, selectionMode }: {
  doc: Document; onOpen: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  onAddTag: (docId: string, tagId: string) => void;
  onDelete: (docId: string) => void;
  folders: Folder[]; availableTags: { id: string; name: string; color: string | null }[];
  selected: boolean; onSelect: (id: string) => void; selectionMode: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: doc.id });
  const [showMenu, setShowMenu] = useState(false);
  const [hoverSub, setHoverSub] = useState<'folder' | 'tag' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setShowMenu(false); setHoverSub(null); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  const docTags = doc.tags ?? [];
  const flat = flattenFolders(folders);

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...attributes} {...listeners}>
      <div className="group relative p-5 rounded-xl transition-all select-none"
        style={{ backgroundColor: '#1A1A1A', border: `1px solid ${selected ? '#9747FF' : isDragging ? '#9747FF60' : '#2A2A2A'}` }}>
        {/* Checkbox */}
        <div
          className="absolute top-3 left-3 z-10"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onSelect(doc.id); }}
        >
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ backgroundColor: selected ? '#9747FF' : 'transparent', borderColor: selected ? '#9747FF' : '#444' }}>
            {selected && <span className="text-white text-xs leading-none">✓</span>}
          </div>
        </div>
        <div onClick={() => selectionMode ? onSelect(doc.id) : onOpen(doc.id)} className="cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{typeIcon(doc.type)}</span>
            <StatusBadge status={doc.status} />
          </div>
          <p className="text-white font-medium text-sm line-clamp-2 mb-1">{doc.title}</p>
          {doc.folder && <p className="text-xs text-white/30 mb-1">📁 {doc.folder.name}</p>}
          {docTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {docTags.slice(0, 3).map(dt => (
                <span key={dt.tagId} className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: (dt.tag.color ?? '#9747FF') + '30', color: dt.tag.color ?? '#9747FF' }}>
                  {dt.tag.name}
                </span>
              ))}
              {docTags.length > 3 && <span className="text-xs text-white/30">+{docTags.length - 3}</span>}
            </div>
          )}
          <p className="text-xs text-white/30">
            {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="absolute top-3 right-3" ref={menuRef}>
          <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
            className="p-1 text-white/20 hover:text-white/60 rounded hover:bg-white/5 transition-all text-lg leading-none">⋯</button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-xl min-w-[160px]">
              <div className="relative" onMouseEnter={() => setHoverSub('folder')} onMouseLeave={() => setHoverSub(null)}>
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex justify-between items-center">
                  Move to folder <span className="text-white/30 text-xs">›</span>
                </button>
                {hoverSub === 'folder' && (
                  <div className="absolute left-full top-0 ml-1 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-xl min-w-[160px] overflow-hidden z-50">
                    {doc.folderId && (
                      <button className="w-full text-left px-3 py-2 text-sm text-white/50 hover:bg-white/5"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => { onMoveToFolder(doc.id, null); setShowMenu(false); }}>Remove from folder</button>
                    )}
                    {flat.map(f => (
                      <button key={f.id} className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => { onMoveToFolder(doc.id, f.id); setShowMenu(false); }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color ?? '#9747FF' }} />
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" onMouseEnter={() => setHoverSub('tag')} onMouseLeave={() => setHoverSub(null)}>
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex justify-between items-center">
                  Add tag <span className="text-white/30 text-xs">›</span>
                </button>
                {hoverSub === 'tag' && availableTags.length > 0 && (
                  <div className="absolute left-full top-0 ml-1 bg-[#2A2A2A] border border-white/10 rounded-xl shadow-xl min-w-[160px] overflow-hidden z-50">
                    {availableTags.map(t => (
                      <button key={t.id} className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => { onAddTag(doc.id, t.id); setShowMenu(false); }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color ?? '#9747FF' }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-white/5" />
              <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => { onDelete(doc.id); setShowMenu(false); }}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ count, onConfirm, onCancel, deleting }: {
  count: number; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: '#EF444420' }}>🗑</div>
          <div>
            <p className="text-white font-semibold">Delete {count} document{count !== 1 ? 's' : ''}?</p>
            <p className="text-white/40 text-sm mt-1">This action cannot be undone. All notes, flashcards, and quizzes for {count !== 1 ? 'these documents' : 'this document'} will be permanently deleted.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 disabled:opacity-40 transition-colors">
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
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-sm p-5">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-white">Document Tags</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="mb-4 p-3 bg-[#2A2A2A] rounded-xl">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="New tag name"
            className="w-full bg-transparent text-sm text-white outline-none placeholder-white/30 mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TAG_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} className="w-5 h-5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: newColor === c ? 'white' : 'transparent' }} />
              ))}
            </div>
            <button onClick={create} disabled={saving || !newName.trim()}
              className="px-3 py-1 bg-[#9747FF] text-white text-xs rounded-lg disabled:opacity-40">Add</button>
          </div>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {tags.map(t => (
            <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color ?? '#9747FF' }} />
              <span className="flex-1 text-sm text-white/70">{t.name}</span>
              <button onClick={async () => { await docTagsApi.delete(t.id); load(); onChange(); }}
                className="text-white/20 hover:text-red-400 text-xl leading-none">×</button>
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
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-sm p-5">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-white">{folder ? 'Rename Folder' : 'New Folder'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        <input autoFocus value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), color)}
          placeholder="Folder name"
          className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50 mb-3" />
        <div className="flex gap-2 mb-4">
          {TAG_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-sm">Cancel</button>
          <button onClick={() => name.trim() && onSave(name.trim(), color)}
            disabled={!name.trim()} className="flex-1 py-2 rounded-lg bg-[#9747FF] text-white text-sm disabled:opacity-40">
            {folder ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFolder = searchParams.get('folder') ?? 'all';
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<Folder | null>(null);
  const [showManageTags, setShowManageTags] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Set<string> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Listen for "New Folder" triggered from sidebar
  useEffect(() => {
    const handler = () => setShowFolderModal(true);
    window.addEventListener('library:new-folder', handler);
    return () => window.removeEventListener('library:new-folder', handler);
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function confirmDelete(ids: Set<string>) {
    setDeleting(true);
    await Promise.all([...ids].map(id => documentsApi.delete(id)));
    setDeleting(false);
    setDeleteTarget(null);
    clearSelection();
    fetchAll();
  }

  const fetchAll = useCallback(async () => {
    const params: Record<string, string> = {};
    if (selectedFolder === 'none') params.folderId = 'none';
    else if (selectedFolder !== 'all') params.folderId = selectedFolder;
    if (tagFilter) params.tagId = tagFilter;
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (sort !== 'newest') params.sort = sort;

    const [docsRes, foldersRes, tagsRes] = await Promise.all([
      documentsApi.getAll(params),
      foldersApi.getAll(),
      docTagsApi.getAll(),
    ]);
    if (docsRes.data) setDocuments(docsRes.data);
    if (foldersRes.data) setFolders(foldersRes.data);
    if (tagsRes.data) setAvailableTags(tagsRes.data);
  }, [selectedFolder, tagFilter, search, typeFilter, sort]);

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, [fetchAll]);
  useEffect(() => {
    if (!documents.some(d => d.status === 'processing')) return;
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, [documents, fetchAll]);

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingDocId(null);
    const overId = e.over?.id as string | undefined;
    if (!overId?.startsWith('folder-')) return;
    await documentsApi.setFolder(e.active.id as string, overId.replace('folder-', ''));
    fetchAll();
  };

  const draggingDoc = draggingDocId ? documents.find(d => d.id === draggingDocId) : null;
  const folderName = selectedFolder === 'all' ? 'All Documents'
    : selectedFolder === 'none' ? 'Unfiled'
    : flattenFolders(folders).find(f => f.id === selectedFolder)?.name ?? 'Documents';

  return (
    <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setDraggingDocId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{folderName}</h1>
              {selectedIds.size > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#9747FF20', color: '#9747FF' }}>
                  {selectedIds.size} selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {selectedIds.size > 0 ? (
                <>
                  <button onClick={clearSelection}
                    className="px-3 py-2 text-sm border border-white/10 rounded-xl text-white/50 hover:text-white/80 transition-all">
                    Deselect all
                  </button>
                  <button onClick={() => setDeleteTarget(new Set(selectedIds))}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: '#EF4444' }}>
                    Delete {selectedIds.size}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowManageTags(true)}
                    className="px-3 py-2 text-sm border border-white/10 rounded-xl text-white/50 hover:text-white/80 transition-all">
                    Manage Tags
                  </button>
                  <button onClick={() => setShowUpload(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#9747FF] hover:bg-[#8535ee] transition-colors">
                    + Upload
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 outline-none focus:border-[#9747FF]/40 w-44" />
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 outline-none">
              <option value="">All Tags</option>
              {availableTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 outline-none">
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
              <option value="video_url">Video</option>
              <option value="recording">Recording</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 outline-none">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title_asc">A→Z</option>
              <option value="title_desc">Z→A</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-white/50 mb-1">No documents found</p>
              <p className="text-white/30 text-sm">{search || tagFilter || typeFilter ? 'Try adjusting filters' : 'Upload a document to get started'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <DraggableDocCard key={doc.id} doc={doc}
                  onOpen={id => router.push(`/dashboard/library/${id}`)}
                  onMoveToFolder={async (docId, folderId) => { await documentsApi.setFolder(docId, folderId); fetchAll(); }}
                  onAddTag={async (docId, tagId) => { await documentsApi.addTag(docId, tagId); fetchAll(); }}
                  onDelete={(docId) => setDeleteTarget(new Set([docId]))}
                  folders={folders} availableTags={availableTags}
                  selected={selectedIds.has(doc.id)}
                  onSelect={toggleSelect}
                  selectionMode={selectedIds.size > 0}
                />
              ))}
            </div>
          )}
      </div>

      <DragOverlay>
        {draggingDoc && (
          <div className="p-4 rounded-xl shadow-2xl rotate-2" style={{ backgroundColor: '#1A1A1A', border: '1px solid #9747FF60', width: 200 }}>
            <span className="text-xl">{typeIcon(draggingDoc.type)}</span>
            <p className="text-white text-sm font-medium mt-1 line-clamp-1">{draggingDoc.title}</p>
          </div>
        )}
      </DragOverlay>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchAll(); }} />}
      {showFolderModal && (
        <FolderModal onClose={() => setShowFolderModal(false)} onSave={async (name, color) => {
          await foldersApi.create({ name, color });
          setShowFolderModal(false);
          fetchAll();
          notifyFoldersChanged();
        }} />
      )}
      {renamingFolder && (
        <FolderModal folder={renamingFolder} onClose={() => setRenamingFolder(null)} onSave={async (name, color) => {
          await foldersApi.update(renamingFolder.id, { name, color });
          setRenamingFolder(null);
          fetchAll();
          notifyFoldersChanged();
        }} />
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
