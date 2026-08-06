'use client';

import { RefObject } from 'react';
import UserBubble from '@/components/tutor/UserBubble';
import AssistantMessage from '@/components/tutor/AssistantMessage';
import type { UIMessage } from '@/hooks/useTutorChat';

interface Props {
  messages: UIMessage[];
  isStreaming: boolean;
  bottomRef: RefObject<HTMLDivElement>;
}

export default function TutorMessages({ messages, isStreaming, bottomRef }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,101,0,0.15), rgba(255,154,60,0.15))' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-1)]">Add your notes and I&apos;ll help you study</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Ask me anything or attach a note from Sources</p>
          </div>
        </div>
      )}

      {messages.map(msg => {
        if (msg.role === 'system') {
          return (
            <div key={msg.id} className="flex justify-center">
              <p className="text-xs text-[var(--text-2)] italic px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-card)' }}>
                {msg.content}
              </p>
            </div>
          );
        }
        if (msg.role === 'user') {
          return <UserBubble key={msg.id} content={msg.content} />;
        }
        return (
          <AssistantMessage
            key={msg.id}
            content={msg.content}
            isStreaming={'isStreaming' in msg && msg.isStreaming}
          />
        );
      })}

      {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map(delay => (
            <div key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand)', animationDelay: `${delay}ms` }} />
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
