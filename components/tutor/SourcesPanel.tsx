'use client';

import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SourceItem {
  id: string;
  title: string;
  noteId?: string;
  status: string;
}

interface Props {
  sources: SourceItem[];
  attachedIds: string[];
  onToggle: (noteId: string) => void;
  maxNotes?: number;
  className?: string;
}

function statusLabel(status: string): { text: string; icon: typeof AlertCircle | null } {
  if (status === 'failed') return { text: 'Upload failed', icon: AlertCircle };
  if (status === 'complete') return { text: 'No notes yet', icon: null };
  return { text: 'Processing…', icon: Loader2 };
}

export default function SourcesPanel({ sources, attachedIds, onToggle, maxNotes = 15, className }: Props) {
  const attached = new Set(attachedIds);
  const atLimit = attached.size >= maxNotes;

  return (
    <Card
      className={cn('flex flex-col overflow-hidden rounded-none border-0 shadow-none bg-[var(--bg-card)]', className)}
    >
      <CardHeader
        className="flex-row items-center justify-between space-y-0 shrink-0 px-4 h-14"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <CardTitle className="text-sm font-semibold text-[var(--text-1)]">Sources</CardTitle>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {attached.size}/{maxNotes}
        </span>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto p-2">
        {sources.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs" style={{ color: 'var(--text-3)' }}>
            Nothing in your library yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sources.map(s => {
              const on = !!s.noteId && attached.has(s.noteId);
              const blocked = !s.noteId || (!on && atLimit);
              const status = statusLabel(s.status);
              const StatusIcon = status.icon;

              return (
                <li key={s.id}>
                  <button
                    onClick={() => s.noteId && onToggle(s.noteId)}
                    disabled={blocked}
                    role="checkbox"
                    aria-checked={on}
                    title={s.noteId ? s.title : `${s.title} — ${status.text}`}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                      'hover:bg-[var(--bg-hover)] disabled:pointer-events-none'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border transition-colors',
                        on ? 'border-[var(--brand)]' : 'border-[var(--border-md)]',
                        !s.noteId && 'opacity-40'
                      )}
                    >
                      {on && <span className="h-[7px] w-[7px] rounded-full bg-[var(--brand)]" />}
                    </span>

                    <FileText size={13} className="shrink-0" style={{ color: 'var(--text-3)' }} />

                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-xs"
                        style={{ color: on ? 'var(--text-1)' : s.noteId ? 'var(--text-2)' : 'var(--text-3)' }}
                      >
                        {s.title}
                      </span>
                      {!s.noteId && (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-3)' }}>
                          {StatusIcon && (
                            <StatusIcon size={10} className={cn('shrink-0', s.status !== 'failed' && 'animate-spin')} />
                          )}
                          {status.text}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
