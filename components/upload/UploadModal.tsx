'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { documentsApi } from '@/lib/api/documents';

type Tab = 'file' | 'video' | 'record';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const ACCEPTED = '.pdf,.mp3,.mp4,.wav,.m4a,.webm';

export default function UploadModal({ onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Upload Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ backgroundColor: '#111' }}>
          {(['file', 'video', 'record'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize"
              style={tab === t ? { backgroundColor: '#9747FF', color: '#fff' } : { color: '#888' }}
            >
              {t === 'file' ? 'Upload File' : t === 'video' ? 'Video URL' : 'Record Audio'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>
        )}

        {tab === 'file' && (
          <FileUploadTab
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={onSuccess}
          />
        )}
        {tab === 'video' && (
          <VideoTab
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={onSuccess}
          />
        )}
        {tab === 'record' && (
          <RecordTab
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}

function FileUploadTab({ loading, setLoading, setError, onSuccess }: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string) => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name);
      const { error } = await documentsApi.uploadFile(fd);
      if (error) throw new Error(error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl p-8 text-center cursor-pointer transition-colors"
        style={{
          border: `2px dashed ${dragging ? '#9747FF' : '#333'}`,
          backgroundColor: dragging ? '#9747FF10' : '#111',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="text-3xl mb-2">📁</div>
        {file ? (
          <p className="text-sm text-white font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-sm text-gray-300">Drag and drop a PDF or audio file</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          </>
        )}
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
          style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
          placeholder="Document title"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2.5 rounded-lg font-medium text-white text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: '#9747FF' }}
      >
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  );
}

function VideoTab({ loading, setLoading, setError, onSuccess }: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string) => void;
  onSuccess: () => void;
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  async function handleImport() {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await documentsApi.uploadVideo({ url, title: title || 'YouTube Video' });
      if (error) throw new Error(error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">YouTube URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
          style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
          style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
          placeholder="Video title"
        />
      </div>
      <button
        onClick={handleImport}
        disabled={!url || loading}
        className="w-full py-2.5 rounded-lg font-medium text-white text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: '#9747FF' }}
      >
        {loading ? 'Importing…' : 'Import Video'}
      </button>
    </div>
  );
}

function RecordTab({ loading, setLoading, setError, onSuccess }: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string) => void;
  onSuccess: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [title, setTitle] = useState('');
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
      ctx.fillStyle = '#9747FF';
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
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('audio', audioBlob, 'recording.webm');
      fd.append('title', title || `Recording ${new Date().toLocaleString()}`);
      const { error } = await documentsApi.uploadRecording(fd);
      if (error) throw new Error(error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 py-4">
        <canvas ref={canvasRef} width={300} height={48} className="w-full rounded-lg" style={{ backgroundColor: '#111' }} />
        <p className="text-2xl font-mono text-white tabular-nums">{fmt(elapsed)}</p>

        {!recording && !audioBlob && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#ef4444' }}
          >
            <span className="w-5 h-5 rounded-full bg-white" />
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#374151' }}
          >
            <span className="w-5 h-5 rounded bg-white" />
          </button>
        )}
        {audioBlob && audioUrl && (
          <audio src={audioUrl} controls className="w-full" />
        )}
      </div>

      {audioBlob && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
              style={{ backgroundColor: '#2A2A2A', border: '1px solid #333' }}
              placeholder="Recording title"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-white text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: '#9747FF' }}
          >
            {loading ? 'Uploading…' : 'Upload Recording'}
          </button>
        </>
      )}
    </div>
  );
}
