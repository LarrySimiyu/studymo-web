'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStudyTimer } from '@/context/StudyTimerContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: Record<string, unknown> | null;
  isStreaming?: boolean;
}

interface AssistantContextValue {
  isOpen: boolean;
  isTutoringMode: boolean;
  sessionId: string | null;
  messages: AssistantMessage[];
  isLoading: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleOpen: () => void;
  toggleTutoringMode: () => void;
  sendMessage: (text: string) => Promise<void>;
  handleAction: (action: Record<string, unknown>) => void;
  clearSession: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTutoringMode, setIsTutoringMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  const { startSession } = useStudyTimer();
  const msgIdRef = useRef(0);

  function nextId() {
    msgIdRef.current += 1;
    return String(msgIdRef.current);
  }

  const openAssistant = useCallback(() => setIsOpen(true), []);
  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleOpen = useCallback(() => setIsOpen(v => !v), []);
  const toggleTutoringMode = useCallback(() => setIsTutoringMode(v => !v), []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
  }, []);

  const handleAction = useCallback((action: Record<string, unknown>) => {
    switch (action.type) {
      case 'navigate':
        router.push(action.path as string);
        break;
      case 'generate_quiz':
        router.push(`/dashboard/library/${action.documentId}?tab=quiz`);
        break;
      case 'generate_exam':
        router.push('/dashboard/practice-exams');
        break;
      case 'create_study_plan':
        router.push('/dashboard/study-plan');
        break;
      case 'open_timer':
        startSession('pomodoro', []).catch(() => {});
        break;
      default:
        break;
    }
  }, [router, startSession]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !currentUser) return;

    const userMsg: AssistantMessage = { id: nextId(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsgId = nextId();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, sessionId, isTutoringMode }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to connect to assistant');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalAction: Record<string, unknown> | null = null;
      let finalSessionId = sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.delta) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + parsed.delta }
                    : m
                )
              );
            } else if (parsed.done) {
              finalAction = parsed.action ?? null;
              finalSessionId = parsed.sessionId ?? sessionId;
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }

      // Finalize message
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false, action: finalAction }
            : m
        )
      );

      if (finalSessionId) setSessionId(finalSessionId);

      // Auto-execute action
      if (finalAction) {
        setTimeout(() => handleAction(finalAction as Record<string, unknown>), 500);
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentUser, sessionId, isTutoringMode, handleAction]);

  return (
    <AssistantContext.Provider value={{
      isOpen,
      isTutoringMode,
      sessionId,
      messages,
      isLoading,
      openAssistant,
      closeAssistant,
      toggleOpen,
      toggleTutoringMode,
      sendMessage,
      handleAction,
      clearSession,
    }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}
