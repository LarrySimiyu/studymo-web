'use client';

import { useEffect, useRef, useState } from 'react';
import { PenLine, Upload, Mic, Youtube, Globe, Plus } from 'lucide-react';
import UploadDialog, { UploadType } from '@/components/upload/UploadDialog';

const OPTIONS = [
  { type: 'blank' as UploadType, label: 'New Note', icon: PenLine, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { type: 'file' as UploadType, label: 'Upload File', icon: Upload, color: '#FF6500', bg: 'rgba(255,101,0,0.12)' },
  { type: 'record' as UploadType, label: 'Record Audio', icon: Mic, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  { type: 'video' as UploadType, label: 'YouTube URL', icon: Youtube, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { type: 'webpage' as UploadType, label: 'Import Website', icon: Globe, color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
] as const;

interface Props {
  /** Fired when the dialog closes without producing a document. */
  onDismiss: () => void;
  onUploaded: (documentId?: string) => void;
}

export default function LibraryUploadMenu({ onDismiss, onUploaded }: Props) {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const isDesktop = window.innerWidth >= 1024;
            setPos(
              isDesktop
                ? { top: rect.top, left: rect.right + 6 }
                : { top: rect.bottom + 6, left: Math.max(rect.right - 176, 8) }
            );
            setOpen(v => !v);
          }}
          aria-label="Add note"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          <Plus size={14} />
        </button>

        {open && pos && (
          <div
            className="fixed z-50 rounded-xl shadow-xl py-1 min-w-[176px]"
            style={{ top: pos.top, left: pos.left, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {OPTIONS.map(({ type, label, icon: Icon, color, bg }) => (
              <button
                key={type}
                onClick={() => { setOpen(false); setUploadType(type); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors bg-transparent hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-2)' }}
              >
                <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={11} style={{ color }} />
                </span>
                <span className="text-xs text-[var(--text-1)]">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {uploadType && (
        <UploadDialog
          type={uploadType}
          onClose={() => { setUploadType(null); onDismiss(); }}
          onSuccess={docId => { setUploadType(null); onUploaded(docId); }}
        />
      )}
    </>
  );
}
