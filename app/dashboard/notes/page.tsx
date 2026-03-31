'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notesApi } from '@/lib/api/documents';

interface NoteSummary {
  id: string;
  summary: string | null;
  document: { id: string; title: string };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesApi.getAll().then(({ data }) => {
      if (data) setNotes(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-1)]">Notes</h1>
        <Link
          href="/dashboard/library"
          className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#9747FF', color: '#fff' }}
        >
          + Upload Document
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#9747FF' }} />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-[var(--text-2)] text-sm">No notes yet. Upload a document to generate notes.</p>
          <Link
            href="/dashboard/library"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/library/${note.document.id}`}
              className="block p-4 rounded-xl transition-colors hover:border-purple-500/50"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-medium text-sm truncate">{note.document.title}</p>
                  {note.summary && (
                    <p className="text-[var(--text-2)] text-xs mt-1 line-clamp-2">{note.summary}</p>
                  )}
                </div>
                <span className="text-xs text-[var(--text-3)] shrink-0">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
