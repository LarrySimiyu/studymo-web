'use client';

import { useEffect, useRef, useState } from 'react';
import { PODCAST_VOICES, podcastsApi } from '@/lib/api/podcasts';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  documentId: string;
  onClose: () => void;
  onCreated: () => void;
}

const LENGTHS: { mins: 5 | 10 | 15; label: string; desc: string }[] = [
  { mins: 5,  label: '5 minutes',  desc: '~700 words · Quick overview' },
  { mins: 10, label: '10 minutes', desc: '~1400 words · Balanced deep-dive' },
  { mins: 15, label: '15 minutes', desc: '~2100 words · Comprehensive lecture' },
];

export default function GeneratePodcastModal({ documentId, onClose, onCreated }: Props) {
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
      // Revoke cached object URLs on unmount
      Object.values(previewCache.current).forEach(url => URL.revokeObjectURL(url));
      audioRef.current?.pause();
    };
  }, []);

  async function playPreview(voiceId: string) {
    if (previewLoading) return;

    // If same voice is playing, stop it
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing audio
    audioRef.current?.pause();
    setPlayingVoice(null);

    // Use cached URL if available
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
      const url = podcastsApi.getVoicePreviewUrl(voiceId);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Preview failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      previewCache.current[voiceId] = objectUrl;

      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingVoice(null);
      audio.play();
      setPlayingVoice(voiceId);
    } catch {
      // silently fail preview
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
      onCreated();
    } catch {
      setError('Failed to start generation. Please try again.');
      setGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-1)]">Generate Podcast</h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Step {step} of 2 — {step === 1 ? 'Choose length' : 'Choose voice'}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1 — Length */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {LENGTHS.map(l => (
              <button
                key={l.mins}
                onClick={() => setLengthMins(l.mins)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: lengthMins === l.mins ? 'var(--brand-subtle)' : 'var(--bg-input)',
                  border: `1px solid ${lengthMins === l.mins ? '#9747FF' : 'var(--border)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-1)]">{l.label}</span>
                  {lengthMins === l.mins && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9747FF' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--text-2)] mt-1">{l.desc}</p>
              </button>
            ))}

            <button
              onClick={() => setStep(2)}
              disabled={!lengthMins}
              className="mt-1 w-full py-3 rounded-xl font-medium text-sm transition-opacity"
              style={{
                backgroundColor: '#9747FF',
                color: 'white',
                opacity: lengthMins ? 1 : 0.4,
                cursor: lengthMins ? 'pointer' : 'not-allowed',
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Voice */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {PODCAST_VOICES.map(v => {
                const isPlaying = playingVoice === v.id;
                const isLoadingPreview = previewLoading === v.id;
                const isSelected = voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className="text-left rounded-xl p-3 transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--brand-subtle)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? '#9747FF' : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--text-1)]">{v.name}</span>
                      <button
                        onClick={e => { e.stopPropagation(); playPreview(v.id); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: isPlaying ? '#9747FF' : 'var(--border)' }}
                        title={isPlaying ? 'Stop preview' : 'Play preview'}
                      >
                        {isLoadingPreview ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="2.5" className="animate-spin">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        ) : isPlaying ? (
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="white">
                            <rect x="1" y="1" width="3" height="8" rx="0.5" />
                            <rect x="6" y="1" width="3" height="8" rx="0.5" />
                          </svg>
                        ) : (
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="#9747FF">
                            <path d="M2 1l7 4-7 4V1z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-3)]">{v.description}</p>
                    <span className="text-xs mt-1 inline-block" style={{ color: '#6B7280' }}>{v.gender}</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={generating}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!voice || generating}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-opacity flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#9747FF',
                  color: 'white',
                  opacity: voice && !generating ? 1 : 0.4,
                  cursor: voice && !generating ? 'pointer' : 'not-allowed',
                }}
              >
                {generating ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="animate-spin">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Starting…
                  </>
                ) : 'Generate Podcast'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
