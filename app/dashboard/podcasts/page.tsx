'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import { Mic, Clock, Star, Pause, Play, Download, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
import RowActionsMenu, { RowAction } from '@/components/ui/RowActionsMenu';
import { getPalette } from '@/components/dashboard/PlanCard';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'generating') return (
    <span className="flex items-center gap-1 rounded-full bg-[var(--warning-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--warning-ink)]">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--warning)]" />
      Generating
    </span>
  );
  if (status === 'failed') return (
    <span className="rounded-full bg-[var(--danger-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--danger-ink)]">
      Failed
    </span>
  );
  return null;
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const { data } = await podcastsApi.getAll();
    if (data) setPodcasts(data);
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    const hasGenerating = podcasts.some(p => p.status === 'generating');
    if (!hasGenerating) return;
    const interval = setInterval(async () => {
      const { data } = await podcastsApi.getAll();
      if (data) setPodcasts(data);
    }, 4000);
    return () => clearInterval(interval);
  }, [podcasts]);

  async function handleDelete(id: string) {
    await podcastsApi.delete(id);
    setOpenId(prev => (prev === id ? null : prev));
    setPodcasts(prev => prev.filter(p => p.id !== id));
  }

  if (loading) {
    return (
      <PageShell width="xl">
        <LoadingSpinner size="lg" />
      </PageShell>
    );
  }

  return (
    <PageShell
      width="xl"
      header={<PageHeader title="Podcasts" action={{ label: 'New Podcast', href: '/dashboard/library' }} />}
    >

      {podcasts.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No Podcasts"
          description="Turn your notes into audio lectures you can listen to anywhere."
          action={{ label: 'Go to Notes', href: '/dashboard/library' }}
        />
      ) : (
        <div className="space-y-2">
          {podcasts.map(podcast => {
            const [iconColor, iconBg] = getPalette(podcast.id);
            const playable = podcast.status === 'complete' && Boolean(podcast.audioUrl);
            const isOpen = playable && openId === podcast.id;
            const hasBody = isOpen || podcast.status === 'generating' || podcast.status === 'failed';
            const toggle = () => setOpenId(isOpen ? null : podcast.id);
            const actions: RowAction[] = [
              ...(podcast.audioUrl
                ? [{ label: 'Download', icon: Download, href: podcast.audioUrl, download: `${podcast.title}.mp3` }]
                : []),
              { label: 'Delete', icon: Trash2, danger: true, onSelect: () => handleDelete(podcast.id) },
            ];

            return (
              <div
                key={podcast.id}
                className="relative rounded-xl bg-[var(--bg-card)] p-3 transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="absolute right-3 top-3">
                  <RowActionsMenu actions={actions} />
                </div>

                <div
                  className={`group/row flex items-start gap-3 ${hasBody ? 'mb-3' : ''} ${playable ? 'cursor-pointer' : ''}`}
                  onClick={playable ? toggle : undefined}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    {isOpen ? (
                      <Pause size={15} fill={iconColor} style={{ color: iconColor }} />
                    ) : (
                      <>
                        <Mic
                          size={18}
                          className={playable ? 'group-hover/row:hidden' : ''}
                          style={{ color: iconColor }}
                        />
                        {playable && (
                          <Play
                            size={15}
                            className="hidden group-hover/row:block"
                            fill={iconColor}
                            style={{ color: iconColor }}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="truncate text-body-sm font-semibold text-[var(--text-1)]">{podcast.title}</p>
                      <StatusBadge status={podcast.status} />
                    </div>
                    {podcast.document && (
                      <span className="inline-block max-w-[200px] truncate rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-xs text-[var(--text-2)]">
                        {podcast.document.title}
                      </span>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--text-3)]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {podcast.lengthMins} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={10} />
                        {podcast.voice}
                      </span>
                      <span>{formatDate(podcast.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {podcast.status === 'generating' && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--warning-subtle)] px-3 py-2 text-xs text-[var(--warning-ink)]">
                    <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-b-2 border-current" />
                    Generating audio… this takes a minute
                  </div>
                )}
                {podcast.status === 'failed' && (
                  <p className="mt-4 rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger-ink)]">
                    Generation failed. Open the note in your library to try again.
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {isOpen && podcast.audioUrl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                      onClick={e => e.stopPropagation()}
                    >
                      <PodcastPlayer
                        podcastId={podcast.id}
                        audioUrl={podcast.audioUrl}
                        durationSecs={podcast.durationSecs}
                        autoPlay
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
