'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { Podcast } from '@/lib/api/podcasts';
import { podcastsApi } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import GeneratePodcastModal from '@/components/podcast/GeneratePodcastModal';
import { Button } from '@/components/ui/Button';
import { analytics } from '@/lib/analytics';

interface Props {
  documentId: string;
  podcasts: Podcast[];
  setPodcasts: (podcasts: Podcast[]) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}

export default function PodcastTab({ documentId, podcasts, setPodcasts, showModal, setShowModal }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hasGenerating = podcasts.some(p => p.status === 'generating');
    if (hasGenerating) {
      intervalRef.current = setInterval(async () => {
        const { data } = await podcastsApi.getByDocument(documentId);
        if (data) {
          setPodcasts(data);
          if (!data.some(p => p.status === 'generating')) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
          }
        }
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [podcasts.map(p => p.status).join(','), documentId]);

  return (
    <div>
      {podcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(236,72,153,0.12)' }}>
            <Mic size={24} style={{ color: '#EC4899' }} />
          </div>
          <div>
            <p className="text-[var(--text-1)] font-semibold">Generate Podcast</p>
            <p className="text-[var(--text-2)] text-sm mt-1 max-w-xs">Turn your notes into an audio lecture you can listen to anywhere</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            Generate Podcast
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end mb-3">
            <Button variant="primary" size="xs" onClick={() => setShowModal(true)}>
              <Plus size={12} />
              Generate Podcast
            </Button>
          </div>
          {podcasts.map(podcast => {
            const playable = podcast.status === 'complete' && Boolean(podcast.audioUrl);
            const isOpen = playable && openId === podcast.id;
            const hasBody = isOpen || podcast.status === 'generating' || podcast.status === 'failed';
            return (
              <div
                key={podcast.id}
                className="relative rounded-xl p-3 transition-colors"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <div
                  className={`group/row flex items-start gap-3 ${hasBody ? 'mb-2' : ''} ${playable ? 'cursor-pointer' : ''}`}
                  onClick={playable ? () => setOpenId(isOpen ? null : podcast.id) : undefined}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                    {isOpen ? (
                      <Pause size={13} fill="var(--brand)" style={{ color: 'var(--brand)' }} />
                    ) : (
                      <>
                        <Mic size={14} className={playable ? 'group-hover/row:hidden' : ''} style={{ color: 'var(--brand)' }} />
                        {playable && (
                          <Play size={13} className="hidden group-hover/row:block" fill="var(--brand)" style={{ color: 'var(--brand)' }} />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-1)] font-semibold text-sm truncate">{podcast.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {podcast.lengthMins} min · {podcast.voice} · {new Date(podcast.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Delete ${podcast.title}`}
                    onClick={async e => {
                      e.stopPropagation();
                      await podcastsApi.delete(podcast.id);
                      setOpenId(prev => (prev === podcast.id ? null : prev));
                      setPodcasts(podcasts.filter(p => p.id !== podcast.id));
                    }}
                    className="shrink-0 text-[var(--text-3)] hover:text-[var(--danger-ink)]"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
                {podcast.status === 'generating' && (
                  <div className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--warning-ink)' }}>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B]" />
                    Generating audio… this takes a minute
                  </div>
                )}
                {podcast.status === 'failed' && (
                  <p className="text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger-ink)' }}>Generation failed. Please try again.</p>
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
                        onFirstPlay={() => analytics.podcastPlayed(documentId)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <GeneratePodcastModal
        open={showModal}
        documentId={documentId}
        onClose={() => setShowModal(false)}
        onCreated={async () => {
          setShowModal(false);
          const { data } = await podcastsApi.getByDocument(documentId);
          if (data) setPodcasts(data);
        }}
      />
    </div>
  );
}
