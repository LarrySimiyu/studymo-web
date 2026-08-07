'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { documentsApi, quizzesApi, flashcardsApi } from '@/lib/api/documents';
import { podcastsApi } from '@/lib/api/podcasts';
import { foldersApi, practiceExamsApi, Folder } from '@/lib/api/organization';
import { invalidatePrefix } from '@/lib/api';
import { onContentChanged } from '@/lib/contentEvents';

export interface SidebarCounts {
  notes: number;
  flashcardDecks: number;
  quizDecks: number;
  exams: number;
  podcasts: number;
}

const COUNT_PREFIXES = ['/documents', '/folders', '/flashcards', '/quizzes', '/podcasts', '/practice-exams'];
const REFRESH_DEBOUNCE_MS = 300;

export function useSidebarCounts() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [counts, setCounts] = useState<Partial<SidebarCounts>>({});
  const inFlight = useRef(false);
  const queued = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) { queued.current = true; return; }
    inFlight.current = true;
    try {
      do {
        queued.current = false;
        const [foldersRes, docsRes, podcastsRes, examsRes, quizzesRes, decksRes] = await Promise.all([
          foldersApi.getAll(),
          documentsApi.getAll(),
          podcastsApi.getAll(),
          practiceExamsApi.getAll(),
          quizzesApi.getAll(),
          flashcardsApi.getDecks(),
        ]);
        if (foldersRes.data) setFolders(foldersRes.data);
        const docs = docsRes.data ?? [];
        // A deck hangs off a document, so one whose document is gone or still
        // processing isn't reachable from the flashcards/quizzes pages either.
        const completeIds = new Set(docs.filter(d => d.status === 'complete').map(d => d.id));
        setCounts({
          notes: docs.length,
          flashcardDecks: (decksRes.data ?? []).filter(d => d.count > 0 && completeIds.has(d.documentId)).length,
          quizDecks: (quizzesRes.data ?? []).filter(q => completeIds.has(q.documentId)).length,
          exams: examsRes.data?.length ?? 0,
          podcasts: podcastsRes.data?.length ?? 0,
        });
      } while (queued.current);
    } finally {
      inFlight.current = false;
    }
  }, []);

  /** Folders alone, for callers that just navigated somewhere folders are shown
   *  and want the tree current without paying for a full recount. */
  const refreshFolders = useCallback(async () => {
    invalidatePrefix('/folders');
    const { data } = await foldersApi.getAll();
    if (data) setFolders(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    // A burst of mutations (bulk delete, upload finishing) is one recount.
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        for (const prefix of COUNT_PREFIXES) invalidatePrefix(prefix);
        load();
      }, REFRESH_DEBOUNCE_MS);
    };
    const stopContent = onContentChanged(refresh);
    window.addEventListener('library:folders-changed', refresh);
    return () => {
      if (timer) clearTimeout(timer);
      stopContent();
      window.removeEventListener('library:folders-changed', refresh);
    };
  }, [load]);

  return { folders, counts, refreshFolders };
}
