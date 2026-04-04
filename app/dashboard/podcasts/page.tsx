'use client';

import { useEffect, useRef, useState } from 'react';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import Link from 'next/link';
import { Mic, Clock, Star, Play } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/dashboard/PageHeader';

const PALETTE: [string, string][] = [
  ['#FF6500', 'rgba(255,101,0,0.12)'],
  ['#22C55E', 'rgba(34,197,94,0.12)'],
  ['#3B82F6', 'rgba(59,130,246,0.12)'],
  ['#F59E0B', 'rgba(245,158,11,0.12)'],
  ['#EC4899', 'rgba(236,72,153,0.12)'],
  ['#8B5CF6', 'rgba(139,92,246,0.12)'],
  ['#14B8A6', 'rgba(20,184,166,0.12)'],
];

function getPalette(id: string): [string, string] {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'generating') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
      Generating
    </span>
  );
  if (status === 'failed') return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>
      Failed
    </span>
  );
  return null;
}

function ThreeDotsMenu({ audioUrl, title, onDelete }: { audioUrl?: string; title: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="absolute top-3 right-3" ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--text-3)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-[9999] rounded-xl shadow-xl py-1 min-w-[130px]"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {audioUrl && (
            <a
              href={audioUrl}
              download={`${title}.mp3`}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-1)] transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => setOpen(false)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download
            </a>
          )}
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
            style={{ backgroundColor: 'transparent', color: '#f87171' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

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
    setPodcasts(prev => prev.filter(p => p.id !== id));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <PageHeader
        title="Podcasts"
        action={{ label: 'New Podcast', href: '/dashboard/library' }}
      />

      {podcasts.length === 0 ? (
        <div className="flex items-center gap-6 p-8 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
            <Mic size={40} style={{ color: '#FF6500' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-1)]">No Podcasts</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Turn your notes into audio lectures you can listen to anywhere.</p>
            <Link
              href="/dashboard/library"
              className="mt-4 inline-block px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
            >
              Go to Notes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {podcasts.map(podcast => {
            const [iconColor, iconBg] = getPalette(podcast.id);
            return (
              <div
                key={podcast.id}
                className="relative rounded-xl p-3 transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
              >
                <ThreeDotsMenu
                  audioUrl={podcast.audioUrl ?? undefined}
                  title={podcast.title}
                  onDelete={() => handleDelete(podcast.id)}
                />

                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group/icon"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Mic size={18} className="group-hover/icon:hidden" style={{ color: iconColor }} />
                    <Play size={15} className="hidden group-hover/icon:block" fill={iconColor} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-[var(--text-1)] font-semibold text-sm truncate">{podcast.title}</p>
                      <StatusBadge status={podcast.status} />
                    </div>
                    {podcast.document && (
                      <span
                        className="inline-block text-xs px-2 py-0.5 rounded-full truncate max-w-[200px]"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
                      >
                        {podcast.document.title}
                      </span>
                    )}
                    <div className="flex items-center gap-3 text-xs mt-1.5" style={{ color: 'var(--text-3)' }}>
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
                  <div className="flex items-center gap-2 text-xs mt-4 py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B] shrink-0" />
                    Generating audio… this takes a minute
                  </div>
                )}
                {podcast.status === 'failed' && (
                  <p className="text-xs mt-4 py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>
                    Generation failed. Open the note in your library to try again.
                  </p>
                )}
                {podcast.status === 'complete' && podcast.audioUrl && (
                  <div className="mt-4">
                    <PodcastPlayer audioUrl={podcast.audioUrl} title={podcast.title} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
