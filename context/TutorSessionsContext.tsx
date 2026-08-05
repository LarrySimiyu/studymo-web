'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { tutorApi, TutorSessionSummary } from '@/lib/api/tutor';
import { invalidatePrefix } from '@/lib/api';

interface TutorSessionsContextValue {
  sessions: TutorSessionSummary[];
  loading: boolean;
  creating: boolean;
  refetch: () => Promise<void>;
  createSession: () => Promise<string | null>;
  renameSession: (id: string, title: string) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  touchSession: (id: string, lastMessage: string) => void;
}

const TutorSessionsContext = createContext<TutorSessionsContextValue | null>(null);

function sortByRecent(list: TutorSessionSummary[]): TutorSessionSummary[] {
  return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function TutorSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TutorSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      invalidatePrefix('/tutor');
      const { data } = await tutorApi.getSessions();
      if (data) setSessions(sortByRecent(data));
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async () => {
    if (creating) return null;
    setCreating(true);
    try {
      const { data } = await tutorApi.createSession({ mode: 'casual' });
      if (!data) return null;
      setSessions(prev => [{
        id: data.id,
        title: data.title,
        mode: data.mode,
        noteIds: data.noteIds,
        messageCount: 0,
        lastMessage: null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }, ...prev]);
      return data.id;
    } finally {
      setCreating(false);
    }
  }, [creating]);

  const renameSession = useCallback(async (id: string, title: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    await tutorApi.updateTitle(id, title);
  }, []);

  const removeSession = useCallback(async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    await tutorApi.deleteSession(id);
  }, []);

  const touchSession = useCallback((id: string, lastMessage: string) => {
    setSessions(prev => sortByRecent(prev.map(s => s.id === id
      ? { ...s, lastMessage: lastMessage.slice(0, 100), messageCount: s.messageCount + 1, updatedAt: new Date().toISOString() }
      : s)));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <TutorSessionsContext.Provider value={{
      sessions, loading, creating,
      refetch, createSession, renameSession, removeSession, touchSession,
    }}>
      {children}
    </TutorSessionsContext.Provider>
  );
}

export function useTutorSessions() {
  const ctx = useContext(TutorSessionsContext);
  if (!ctx) throw new Error('useTutorSessions must be used within TutorSessionsProvider');
  return ctx;
}
