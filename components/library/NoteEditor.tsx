'use client';

import { Editor, EditorContent } from '@tiptap/react';
import EditorToolbar from '@/components/library/EditorToolbar';

interface Props {
  editor: Editor | null;
  saveStatus: 'saved' | 'saving' | 'unsaved' | '';
  onSimplify: () => void;
  simplifyLoading: boolean;
  simplifyOptions: { label: string; text: string }[] | null;
  onApplySimplify: (text: string) => void;
  onClearSimplify: () => void;
}

export default function NoteEditor({
  editor,
  saveStatus,
  onSimplify,
  simplifyLoading,
  simplifyOptions,
  onApplySimplify,
  onClearSimplify,
}: Props) {
  return (
    <div>
      {editor && (
        <EditorToolbar
          editor={editor}
          saveStatus={saveStatus}
          onSimplify={onSimplify}
          simplifyLoading={simplifyLoading}
          simplifyOptions={simplifyOptions}
          onApplySimplify={onApplySimplify}
          onClearSimplify={onClearSimplify}
        />
      )}
      {saveStatus && (
        <p className="md:hidden text-xs mb-2 text-[var(--text-2)]">
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Unsaved changes'}
        </p>
      )}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
