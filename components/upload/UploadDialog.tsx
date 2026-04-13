'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PenLine, Upload, Mic, Youtube, Globe } from 'lucide-react';
import { documentsApi, notesApi } from '@/lib/api/documents';
import { invalidatePrefix } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export type UploadType = 'blank' | 'file' | 'record' | 'video' | 'webpage';

interface Props {
  type: UploadType;
  onClose: () => void;
  onSuccess: (documentId?: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'failed';

const ACCEPTED = '.pdf,.mp3,.mp4,.wav,.m4a,.webm';
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 150;

const TYPE_META: Record<UploadType, { title: string; icon: React.ElementType; color: string; bg: string }> = {
  blank:   { title: 'New Note',        icon: PenLine, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  file:    { title: 'Upload File',     icon: Upload,  color: '#FF6500', bg: 'rgba(255,101,0,0.12)'  },
  record:  { title: 'Record Audio',    icon: Mic,     color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  video:   { title: 'YouTube URL',     icon: Youtube, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  webpage: { title: 'Import Website',  icon: Globe,   color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
};

async function pollDocumentStatus(
  docId: string,
  onComplete: () => void,
  onFailed: (errorMessage?: string) => void
): Promise<() => void> {
  let attempts = 0;
  let stopped = false;

  const poll = async () => {
    if (stopped) return;
    invalidatePrefix(`/documents/${docId}`);
    const { data, error } = await documentsApi.getById(docId);
    if (stopped) return;
    if (
      error === 'HTTP 404' ||
      error?.includes('404') ||
      error === 'Document not found' ||
      (error && error.toLowerCase().includes('not found'))
    ) { onFailed(); return; }
    if (data?.status === 'complete') { onComplete(); return; }
    if (data?.status === 'failed') { onFailed(data.errorMessage ?? undefined); return; }
    attempts++;
    if (attempts >= POLL_MAX_ATTEMPTS) { onFailed(); return; }
    setTimeout(poll, POLL_INTERVAL_MS);
  };

  setTimeout(poll, POLL_INTERVAL_MS);
  return () => { stopped = true; };
}

// ─── Processing / Failed overlay ─────────────────────────────────────────────
function ProcessingOverlay({ state, errorMessage, onRetry, onClose }: { state: 'processing' | 'failed'; errorMessage?: string; onRetry: () => void; onClose: () => void }) {
  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,101,0,0.12)' }}>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent" style={{ borderTopColor: '#FF6500', borderRightColor: '#FF6500' }} />
        </div>
        <div>
          <p className="text-[var(--text-1)] font-semibold text-sm">Processing your note…</p>
          <p className="text-[var(--text-2)] text-xs mt-1 max-w-xs">This may take a minute. You can close this — it will appear in your library when ready.</p>
        </div>
        <button onClick={onClose} className="text-xs text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">Close</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <div>
        <p className="text-[var(--text-1)] font-semibold">Upload failed</p>
        <p className="text-[var(--text-2)] text-xs mt-1 max-w-xs">
          {errorMessage ?? 'Something went wrong while processing your note.'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="brand" size="sm" onClick={onRetry}>Try Again</Button>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Blank note form ──────────────────────────────────────────────────────────
function BlankNoteForm({ onSuccess, onError }: { onSuccess: (docId: string) => void; onError: (msg: string) => void }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    const { data, error } = await notesApi.createBlank(title.trim() || undefined);
    setLoading(false);
    if (error || !data) { onError(error ?? 'Failed to create note'); return; }
    analytics.uploadCompleted('blank');
    onSuccess(data.documentId);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleCreate()}
          autoFocus
          placeholder="Untitled Note"
        />
      </div>
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--bg-page)', border: '2px dashed var(--border-md)' }}>
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm text-[var(--text-1)]">Start with an empty note</p>
        <p className="text-xs text-[var(--text-2)] mt-1">Write freely — no upload needed</p>
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating…' : 'Create Note'}
      </Button>
    </div>
  );
}

// ─── File upload form ─────────────────────────────────────────────────────────
function FileUploadForm({ loading, onStart, onSuccess, onError }: { loading: boolean; onStart: () => void; onSuccess: (docId: string) => void; onError: (msg: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setTitle(prev => prev || f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  async function handleUpload() {
    if (!file) return;
    if (file.type === 'application/pdf' && file.size > 40 * 1024 * 1024) {
      onError(`PDF is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum allowed size is 40MB.`);
      return;
    }
    onStart();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);
    const { data, error } = await documentsApi.uploadFile(fd);
    if (error || !data) { onError(error ?? 'Upload failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl p-8 text-center cursor-pointer transition-colors"
        style={{ border: `2px dashed ${dragging ? '#9747FF' : 'var(--border-md)'}`, backgroundColor: dragging ? 'var(--brand-subtle)' : 'var(--bg-page)' }}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div className="text-3xl mb-2">📁</div>
        {file ? (
          <p className="text-sm text-[var(--text-1)] font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-sm text-[var(--text-1)]">Drag And Drop A PDF, Audio, DOCX, Or Text File</p>
            <p className="text-xs text-[var(--text-2)] mt-1">or click to browse</p>
          </>
        )}
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading…' : 'Upload'}
      </Button>
    </div>
  );
}

// ─── Video URL form ───────────────────────────────────────────────────────────
function VideoForm({ loading, onStart, onSuccess, onError }: { loading: boolean; onStart: () => void; onSuccess: (docId: string) => void; onError: (msg: string) => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  async function handleImport() {
    if (!url) return;
    onStart();
    const { data, error } = await documentsApi.uploadVideo({ url, title: title || 'YouTube Video' });
    if (error || !data) { onError(error ?? 'Import failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
      </div>
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">YouTube URL</label>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleImport} disabled={!url || loading}>
        {loading ? 'Importing…' : 'Import Video'}
      </Button>
    </div>
  );
}

// ─── Webpage form ─────────────────────────────────────────────────────────────
function WebpageForm({ loading, onStart, onSuccess, onError }: { loading: boolean; onStart: () => void; onSuccess: (docId: string) => void; onError: (msg: string) => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { onError('Please enter a valid URL including https://'); return; }
    onStart();
    const { data, error } = await documentsApi.uploadWebpage({ url: trimmed, title: title.trim() || undefined });
    if (error || !data) { onError(error ?? 'Import failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Title <span className="text-[var(--text-3)]">(optional)</span></label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave blank to use page title" />
      </div>
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Website URL</label>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleImport()}
          placeholder="https://example.com/article"
          autoFocus
        />
      </div>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
        <p className="text-[var(--text-2)]">Works with articles, Wikipedia, documentation, and most public pages. Paywalled or login-required pages won't import.</p>
      </div>
      <Button variant="brand" size="lg" className="w-full" onClick={handleImport} disabled={!url.trim() || loading}>
        {loading ? 'Importing…' : 'Import Page'}
      </Button>
    </div>
  );
}

// ─── Record audio form ────────────────────────────────────────────────────────
function RecordForm({ loading, onStart, onSuccess, onError }: { loading: boolean; onStart: () => void; onSuccess: (docId: string) => void; onError: (msg: string) => void }) {
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
    onStart();
    const fd = new FormData();
    fd.append('audio', audioBlob, 'recording.webm');
    fd.append('title', title || `Recording ${new Date().toLocaleString()}`);
    const { data, error } = await documentsApi.uploadRecording(fd);
    if (error || !data) { onError(error ?? 'Upload failed'); return; }
    onSuccess(data.id);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[var(--text-2)] mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recording title" />
      </div>
      <div className="flex flex-col items-center gap-3 py-2">
        <canvas ref={canvasRef} width={300} height={48} className="w-full rounded-lg" style={{ backgroundColor: 'var(--bg-page)' }} />
        <p className="text-2xl font-mono text-[var(--text-1)] tabular-nums">{fmt(elapsed)}</p>
        {!recording && !audioBlob && (
          <button onClick={startRecording} className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#ef4444' }}>
            <span className="w-5 h-5 rounded-full bg-white" />
          </button>
        )}
        {recording && (
          <button onClick={stopRecording} className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ backgroundColor: '#374151' }}>
            <span className="w-5 h-5 rounded bg-white" />
          </button>
        )}
        {audioBlob && audioUrl && <audio src={audioUrl} controls className="w-full" />}
      </div>
      {audioBlob && (
        <Button variant="brand" size="lg" className="w-full" onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading…' : 'Upload Recording'}
        </Button>
      )}
    </div>
  );
}

// ─── Root dialog ──────────────────────────────────────────────────────────────
export default function UploadDialog({ type, onClose, onSuccess }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState('');
  const [failedMessage, setFailedMessage] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(true);
  const stopPollRef = useRef<(() => void) | null>(null);
  const { title, icon: Icon, color, bg } = TYPE_META[type];
  const { subscriptionStatus, loading: authLoading } = useAuth();

  // Free-tier gate: check document count before showing form
  useEffect(() => {
    if (authLoading) return; // wait for auth to finish loading

    if (subscriptionStatus?.hasAccess) {
      setChecking(false);
      return;
    }

    // Free user or auth failed — check count; on any error just show the form
    documentsApi.getCount()
      .then(({ data }) => {
        if (data && data.count >= 1) {
          onClose();
          window.dispatchEvent(new CustomEvent('app:show-paywall'));
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, subscriptionStatus]);

  useEffect(() => () => { stopPollRef.current?.(); }, []);

  function handleUploadStart() {
    setError('');
    setUploadState('uploading');
    analytics.uploadStarted(type);
  }

  async function handleUploadSuccess(docId: string) {
    setUploadState('processing');
    stopPollRef.current = await pollDocumentStatus(
      docId,
      () => { analytics.uploadCompleted(type); onSuccess(docId); },
      (errorMessage) => { analytics.uploadFailed(type); setFailedMessage(errorMessage); setUploadState('failed'); },
    );
  }

  function handleUploadError(msg: string) {
    setError(msg);
    setUploadState('idle');
  }

  function handleRetry() {
    stopPollRef.current?.();
    stopPollRef.current = null;
    setUploadState('idle');
    setError('');
    setFailedMessage(undefined);
  }

  const isOverlay = uploadState === 'processing' || uploadState === 'failed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && !isOverlay && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {checking ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#FF6500' }} />
          </div>
        ) : isOverlay ? (
          <ProcessingOverlay state={uploadState as 'processing' | 'failed'} errorMessage={failedMessage} onRetry={handleRetry} onClose={onClose} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={15} style={{ color }} />
                </span>
                <h2 className="text-base font-semibold text-[var(--text-1)]">{title}</h2>
              </div>
              <button onClick={onClose} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors text-xl leading-none">×</button>
            </div>

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}

            {type === 'blank'   && <BlankNoteForm  onSuccess={(docId) => onSuccess(docId)} onError={handleUploadError} />}
            {type === 'file'    && <FileUploadForm loading={uploadState === 'uploading'} onStart={handleUploadStart} onSuccess={handleUploadSuccess} onError={handleUploadError} />}
            {type === 'record'  && <RecordForm     loading={uploadState === 'uploading'} onStart={handleUploadStart} onSuccess={handleUploadSuccess} onError={handleUploadError} />}
            {type === 'video'   && <VideoForm      loading={uploadState === 'uploading'} onStart={handleUploadStart} onSuccess={handleUploadSuccess} onError={handleUploadError} />}
            {type === 'webpage' && <WebpageForm    loading={uploadState === 'uploading'} onStart={handleUploadStart} onSuccess={handleUploadSuccess} onError={handleUploadError} />}
          </>
        )}
      </div>
    </div>
  );
}

