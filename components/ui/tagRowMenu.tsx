'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { docTagsApi } from '@/lib/api/documents';
import { TAG_COLORS, tagColor, colorName } from '@/lib/tagColors';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdownMenu';

export type EditableTag = { id: string; name: string; color: string | null };

interface Props {
  tag: EditableTag;
  /** Called after a rename, recolour, or delete lands. */
  onChanged: () => void;
  className?: string;
}

/** Notion-style ⋯ menu on a tag row: rename, recolour, delete. */
export default function TagRowMenu({ tag, onChanged, className }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(tag.name);
  const current = tagColor(tag.color);

  // DocumentDetail only re-reads tags when the library context hands it a new
  // array, so a local refetch alone leaves the note header showing stale colours.
  const syncLibrary = () => {
    onChanged();
    window.dispatchEvent(new CustomEvent('library:refetch'));
  };

  const commit = async (data: { name?: string; color?: string }) => {
    await docTagsApi.update(tag.id, data);
    syncLibrary();
  };

  const renameIfChanged = () => {
    const next = name.trim();
    if (!next || next === tag.name) { setName(tag.name); return; }
    commit({ name: next });
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={next => { setOpen(next); if (next) setName(tag.name); }}
    >
      <DropdownMenuTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          aria-label={`Edit ${tag.name}`}
          className={cn(
            'shrink-0 rounded p-0.5 leading-none text-[var(--text-3)] outline-none transition-colors',
            'hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)] data-[state=open]:text-[var(--text-1)]',
            className
          )}
        >
          <MoreHorizontal size={13} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]" onClick={e => e.stopPropagation()}>
        <div className="p-1">
          <input
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') { renameIfChanged(); setOpen(false); }
              if (e.key === 'Escape') { setName(tag.name); setOpen(false); }
            }}
            onBlur={renameIfChanged}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-1)] outline-none focus:border-[var(--brand-border)]"
          />
        </div>

        <DropdownMenuItem
          className="text-[var(--danger-ink)]"
          onSelect={async () => {
            await docTagsApi.delete(tag.id);
            syncLibrary();
          }}
        >
          <Trash2 size={12} />
          Delete
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Colors</DropdownMenuLabel>

        <div className="max-h-[190px] overflow-y-auto">
          {TAG_COLORS.map(c => (
            <DropdownMenuCheckItem
              key={c}
              checked={c === current}
              onSelect={() => commit({ color: c })}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c }} />
              {colorName(c)}
            </DropdownMenuCheckItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
