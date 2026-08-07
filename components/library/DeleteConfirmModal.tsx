'use client';

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alertDialog';

interface Props {
  open: boolean;
  count?: number;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

export default function DeleteConfirmModal({
  open,
  count = 1,
  title,
  description,
  onConfirm,
  onClose,
  deleting,
}: Props) {
  const heading = title ?? `Delete ${count} note${count !== 1 ? 's' : ''}?`;
  const body =
    description ??
    `This action cannot be undone. All notes, flashcards, and quizzes for ${count !== 1 ? 'these notes' : 'this note'} will be permanently deleted.`;

  return (
    <AlertDialog open={open} onOpenChange={o => { if (!o && !deleting) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--danger-subtle)' }}
          >
            <Trash2 size={22} style={{ color: 'var(--danger-ink)' }} />
          </div>
          <div>
            <AlertDialogTitle>{heading}</AlertDialogTitle>
            <AlertDialogDescription>{body}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={e => { e.preventDefault(); onConfirm(); }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
