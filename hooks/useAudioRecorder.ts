'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SAMPLE_MS = 100;
const GAIN = 3.2;

export interface AudioRecorder {
  recording: boolean;
  elapsed: number;
  samples: number[];
  blob: Blob | null;
  url: string;
  error: string;
  start: () => Promise<void>;
  stop: () => void;
}

export function useAudioRecorder(): AudioRecorder {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const urlRef = useRef('');

  const teardown = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  const readLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return 0;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    // Speech RMS sits around 0.05–0.2, so it needs lifting before it reads as a waveform.
    return Math.min(1, Math.pow(Math.sqrt(sum / data.length) * GAIN, 0.7));
  }, []);

  const start = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = e => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const out = new Blob(chunksRef.current, { type: 'audio/webm' });
        urlRef.current = URL.createObjectURL(out);
        setBlob(out);
        setUrl(urlRef.current);
        teardown();
      };
      recorderRef.current = recorder;

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = '';
      setBlob(null);
      setUrl('');
      setSamples([]);
      setElapsed(0);

      startedAtRef.current = performance.now();
      recorder.start();
      setRecording(true);
      tickRef.current = setInterval(() => {
        setSamples(prev => [...prev, readLevel()]);
        setElapsed(Math.floor((performance.now() - startedAtRef.current) / 1000));
      }, SAMPLE_MS);
    } catch (e) {
      teardown();
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Microphone access denied. Enable it in your browser settings.'
          : 'Could not start recording on this browser.'
      );
    }
  }, [readLevel, teardown]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }, []);

  useEffect(
    () => () => {
      recorderRef.current?.stop();
      teardown();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [teardown]
  );

  return { recording, elapsed, samples, blob, url, error, start, stop };
}
