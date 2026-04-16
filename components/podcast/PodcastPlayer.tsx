'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  audioUrl: string;
  title: string;
  onFirstPlay?: () => void;
}

function fmtTime(secs: number): string {
  if (!isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function PodcastPlayer({ audioUrl, onFirstPlay }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasPlayedRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else {
      audio.play(); setPlaying(true);
      if (!hasPlayedRef.current) { hasPlayedRef.current = true; onFirstPlay?.(); }
    }
  }

  function skip(secs: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + secs, 0), duration);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  function handleSpeedChange(s: number) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Row 1: seek bar + times */}
      <div>
        <div
          className="w-full rounded-full cursor-pointer mb-1"
          style={{ backgroundColor: 'var(--bg-input)', height: 4 }}
          onClick={handleSeek}
        >
          <div className="rounded-full h-full" style={{ width: `${progress}%`, backgroundColor: '#FF6500' }} />
        </div>
        <div className="flex justify-between">
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>{fmtTime(currentTime)}</span>
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Row 2: controls + speed */}
      <div className="flex items-center justify-between">

        {/* Skip back 15 | Play | Skip forward 15 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => skip(-15)}
            className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.27" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
          >
            {playing ? (
              <svg width="11" height="11" viewBox="0 0 14 14" fill="white">
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 14 14" fill="white">
                <path d="M3 1.5l10 5.5-10 5.5V1.5z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => skip(15)}
            className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-.49-3.27" />
            </svg>
          </button>
        </div>

        {/* Speed buttons */}
        <div className="flex items-center gap-1">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: speed === s ? 'rgba(255,101,0,0.12)' : 'var(--bg-input)',
                color: speed === s ? '#FF6500' : 'var(--text-3)',
              }}
              onMouseEnter={e => { if (speed !== s) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (speed !== s) e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
