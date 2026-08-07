'use client';

import { useCallback, useEffect, useRef } from 'react';

const BAR_W = 3;
const GAP = 2;
const STEP = BAR_W + GAP;
const MIN_H = 2;

interface Palette {
  bar: string;
  played: string;
  dim: string;
  head: string;
}

interface Props {
  /** 0–1 amplitude per slice, oldest first */
  samples: number[];
  /** `record` fills left→right then scrolls; `playback` fits the whole take to the width */
  mode: 'record' | 'playback';
  /** 0–1 playhead position, playback only */
  progress?: number;
  onSeek?: (ratio: number) => void;
  height?: number;
  className?: string;
}

function readPalette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  return {
    bar: s.getPropertyValue('--text-2').trim(),
    played: s.getPropertyValue('--text-1').trim(),
    dim: s.getPropertyValue('--text-3').trim(),
    head: s.getPropertyValue('--brand').trim(),
  };
}

/** Resamples to exactly `slots` bars — bucket peak when squeezing, repeat when stretching. */
function fit(samples: number[], slots: number): number[] {
  if (!samples.length) return [];
  const out: number[] = [];
  const per = samples.length / slots;
  for (let i = 0; i < slots; i++) {
    const from = Math.floor(i * per);
    const to = Math.max(from + 1, Math.floor((i + 1) * per));
    let peak = 0;
    for (let j = from; j < to && j < samples.length; j++) peak = Math.max(peak, samples[j]);
    out.push(peak);
  }
  return out;
}

export default function AudioWaveform({
  samples,
  mode,
  progress = 0,
  onSeek,
  height = 64,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const widthRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const palette = paletteRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !palette || !ctx) return;

    const w = widthRef.current;
    ctx.clearRect(0, 0, w, height);

    const slots = Math.max(1, Math.floor(w / STEP));
    const bars = mode === 'record' ? samples.slice(-slots) : fit(samples, slots);
    const cy = height / 2;
    const maxH = height - 6;
    const ratio = Math.min(1, Math.max(0, progress));

    ctx.lineCap = 'round';
    ctx.lineWidth = BAR_W;
    for (let i = 0; i < bars.length; i++) {
      const barH = Math.max(MIN_H, bars[i] * maxH);
      const x = i * STEP + BAR_W / 2;
      ctx.strokeStyle = mode === 'playback' && i / bars.length < ratio ? palette.played : palette.bar;
      ctx.beginPath();
      ctx.moveTo(x, cy - barH / 2);
      ctx.lineTo(x, cy + barH / 2);
      ctx.stroke();
    }

    const headX =
      mode === 'record'
        ? Math.min(bars.length * STEP + BAR_W / 2, w - 1)
        : Math.min(ratio * bars.length * STEP + BAR_W / 2, w - 1);

    if (mode === 'record' && headX < w - STEP) {
      ctx.strokeStyle = palette.dim;
      ctx.lineWidth = 2;
      ctx.setLineDash([0, 6]);
      ctx.beginPath();
      ctx.moveTo(headX + STEP, cy);
      ctx.lineTo(w - 1, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (bars.length) {
      ctx.strokeStyle = palette.head;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX, 1);
      ctx.lineTo(headX, height - 1);
      ctx.stroke();
    }
  }, [samples, mode, progress, height]);

  // Held in a ref so a new sample (10×/sec) doesn't tear down the observers below.
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paletteRef.current = readPalette(canvas);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      widthRef.current = canvas.clientWidth;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // Canvas can't read CSS vars, so cached colours have to be refreshed on theme flips.
    const mo = new MutationObserver(() => {
      paletteRef.current = readPalette(canvas);
      drawRef.current();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [height]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handlePointer(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!onSeek || (e.type === 'pointermove' && e.buttons !== 1)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
      style={{ height }}
      className={`block w-full touch-none ${onSeek ? 'cursor-pointer' : ''} ${className ?? ''}`}
    />
  );
}
