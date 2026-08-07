'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TutorSessionSummary } from '@/lib/api/tutor';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { timeAgo } from '@/components/library/libraryUtils';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';
import { subItemRow, subItemIdle, subItemActive } from './SidebarNavPrimitives';

interface Props {
  session: TutorSessionSummary;
  active: boolean;
  onSelect: (id: string) => void;
  onDeleted?: (id: string) => void;
  // 'compact' — one truncated line, for the sidebar. 'full' — card with timestamp.
  variant?: 'compact' | 'full';
}

export default function ChatHistoryRow({ session, active, onSelect, onDeleted, variant = 'compact' }: Props) {
  const { renameSession, removeSession } = useTutorSessions();
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const savedRef = useRef(false);

  const compact = variant === 'compact';

  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuPos]);

  function openMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (menuPos) { setMenuPos(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: Math.max(rect.right - 148, 8) });
  }

  function startRename() {
    setMenuPos(null);
    setDraft(session.title);
    savedRef.current = false;
    setRenaming(true);
  }

  async function commitRename() {
    if (savedRef.current) return;
    savedRef.current = true;
    setRenaming(false);
    const next = draft.trim();
    if (!next || next === session.title) return;
    await renameSession(session.id, next);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await removeSession(session.id);
      onDeleted?.(session.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (renaming) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={e => {
          if (e.key === 'Enter') commitRename();
          if (e.key === 'Escape') { savedRef.current = true; setRenaming(false); }
        }}
        className={cn(
          'w-full bg-transparent outline-none border-b text-[var(--text-1)]',
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-2.5 text-sm font-medium'
        )}
        style={{ borderColor: 'var(--brand)' }}
      />
    );
  }

  return (
    <>
      <div
        onClick={() => onSelect(session.id)}
        className={cn(
          'group cursor-pointer',
          compact
            ? cn(subItemRow, active ? subItemActive : subItemIdle)
            : cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors',
                active ? 'bg-[var(--bg-hover)]' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]'
              )
        )}
      >
        <div className="flex-1 min-w-0">
          <p className={cn('truncate', compact ? '' : 'text-sm font-medium text-[var(--text-1)]')}>
            {session.title}
          </p>
          {!compact && (
            <p className="text-xs text-[var(--text-3)] mt-0.5">{timeAgo(session.updatedAt)}</p>
          )}
        </div>

        <button
          onClick={openMenu}
          onMouseDown={e => e.stopPropagation()}
          title="Chat options"
          className={cn(
            'shrink-0 rounded transition-opacity text-[var(--text-3)] hover:text-[var(--text-1)]',
            // Hover-reveal only in the sidebar; touch has no hover, so the full list keeps it visible.
            !compact || menuPos ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
          )}
        >
          <MoreHorizontal size={compact ? 14 : 16} />
        </button>
      </div>

      {menuPos && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          className="fixed z-[60] rounded-xl shadow-xl py-1 min-w-[140px]"
          style={{ top: menuPos.top, left: menuPos.left, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={startRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-[var(--text-1)] transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          >
            <Pencil size={13} style={{ color: 'var(--text-3)' }} />
            Rename
          </button>
          <button
            onClick={() => { setMenuPos(null); setConfirming(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors"
            style={{ color: '#EF4444' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>,
        document.body
      )}

      <DeleteConfirmModal
        open={confirming}
        title="Delete this chat?"
        description={`“${session.title}” and its full message history will be permanently deleted.`}
        onConfirm={confirmDelete}
        onClose={() => setConfirming(false)}
        deleting={deleting}
      />
    </>
  );
}
