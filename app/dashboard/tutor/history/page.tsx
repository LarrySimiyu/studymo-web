'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Input } from '@/components/ui/Input';
import ChatHistoryRow from '@/components/dashboard/ChatHistoryRow';
import { useTutorSessions } from '@/context/TutorSessionsContext';

export default function ChatHistoryPage() {
  const router = useRouter();
  const { sessions, loading, creating, createSession } = useTutorSessions();
  const [search, setSearch] = useState('');

  const filtered = search
    ? sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : sessions;

  async function handleNewChat() {
    const id = await createSession();
    if (id) router.push(`/dashboard/tutor/${id}`);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-3xl mx-auto">
      <PageHeader
        title="All chats"
        subtitle={`${sessions.length} chat${sessions.length !== 1 ? 's' : ''} with your AI tutor`}
        action={{ label: creating ? 'Starting…' : 'New Chat', onClick: handleNewChat }}
      />

      <div className="mb-4">
        <Input
          variant="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chats…"
        />
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-body-sm text-[var(--text-3)] text-center py-12">
          {search ? 'No chats match that search.' : 'No chats yet — start one to begin.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <ChatHistoryRow
              key={s.id}
              session={s}
              active={false}
              variant="full"
              onSelect={id => router.push(`/dashboard/tutor/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
