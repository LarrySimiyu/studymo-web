'use client';

import type { NoteOffer } from '@/lib/api/tutor';

interface Props {
  offerSaved: boolean;
  resolvedTopics: string[];
  onClearResolved: () => void;
  noteOffer: NoteOffer | null;
  offerSaving: boolean;
  onAcceptOffer: () => void;
  onDismissOffer: () => void;
}

export default function TutorBanners({
  offerSaved, resolvedTopics, onClearResolved,
  noteOffer, offerSaving, onAcceptOffer, onDismissOffer,
}: Props) {
  return (
    <>
      {offerSaved && (
        <div className="mb-2 px-3 py-2 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          Added to notes successfully.
        </div>
      )}

      {resolvedTopics.length > 0 && (
        <div className="mb-2 px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{ color: '#22C55E' }}>
              {resolvedTopics.length === 1
                ? `"${resolvedTopics[0]}" marked as understood`
                : `${resolvedTopics.length} weak topics marked as understood`}
            </span>
          </div>
          <button onClick={onClearResolved} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: '#22C55E' }}>×</button>
        </div>
      )}

      {noteOffer && (
        <div className="mb-2 px-3 py-2.5 rounded-xl text-sm flex items-start gap-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--brand-border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-1)] mb-0.5">
              Save &ldquo;{noteOffer.heading}&rdquo; to <span style={{ color: 'var(--brand)' }}>{noteOffer.noteTitle}</span>?
            </p>
            <p className="text-xs text-[var(--text-3)] truncate">{noteOffer.content.slice(0, 80)}{noteOffer.content.length > 80 ? '…' : ''}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onAcceptOffer}
              disabled={offerSaving}
              className="text-xs px-2.5 py-1 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {offerSaving ? 'Saving…' : 'Add to notes'}
            </button>
            <button
              onClick={onDismissOffer}
              className="text-xs px-2 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-3)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
