'use client';

import { useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AudioWaveform from '@/components/ui/AudioWaveform';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { uploadDocumentFile } from '@/lib/upload/uploadDocument';
import UploadProgress from './UploadProgress';
import type { UploadFormProps } from './uploadTypes';

const PROGRESS_COLOR = '#EC4899';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function RecordForm({ loading, onStart, onSuccess, onError }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const rec = useAudioRecorder();
  const player = useAudioPlayer(rec.url, rec.elapsed);

  const done = Boolean(rec.blob) && !rec.recording;
  const label = rec.recording ? 'Recording' : done ? 'New recording' : 'Ready to record';

  async function handleUpload() {
    if (!rec.blob) return;
    onStart();
    setUploadProgress(0);
    const recordingTitle = title || `Recording ${new Date().toLocaleString()}`;
    const { docId, error } = await uploadDocumentFile(rec.blob, {
      mimeType: 'audio/webm',
      title: recordingTitle,
      isRecording: true,
      onProgress: setUploadProgress,
    });
    if (error || !docId) {
      onError(error ?? 'Upload failed');
      return;
    }
    onSuccess(docId);
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-[var(--border)] p-4 sm:p-5"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="flex items-center gap-2 text-[var(--text-3)]">
            {rec.recording && (
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: 'var(--danger)' }}
              />
            )}
            {label}
          </span>
          <span className="tabular-nums text-[var(--text-2)]">
            {done ? `${fmt(player.currentTime)} / ${fmt(player.total)}` : fmt(rec.elapsed)}
          </span>
        </div>
        <AudioWaveform
          samples={rec.samples}
          mode={done ? 'playback' : 'record'}
          progress={player.progress}
          onSeek={done ? player.seek : undefined}
        />
      </div>

      {rec.error && (
        <p className="text-center text-xs" style={{ color: 'var(--danger-ink)' }}>
          {rec.error}
        </p>
      )}

      <div className="flex flex-col items-center gap-2.5">
        <button
          onClick={rec.recording ? rec.stop : done ? player.toggle : rec.start}
          aria-label={rec.recording ? 'Stop recording' : done ? (player.playing ? 'Pause' : 'Play') : 'Start recording'}
          className="flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
          style={
            done || rec.recording
              ? { backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-md)' }
              : { backgroundColor: 'var(--danger)' }
          }
        >
          {rec.recording ? (
            <Square size={18} fill="currentColor" className="text-[var(--text-1)]" />
          ) : done ? (
            player.playing ? (
              <Pause size={20} fill="currentColor" className="text-[var(--text-1)]" />
            ) : (
              <Play size={20} fill="currentColor" className="translate-x-[1px] text-[var(--text-1)]" />
            )
          ) : (
            <span className="h-5 w-5 rounded-full bg-white" />
          )}
        </button>
        {done && (
          <button
            onClick={rec.start}
            className="text-xs text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
          >
            Re-record
          </button>
        )}
      </div>

      {rec.url && (
        <audio ref={player.audioRef} src={rec.url} onEnded={player.onEnded} className="hidden" />
      )}

      {done && (
        <>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-2)]">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Recording title" />
          </div>
          {loading && <UploadProgress progress={uploadProgress} color={PROGRESS_COLOR} />}
          <Button variant="brand" size="lg" className="w-full" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload Recording'}
          </Button>
        </>
      )}
    </div>
  );
}
