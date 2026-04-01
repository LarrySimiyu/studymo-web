'use client';

import { useEffect, useRef, useState } from 'react';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import Link from 'next/link';

type StatusFilter = 'all' | 'complete' | 'generating' | 'failed';
type LengthFilter = 'all' | 5 | 10 | 15;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'complete', label: 'Ready' },
  { value: 'generating', label: 'Generating' },
  { value: 'failed', label: 'Failed' },
];

const LENGTH_OPTIONS: { value: LengthFilter; label: string }[] = [
  { value: 'all', label: 'All lengths' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
];

function AnimatedTabs<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [, forceUpdate] = useState(0);
  const activeIndex = options.findIndex(o => o.value === value);

  useEffect(() => { forceUpdate(n => n + 1); }, []);

  return (
    <div className="relative flex">
      {options.map((opt, i) => (
        <button
          key={String(opt.value)}
          ref={el => { tabRefs.current[i] = el; }}
          onClick={() => onChange(opt.value)}
          className="px-3 py-2 text-xs transition-colors"
          style={{
            color: value === opt.value ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: value === opt.value ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
      <span
        className="absolute bottom-0 h-0.5 rounded-full"
        style={{
          backgroundColor: 'var(--text-1)',
          left: tabRefs.current[activeIndex]?.offsetLeft ?? 0,
          width: tabRefs.current[activeIndex]?.offsetWidth ?? 0,
          transition: 'left 0.2s ease, width 0.2s ease',
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'generating') return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
      Generating
    </span>
  );
  if (status === 'failed') return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444', border: '1px solid var(--danger-border)' }}>
      Failed
    </span>
  );
  return null;
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>('all');

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

  const filtered = podcasts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (lengthFilter !== 'all' && p.lengthMins !== lengthFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#9747FF' }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-sm text-[var(--text-1)]">Podcasts</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
            {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Link
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #9747FF 0%, #6366f1 100%)' }}
        >
          Generate Podcast
        </Link>
      </div>

      {/* Filters */}
      {podcasts.length > 0 && (
        <div className="flex flex-wrap items-start gap-6 mb-6">
          <AnimatedTabs options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          <AnimatedTabs options={LENGTH_OPTIONS} value={lengthFilter} onChange={v => setLengthFilter(v as LengthFilter)} />
        </div>
      )}

      {/* Empty state */}
      {podcasts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎙️</div>
          <h2 className="text-body-lg font-semibold text-[var(--text-1)] mb-2">No podcasts yet</h2>
          <p className="text-body-sm mb-6" style={{ color: 'var(--text-2)' }}>
            Open any note in your library and click the Podcast tab to generate an audio lecture.
          </p>
          <Link
            href="/dashboard/library"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #9747FF 0%, #6366f1 100%)' }}
          >
            Go to Library
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-center py-10" style={{ color: 'var(--text-2)' }}>No podcasts match your filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(podcast => (
            <div
              key={podcast.id}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-body-sm font-semibold text-[var(--text-1)] truncate">{podcast.title}</p>
                    <StatusBadge status={podcast.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {podcast.document && (
                      <Link
                        href={`/dashboard/library/${podcast.documentId}`}
                        className="text-xs transition-colors hover:opacity-80 truncate max-w-[180px]"
                        style={{ color: '#9747FF' }}
                      >
                        {podcast.document.title}
                      </Link>
                    )}
                    {podcast.document && <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>}
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {podcast.lengthMins} min · {podcast.voice} · {new Date(podcast.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(podcast.id)}
                  className="text-[var(--text-3)] hover:text-red-400 transition-colors shrink-0 mt-0.5"
                  title="Delete podcast"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>

              {/* Status body */}
              {podcast.status === 'generating' && (
                <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B] shrink-0" />
                  Generating audio… this takes a minute
                </div>
              )}
              {podcast.status === 'failed' && (
                <p className="text-xs py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>
                  Generation failed. Open the note in your library to try again.
                </p>
              )}
              {podcast.status === 'complete' && podcast.audioUrl && (
                <PodcastPlayer audioUrl={podcast.audioUrl} title={podcast.title} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
