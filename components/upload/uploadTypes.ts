import { PenLine, Upload, Mic, Youtube, Globe } from 'lucide-react';

export type UploadType = 'blank' | 'file' | 'record' | 'video' | 'webpage';

export type UploadState = 'idle' | 'uploading' | 'processing' | 'failed';

export const TYPE_META: Record<UploadType, { title: string; icon: React.ElementType; color: string; bg: string }> = {
  blank:   { title: 'New Note',        icon: PenLine, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  file:    { title: 'Upload File',     icon: Upload,  color: '#FF6500', bg: 'rgba(255,101,0,0.12)'  },
  record:  { title: 'Record Audio',    icon: Mic,     color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  video:   { title: 'YouTube URL',     icon: Youtube, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  webpage: { title: 'Import Website',  icon: Globe,   color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
};

export interface UploadFormProps {
  loading: boolean;
  onStart: () => void;
  onSuccess: (docId: string) => void;
  onError: (msg: string) => void;
}
