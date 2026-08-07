'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadDocumentFile } from '@/lib/upload/uploadDocument';
import UploadProgress from './UploadProgress';
import type { UploadFormProps } from './uploadTypes';

const WAVE_COLOR = '#EC4899';

export default function RecordForm({ loading, onStart, onSuccess, onError }: UploadFormProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);

  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d')!;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barW = 3;
    const gap = 2;
    const count = Math.floor(canvas.width / (barW + gap));
    for (let i = 0; i < count; i++) {
      const val = data[Math.floor((i / count) * data.length)] / 255;
      const h = Math.max(4, val * canvas.height);
      ctx.fillStyle = WAVE_COLOR;
      ctx.fillRect(i * (barW + gap), (canvas.height - h) / 2, barW, h);
    }
    animRef.current = requestAnimationFrame(drawWave);
  }, []);

  async function startRecording() {
    setAudioBlob(null);
    setAudioUrl('');
    setElapsed(0);
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyserRef.current = analyser;
    drawWave();
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      cancelAnimationFrame(animRef.current);
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    mediaRef.current = mr;
    setRecording(true);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animRef.current);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  async function handleUpload() {
    if (!audioBlob) return;
    onStart();
    setUploadProgress(0);
    const recordingTitle = title || `Recording ${new Date().toLocaleString()}`;
    const { docId, error } = await uploadDocumentFile(audioBlob, {
      mimeType: 'audio/webm',
      title: recordingTitle,
      isRecording: true,
      onProgress: setUploadProgress,
    });
    if (error || !docId) { onError(error ?? 'Upload failed'); return; }
    onSuccess(docId);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 py-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={48}
          className="w-full rounded-lg"
          style={{ backgroundColor: 'var(--bg-page)' }}
        />
        <p className="font-mono text-2xl tabular-nums text-[var(--text-1)]">{fmt(elapsed)}</p>
        {!recording && !audioBlob && (
          <button
            onClick={startRecording}
            aria-label="Start recording"
            className="flex h-16 w-16 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            <span className="h-5 w-5 rounded-full bg-white" />
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            aria-label="Stop recording"
            className="flex h-16 w-16 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--text-2)' }}
          >
            <span className="h-5 w-5 rounded bg-white" />
          </button>
        )}
        {audioBlob && audioUrl && <audio src={audioUrl} controls className="w-full" />}
      </div>
      {audioBlob && (
        <>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-2)]">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recording title" />
          </div>
          {loading && <UploadProgress progress={uploadProgress} color={WAVE_COLOR} />}
          <Button variant="brand" size="lg" className="w-full" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload Recording'}
          </Button>
        </>
      )}
    </div>
  );
}
