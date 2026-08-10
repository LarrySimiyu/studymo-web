'use client';

import { SlidersHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagBadge } from './badge';
import TagRowMenu from './tagRowMenu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './dropdownMenu';

export type Tag = { id: string; name: string; color: string | null };

interface Props {
  tags: Tag[];
  /** Filter mode: single selected tag id */
  value?: string;
  /** Toggle mode: set of applied tag ids */
  selectedIds?: Set<string>;
  onChange: (id: string) => void;
  onManageTags: () => void;
  /** Omit to hide the per-row ⋯ (rename / recolour / delete). */
  onTagsChanged?: () => void;
  placeholder?: string;
  align?: 'left' | 'right';
  /** 'icon' = sliders icon only (default). 'add-tag' = Plus + "Add tag" text with dotted border. */
  variant?: 'icon' | 'add-tag';
}

export default function TagDropdown({
  tags,
  value,
  selectedIds,
  onChange,
  onManageTags,
  onTagsChanged,
  align = 'left',
  variant = 'icon',
}: Props) {
  const selected = value ? tags.find(t => t.id === value) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'add-tag' ? (
          <button
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-px text-xs font-medium outline-none transition-colors',
              'border border-dashed border-[var(--border-md)] text-[var(--text-2)]',
              'hover:border-[var(--text-1)] hover:text-[var(--text-1)]',
              'data-[state=open]:border-[var(--text-1)] data-[state=open]:text-[var(--text-1)]'
            )}
          >
            <Plus size={11} />
            Add tag
          </button>
        ) : (
          <button
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-xs outline-none transition-colors"
            style={{ color: selected ? 'var(--brand)' : 'var(--text-2)' }}
            aria-label="Filter by tag"
          >
            <SlidersHorizontal size={13} />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align === 'right' ? 'end' : 'start'} className="min-w-[170px]">
        {tags.map(t => (
          <DropdownMenuItem
            key={t.id}
            className="group/row justify-between pr-1 focus:bg-transparent data-[highlighted]:bg-transparent"
            // Multi-select stays open so several tags can be toggled in one pass.
            onSelect={e => { if (selectedIds) e.preventDefault(); onChange(t.id); }}
          >
            <TagBadge color={t.color} size="sm">{t.name}</TagBadge>
            {onTagsChanged && (
              <TagRowMenu
                tag={t}
                onChanged={onTagsChanged}
                className="opacity-0 group-hover/row:opacity-100 data-[state=open]:opacity-100"
              />
            )}
          </DropdownMenuItem>
        ))}

        {tags.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={onManageTags}>
          <Plus size={12} />
          Add tag
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
