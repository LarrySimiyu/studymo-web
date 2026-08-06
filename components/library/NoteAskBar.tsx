'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TutorInput from '@/components/tutor/TutorInput';

interface Props {
  embedded?: boolean;
  hasSession: boolean;
  onSend: (text: string, revealAnswer: boolean) => void;
  onOpenPanel: () => void;
}

export default function NoteAskBar({ embedded, hasSession, onSend, onOpenPanel }: Props) {
  const [input, setInput] = useState('');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setRevealAnswer(false);
    onSend(text, revealAnswer);
  }

  return (
    <motion.div
      className="sticky bottom-4 z-10 pointer-events-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`pointer-events-auto ${embedded ? 'px-2' : 'max-w-2xl mx-auto px-4'}`}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <TutorInput
                value={input}
                onChange={setInput}
                onSend={send}
                placeholder="Ask AI Tutor anything about this note…"
                autoFocus={autoFocus}
                revealAnswer={revealAnswer}
                onToggleReveal={() => setRevealAnswer(v => !v)}
                onDismiss={() => setCollapsed(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pill"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex justify-end"
            >
              <button
                onClick={() => {
                  if (hasSession) { onOpenPanel(); return; }
                  setAutoFocus(true);
                  setCollapsed(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', border: '1px solid var(--border-md)', color: 'var(--brand)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {hasSession ? 'Open chat' : 'Ask tutor'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
