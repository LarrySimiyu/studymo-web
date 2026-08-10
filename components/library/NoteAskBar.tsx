'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TutorInput from '@/components/tutor/TutorInput';

interface Props {
  embedded?: boolean;
  /** True once a tutor conversation exists for this note — surfaces the "Open chat" pill. */
  hasSession: boolean;
  onSend: (text: string, revealAnswer: boolean) => void;
  onOpenPanel: () => void;
}

export default function NoteAskBar({ embedded, hasSession, onSend, onOpenPanel }: Props) {
  const [input, setInput] = useState('');
  const [revealAnswer, setRevealAnswer] = useState(false);

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
        <TutorInput
          value={input}
          onChange={setInput}
          onSend={send}
          placeholder="Write a message…"
          revealAnswer={revealAnswer}
          onToggleReveal={() => setRevealAnswer(v => !v)}
          onOpenChat={hasSession ? onOpenPanel : undefined}
        />
      </div>
    </motion.div>
  );
}
