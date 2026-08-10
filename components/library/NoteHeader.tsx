'use client';

import { ReactNode, useState } from 'react';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { documentsApi, Document } from '@/lib/api/documents';
import { Button } from '@/components/ui/Button';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';

interface Props {
  doc: Document;
  id: string;
  embedded?: boolean;
  onRename: (next: string) => void;
  onBack?: () => void;
  onDeleteConfirm: () => void;
  /** Rendered as a second row under the title, inside the same pinned container. */
  toolbar?: ReactNode;
}

export default function NoteHeader({
  doc, id, embedded, onRename, onBack, onDeleteConfirm, toolbar,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function save() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== doc.title) onRename(next);
  }

  const rowActions: RowAction[] = [
    ...(doc.fileUrl ? [{
      label: 'View original',
      icon: FileText,
      onSelect: async () => {
        const { data } = await documentsApi.getFileUrl(id);
        if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer');
      },
    }] : []),
    { label: 'Delete', icon: Trash2, danger: true, onSelect: onDeleteConfirm },
  ];

  return (
    <div
      className="relative z-20 shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex h-14 items-center gap-3 px-4 sm:px-5">
        {!embedded && (
          <Button variant="ghost" size="icon-sm" onClick={() => onBack?.()} aria-label="Back">
            <ArrowLeft size={16} />
          </Button>
        )}

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            placeholder="Untitled"
            className="min-w-0 flex-1 border-b bg-transparent text-body-sm font-semibold text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
            style={{ borderColor: 'var(--brand)' }}
          />
        ) : (
          <button
            onClick={() => { setDraft(doc.title); setEditing(true); }}
            title="Click to rename"
            className="min-w-0 flex-1 truncate text-left text-body-sm font-semibold text-[var(--text-1)] transition-colors hover:text-[var(--text-2)]"
          >
            {doc.title || 'Untitled'}
          </button>
        )}

        <RowActionsMenu actions={rowActions} className="shrink-0 text-[var(--text-2)]" />
      </div>

      {toolbar && <div className="px-2.5 pb-1.5 sm:px-3.5 sm:pb-2">{toolbar}</div>}
    </div>
  );
}
