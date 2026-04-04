'use client';

import { useRef, useState } from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';

export type Tag = { id: string; name: string; color: string | null };

interface Props {
  tags: Tag[];
  /** Filter mode: single selected tag id */
  value?: string;
  /** Toggle mode: set of applied tag ids */
  selectedIds?: Set<string>;
  onChange: (id: string) => void;
  onManageTags: () => void;
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
  placeholder = 'All Tags',
  align = 'left',
  variant = 'icon',
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const selected = value ? tags.find(t => t.id === value) : null;

  return (
    <div className="relative" ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {variant === 'add-tag' ? (
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors group"
          style={{ border: '1px dashed var(--border-md)', color: 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-md)'; }}
        >
          <Plus size={12} />
          Add tag
        </button>
      ) : (
        <button
          className="flex items-center gap-1.5 px-1.5 py-1 rounded text-xs transition-colors"
          style={{ color: selected ? 'var(--brand)' : 'var(--text-2)' }}
        >
          <SlidersHorizontal size={13} />
        </button>
      )}

      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 z-[9999] rounded-xl shadow-xl py-1 min-w-[150px]`}
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {tags.map(t => {
            const isActive = selectedIds?.has(t.id) ?? false;
            return (
              <button
                key={t.id}
                onClick={e => { e.stopPropagation(); onChange(t.id); if (!selectedIds) setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color ?? 'var(--brand)' }} />
                <span className="flex-1 text-left">{t.name}</span>
                {isActive && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: t.color ?? 'var(--brand)' }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
          <div className="my-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onManageTags(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            + Add tag
          </button>
        </div>
      )}
    </div>
  );
}
