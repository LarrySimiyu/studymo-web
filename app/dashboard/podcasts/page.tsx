'use client';

import { useEffect, useState } from 'react';
import { podcastsApi, Podcast } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import Link from 'next/link';

type StatusFilter = 'all' | 'complete' | 'generating' | 'failed';

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lengthFilter, setLengthFilter] = useState<number | 'all'>('all');

  async function load() {
    const { data } = await podcastsApi.getAll();
    if (data) setPodcasts(data);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  // Poll while any are generating
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

  const STATUS_LABELS: Record<StatusFilter, string> = {
    all: 'All',
    complete: 'Ready',
    generating: 'Generating',
    failed: 'Failed',
  };

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
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Podcasts</h1>
          <p className="text-[var(--text-2)] text-sm mt-0.5">{podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} generated</p>
        </div>
        <Link
          href="/dashboard/library"
          className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#9747FF' }}
        >
          + Generate New
        </Link>
      </div>

      {/* Filters */}
      {podcasts.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Status filter */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['all', 'complete', 'generating', 'failed'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                style={statusFilter === s ? { backgroundColor: '#9747FF', color: 'white' } : { color: 'var(--text-2)' }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Length filter */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['all', 5, 10, 15] as (number | 'all')[]).map(l => (
              <button
                key={l}
                onClick={() => setLengthFilter(l)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                style={lengthFilter === l ? { backgroundColor: '#9747FF', color: 'white' } : { color: 'var(--text-2)' }}
              >
                {l === 'all' ? 'All lengths' : `${l} min`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {podcasts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎙️</div>
          <h2 className="text-[var(--text-1)] font-semibold text-lg mb-2">No podcasts yet</h2>
          <p className="text-[var(--text-2)] text-sm mb-6">
            Open any document in your library and click the Podcast tab to generate an audio lecture.
          </p>
          <Link
            href="/dashboard/library"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            Go to Library
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[var(--text-2)] text-center py-10">No podcasts match your filters.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(podcast => (
            <div key={podcast.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-medium text-sm truncate">{podcast.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {podcast.document && (
                      <Link
                        href={`/dashboard/library/${podcast.documentId}`}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors truncate max-w-[200px]"
                      >
                        {podcast.document.title}
                      </Link>
                    )}
                    <span className="text-xs text-[var(--text-3)]">·</span>
                    <span className="text-xs text-[var(--text-2)]">{podcast.lengthMins} min · {podcast.voice}</span>
                    <span className="text-xs text-[var(--text-3)]">·</span>
                    <span className="text-xs text-[var(--text-2)]">{new Date(podcast.createdAt).toLocaleDateString()}</span>
                    {podcast.status === 'generating' && (
                      <>
                        <span className="text-xs text-[var(--text-3)]">·</span>
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          Generating
                        </span>
                      </>
                    )}
                    {podcast.status === 'failed' && (
                      <>
                        <span className="text-xs text-[var(--text-3)]">·</span>
                        <span className="text-xs text-red-400">Failed</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(podcast.id)}
                  className="ml-3 text-[var(--text-3)] hover:text-red-400 transition-colors shrink-0"
                  title="Delete podcast"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>

              {podcast.status === 'generating' && (
                <div className="flex items-center gap-2 text-sm text-yellow-400 py-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400" />
                  Generating audio… this takes a minute
                </div>
              )}
              {podcast.status === 'failed' && (
                <p className="text-sm text-red-400 py-1">Generation failed. Please generate a new podcast from the library.</p>
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
