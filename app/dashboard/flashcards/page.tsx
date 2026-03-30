'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { documentsApi, flashcardsApi, Document } from '@/lib/api/documents';

interface DeckEntry {
  document: Document;
  count: number;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<DeckEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentsApi.getAll().then(async ({ data: docs }) => {
      if (!docs) { setLoading(false); return; }
      const completed = docs.filter((d) => d.status === 'complete');
      const results = await Promise.all(
        completed.map(async (doc) => {
          const { data } = await flashcardsApi.getByDocument(doc.id);
          return { document: doc, count: data?.length ?? 0 };
        })
      );
      setDecks(results.filter((d) => d.count > 0));
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Flashcards</h1>
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
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">🗂</div>
          <p className="text-gray-400 text-sm">No flashcard decks yet. Upload a document to generate flashcards.</p>
          <Link
            href="/dashboard/library"
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(({ document: doc, count }) => (
            <Link
              key={doc.id}
              href={`/dashboard/library/${doc.id}`}
              className="block p-5 rounded-xl transition-colors hover:border-purple-500/50"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: '#9747FF20' }}
                >
                  🗂
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{count} cards</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
