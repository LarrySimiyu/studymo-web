'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioPlayer(url: string, fallbackDuration: number) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [nativeDuration, setNativeDuration] = useState(0);

  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrentTime(0);
    setNativeDuration(0);
  }, [url]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;
    // MediaRecorder webm carries no duration in its header, so Chrome reports Infinity
    // and refuses to seek. Forcing a seek past the end makes it scan and resolve one.
    const settle = () => {
      if (el.duration === Infinity) {
        el.currentTime = 1e101;
        el.addEventListener('timeupdate', () => { el.currentTime = 0; }, { once: true });
        return;
      }
      if (el.duration > 0) setNativeDuration(el.duration);
    };
    el.addEventListener('loadedmetadata', settle);
    el.addEventListener('durationchange', settle);
    return () => {
      el.removeEventListener('loadedmetadata', settle);
      el.removeEventListener('durationchange', settle);
    };
  }, [url]);

  useEffect(() => {
    if (!playing) return;
    const step = () => {
      const el = audioRef.current;
      if (el) setCurrentTime(el.currentTime);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const total = nativeDuration || fallbackDuration;

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const seek = useCallback(
    (ratio: number) => {
      const el = audioRef.current;
      if (!el || !total) return;
      el.currentTime = ratio * total;
      setCurrentTime(el.currentTime);
    },
    [total]
  );

  const onEnded = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  return {
    audioRef,
    playing,
    currentTime,
    total,
    progress: total ? Math.min(1, currentTime / total) : 0,
    toggle,
    seek,
    onEnded,
  };
}
