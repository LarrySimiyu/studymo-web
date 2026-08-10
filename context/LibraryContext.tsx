'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { documentsApi, notesApi, docTagsApi, Document } from '@/lib/api/documents';
import { foldersApi, Folder } from '@/lib/api/organization';
import { invalidatePrefix } from '@/lib/api';

type Tag = { id: string; name: string; color: string | null };

interface LibraryContextValue {
  documents: Document[];
  folders: Folder[];
  availableTags: Tag[];
  notePreviews: Record<string, string>;
  initialized: boolean;
  refetch: () => Promise<void>;
  bumpDocument: (id: string) => void;
  removeDocument: (id: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function twoSentences(text: string): string {
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const matches = plain.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.slice(0, 2).join(' ').trim() : plain.slice(0, 120);
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [notePreviews, setNotePreviews] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      invalidatePrefix('/documents');
      invalidatePrefix('/notes');
      invalidatePrefix('/tags');
      const [docsRes, foldersRes, tagsRes, notesRes] = await Promise.all([
        documentsApi.getAll(),
        foldersApi.getAll(),
        docTagsApi.getAll(),
        notesApi.getAll(),
      ]);
      if (docsRes.data) setDocuments(docsRes.data);
      if (foldersRes.data) setFolders(foldersRes.data);
      if (tagsRes.data) setAvailableTags(tagsRes.data);
      if (notesRes.data) {
        const map: Record<string, string> = {};
        for (const n of notesRes.data) {
          if (n.summary) map[n.document.id] = twoSentences(n.summary);
        }
        setNotePreviews(map);
      }
      setInitialized(true);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const bumpDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const idx = prev.findIndex(d => d.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const [doc] = next.splice(idx, 1);
      return [{ ...doc, updatedAt: new Date().toISOString() }, ...next];
    });
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  useEffect(() => {
    const handleRefetch = () => { refetch(); };
    const handleDocTouched = (e: Event) => {
      const { documentId } = (e as CustomEvent<{ documentId: string }>).detail;
      bumpDocument(documentId);
    };
    window.addEventListener('library:refetch', handleRefetch);
    window.addEventListener('library:doc-touched', handleDocTouched);
    return () => {
      window.removeEventListener('library:refetch', handleRefetch);
      window.removeEventListener('library:doc-touched', handleDocTouched);
    };
  }, [refetch, bumpDocument]);

  return (
    <LibraryContext.Provider value={{
      documents, folders, availableTags, notePreviews,
      initialized, refetch, bumpDocument, removeDocument,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
