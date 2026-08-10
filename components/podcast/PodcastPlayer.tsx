'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import AudioWaveform from '@/components/ui/AudioWaveform';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { formatClock } from '@/lib/audio/formatClock';
import { pseudoWave } from '@/lib/audio/pseudoWave';
import { cn } from '@/lib/utils';

const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
const SKIP_SECS = 15;

interface Props {
  podcastId: string;
  audioUrl: string;
  durationSecs?: number | null;
  autoPlay?: boolean;
  onFirstPlay?: () => void;
}

export default function PodcastPlayer({
  podcastId,
  audioUrl,
  durationSecs,
  autoPlay,
  onFirstPlay,
}: Props) {
  const player = useAudioPlayer(audioUrl, durationSecs ?? 0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const hasPlayedRef = useRef(false);
  const samples = useMemo(() => pseudoWave(podcastId), [podcastId]);

  function play() {
    player.toggle();
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      onFirstPlay?.();
    }
  }

  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    if (autoPlay) playRef.current();
  }, [autoPlay]);

  function skip(delta: number) {
    if (!player.total) return;
    player.seek(Math.min(1, Math.max(0, (player.currentTime + delta) / player.total)));
  }

  function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (player.audioRef.current) player.audioRef.current.playbackRate = SPEEDS[next];
  }

  const speed = SPEEDS[speedIndex];

  return (
    <div
      className="rounded-xl border border-[var(--border)] p-3 sm:p-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
        <span className="flex items-center gap-2 text-[var(--text-3)]">
          {player.playing && (
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: 'var(--brand)' }}
            />
          )}
          {player.playing ? 'Now playing' : 'Podcast'}
        </span>
        <span className="tabular-nums text-[var(--text-2)]">
          {formatClock(player.currentTime)} / {formatClock(player.total)}
        </span>
      </div>

      <AudioWaveform
        samples={samples}
        mode="playback"
        progress={player.progress}
        onSeek={player.seek}
        height={56}
      />

      <div className="mt-3 grid grid-cols-3 items-center">
        <div />

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => skip(-SKIP_SECS)}
            aria-label="Back 15 seconds"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={play}
            aria-label={player.playing ? 'Pause' : 'Play'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] transition-all hover:bg-[var(--brand-hover)] hover:scale-105 active:scale-95"
          >
            {player.playing ? (
              <Pause size={18} fill="white" className="text-white" />
            ) : (
              <Play size={18} fill="white" className="translate-x-[1px] text-white" />
            )}
          </button>

          <button
            onClick={() => skip(SKIP_SECS)}
            aria-label="Forward 15 seconds"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={cycleSpeed}
            aria-label={`Playback speed ${speed}x`}
            className={cn(
              'h-11 rounded-lg px-3 font-mono text-xs tabular-nums transition-colors sm:h-8',
              speed === 1
                ? 'bg-[var(--bg-input)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                : 'bg-[var(--brand-subtle)] text-[var(--brand-ink)]'
            )}
          >
            {speed}×
          </button>
        </div>
      </div>

      <audio
        ref={player.audioRef}
        src={audioUrl}
        onEnded={player.onEnded}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}
