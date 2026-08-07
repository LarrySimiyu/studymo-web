'use client';

import { useEffect, useRef, useState } from 'react';
import { PODCAST_VOICES, podcastsApi } from '@/lib/api/podcasts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { analytics } from '@/lib/analytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  documentId: string;
  onClose: () => void;
  onCreated: () => void;
}

const LENGTHS: { mins: 5 | 10 | 15; label: string; desc: string }[] = [
  { mins: 5,  label: '5 minutes',  desc: 'Quick overview' },
  { mins: 10, label: '10 minutes', desc: 'Balanced deep-dive' },
  { mins: 15, label: '15 minutes', desc: 'Comprehensive lecture' },
];

export default function GeneratePodcastModal({ open, documentId, onClose, onCreated }: Props) {
  const { currentUser: user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [lengthMins, setLengthMins] = useState<5 | 10 | 15 | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewCache = useRef<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previewCache.current).forEach(url => URL.revokeObjectURL(url));
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (open) return;
    audioRef.current?.pause();
    setStep(1);
    setLengthMins(null);
    setVoice(null);
    setPlayingVoice(null);
    setError(null);
  }, [open]);

  async function playPreview(voiceId: string) {
    if (previewLoading) return;
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }
    audioRef.current?.pause();
    setPlayingVoice(null);
    if (previewCache.current[voiceId]) {
      const audio = new Audio(previewCache.current[voiceId]);
      audioRef.current = audio;
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      setPlayingVoice(voiceId);
      return;
    }
    setPreviewLoading(voiceId);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(podcastsApi.getVoicePreviewUrl(voiceId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Preview failed');
      const objectUrl = URL.createObjectURL(await res.blob());
      previewCache.current[voiceId] = objectUrl;
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      setPlayingVoice(voiceId);
    } catch {
      // silently fail
    } finally {
      setPreviewLoading(null);
    }
  }

  async function handleGenerate() {
    if (!lengthMins || !voice) return;
    setGenerating(true);
    setError(null);
    try {
      const { error: err } = await podcastsApi.create({ documentId, lengthMins, voice });
      if (err) { setError(err); setGenerating(false); return; }
      analytics.podcastGenerated(documentId, lengthMins, voice);
      onCreated();
    } catch {
      setError('Failed to start generation. Please try again.');
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o && !generating) onClose(); }}>
      <DialogContent size="lg" showClose className="flex flex-col gap-5">
        <DialogHeader className="mb-0 gap-0.5">
          <DialogTitle>Generate Podcast</DialogTitle>
          <DialogDescription className="text-xs">
            Step {step} of 2 — {step === 1 ? 'Choose length' : 'Choose voice'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 — Length */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {LENGTHS.map(l => (
              <button
                key={l.mins}
                onClick={() => setLengthMins(l.mins)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: lengthMins === l.mins ? 'rgba(255,101,0,0.06)' : 'var(--bg-input)',
                  border: `1.5px solid ${lengthMins === l.mins ? 'rgba(255,101,0,0.5)' : 'var(--border)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--text-1)]">{l.label}</span>
                </div>
                <p className="text-xs text-white mt-1">{l.desc}</p>
              </button>
            ))}

            <Button
              variant="brand"
              size="default"
              className="mt-1 w-full"
              onClick={() => setStep(2)}
              disabled={!lengthMins}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 — Voice */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5">
              {PODCAST_VOICES.map(v => {
                const isPlaying = playingVoice === v.id;
                const isLoadingPreview = previewLoading === v.id;
                const isSelected = voice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className="w-full text-left rounded-xl p-4 transition-all flex items-center gap-4 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,101,0,0.06)' : 'var(--bg-input)',
                      border: `1.5px solid ${isSelected ? 'rgba(255,101,0,0.5)' : 'var(--border)'}`,
                    }}
                  >
                    {/* Play button */}
                    <button
                      onClick={e => { e.stopPropagation(); playPreview(v.id); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
                      style={{ backgroundColor: isPlaying ? '#FF6500' : 'var(--border)' }}
                      title={isPlaying ? 'Stop preview' : 'Play preview'}
                    >
                      {isLoadingPreview ? (
                        <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#FF6500' }} />
                      ) : isPlaying ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                          <rect x="1" y="1" width="3" height="8" rx="0.5" />
                          <rect x="6" y="1" width="3" height="8" rx="0.5" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                          <path d="M2 1l7 4-7 4V1z" />
                        </svg>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-sm text-[var(--text-1)]">{v.name}</span>
                      <p className="text-xs text-white">{v.description}</p>
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{v.gender}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="default"
                className="flex-1"
                onClick={() => setStep(1)}
                disabled={generating}
              >
                Back
              </Button>
              <Button
                variant="brand"
                size="default"
                className="flex-1"
                onClick={handleGenerate}
                disabled={!voice || generating}
              >
                {generating ? 'Starting...' : 'Generate Podcast'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
