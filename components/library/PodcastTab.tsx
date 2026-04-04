'use client';

import { Mic } from 'lucide-react';
import { Podcast } from '@/lib/api/podcasts';
import { podcastsApi } from '@/lib/api/podcasts';
import PodcastPlayer from '@/components/podcast/PodcastPlayer';
import GeneratePodcastModal from '@/components/podcast/GeneratePodcastModal';
import { Button } from '@/components/ui/Button';

interface Props {
  documentId: string;
  podcasts: Podcast[];
  setPodcasts: (podcasts: Podcast[]) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
}

export default function PodcastTab({ documentId, podcasts, setPodcasts, showModal, setShowModal }: Props) {
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
          <Button variant="brand" size="sm" onClick={() => setShowModal(true)}>
            Generate Podcast
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
            >
              + Generate Podcast
            </button>
          </div>
          {podcasts.map(podcast => (
            <div
              key={podcast.id}
              className="relative rounded-xl p-3 transition-colors"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6500" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-1)] font-semibold text-sm truncate">{podcast.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {podcast.lengthMins} min · {podcast.voice} · {new Date(podcast.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={async () => { await podcastsApi.delete(podcast.id); setPodcasts(podcasts.filter(p => p.id !== podcast.id)); }}
                  className="text-[var(--text-3)] hover:text-red-400 transition-colors shrink-0 p-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                </button>
              </div>
              {podcast.status === 'generating' && (
                <div className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B]" />
                  Generating audio… this takes a minute
                </div>
              )}
              {podcast.status === 'failed' && (
                <p className="text-xs py-1.5 px-2 rounded-lg" style={{ backgroundColor: 'var(--danger-subtle)', color: '#EF4444' }}>Generation failed. Please try again.</p>
              )}
              {podcast.status === 'complete' && podcast.audioUrl && (
                <PodcastPlayer audioUrl={podcast.audioUrl} title={podcast.title} />
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <GeneratePodcastModal
          documentId={documentId}
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            const { data } = await podcastsApi.getByDocument(documentId);
            if (data) setPodcasts(data);
          }}
        />
      )}
    </div>
  );
}
