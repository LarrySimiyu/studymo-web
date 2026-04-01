'use client';

import { useEffect, useRef, useState } from 'react';

export type Tag = { id: string; name: string; color: string | null };

interface Props {
  tags: Tag[];
  /** Currently selected tag id — shows selected tag in trigger (filter mode) */
  value?: string;
  onChange: (id: string) => void;
  onManageTags: () => void;
  placeholder?: string;
  align?: 'left' | 'right';
}

export default function TagDropdown({
  tags,
  value,
  onChange,
  onManageTags,
  placeholder = 'All Tags',
  align = 'left',
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const selected = value ? tags.find(t => t.id === value) : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors"
        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
      >
        {selected ? (
          <>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selected.color ?? '#9747FF' }} />
            {selected.name}
          </>
        ) : placeholder}
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-3)' }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 z-50 rounded-xl shadow-xl py-1 min-w-[150px]`}
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {tags.map(t => (
            <button
              key={t.id}
              onClick={e => { e.stopPropagation(); onChange(t.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-1)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color ?? '#9747FF' }} />
              {t.name}
            </button>
          ))}
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
