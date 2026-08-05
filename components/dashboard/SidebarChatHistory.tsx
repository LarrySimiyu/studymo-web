'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useTutorSessions } from '@/context/TutorSessionsContext';
import { SectionHeader, sectionMotion } from './SidebarNavPrimitives';
import ChatHistoryRow from './ChatHistoryRow';

const RECENT_LIMIT = 10;

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function SidebarChatHistory({ open, onToggle }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessions, loading } = useTutorSessions();

  const activeId = searchParams.get('session');
  const recent = sessions.slice(0, RECENT_LIMIT);

  function selectSession(id: string) {
    router.push(`/dashboard/tutor?session=${id}`);
  }

  function handleDeleted(id: string) {
    if (activeId === id) router.push('/dashboard/tutor');
  }

  return (
    <>
      <SectionHeader label="Recents" icon={MessageSquare} open={open} onToggle={onToggle} />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="chats-section" {...sectionMotion} className="overflow-hidden">
            <div className="ml-4 space-y-0.5">
              {loading && sessions.length === 0 ? (
                <p className="px-2 py-1 text-xs text-[var(--text-3)]">Loading…</p>
              ) : recent.length === 0 ? (
                <p className="px-2 py-1 text-xs text-[var(--text-3)]">No chats yet</p>
              ) : (
                recent.map(s => (
                  <ChatHistoryRow
                    key={s.id}
                    session={s}
                    active={activeId === s.id}
                    onSelect={selectSession}
                    onDeleted={handleDeleted}
                  />
                ))
              )}

              {sessions.length > 0 && (
                <Link
                  href="/dashboard/tutor/history"
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
                >
                  <span>View all chats</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
