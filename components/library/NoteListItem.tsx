'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Document } from '@/lib/api/documents';
import { Folder } from '@/lib/api/organization';
import { timeAgo, flattenFolders } from './libraryUtils';
import { TagBadge } from '@/components/ui/badge';

interface Props {
  doc: Document;
  preview?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  folders: Folder[];
}

export default function NoteListItem({ doc, preview, isSelected, onClick, onDelete, onMoveToFolder, folders }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const flat = flattenFolders(folders);
  const docTags = doc.tags ?? [];

  useEffect(() => {
    if (!showMenu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showMenu]);

  return (
    <div
      onClick={onClick}
      className="group relative px-4 py-3 cursor-pointer transition-colors border-b"
      style={{ backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent', borderColor: 'var(--border)' }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
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
                onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/5 transition-all text-[var(--text-2)] leading-none"
              >
                ⋯
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl min-w-[170px]"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {flat.map(f => (
                    <button
                      key={f.id}
                      className="w-full text-left px-3 py-1.5 text-body-sm text-[var(--text-2)] hover:bg-black/5 flex items-center gap-2"
                      onClick={e => { e.stopPropagation(); onMoveToFolder(doc.id, f.id); setShowMenu(false); }}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color ?? 'var(--brand)' }} />
                      {f.name}
                    </button>
                  ))}
                  <div className="border-t mx-2 my-1" style={{ borderColor: 'var(--border)' }} />
                  <button
                    className="w-full text-left px-3 py-2 text-body-sm text-red-400 hover:bg-black/5"
                    onClick={e => { e.stopPropagation(); onDelete(doc.id); setShowMenu(false); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

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

          {doc.status === 'failed' && (
            <div className="flex items-start gap-1 mt-1" title={doc.errorMessage ?? undefined}>
              <AlertCircle size={11} className="shrink-0 mt-[2px]" style={{ color: 'var(--danger-ink)' }} />
              <span className="text-xs leading-snug line-clamp-2" style={{ color: 'var(--danger-ink)' }}>
                {doc.errorMessage ?? 'Processing failed'}
              </span>
            </div>
          )}

          {docTags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {docTags.slice(0, 3).map(dt => (
                <TagBadge key={dt.tagId} color={dt.tag.color} size="sm">
                  {dt.tag.name}
                </TagBadge>
              ))}
            </div>
          )}

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
