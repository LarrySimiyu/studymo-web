'use client';

import { Editor, EditorContent } from '@tiptap/react';

interface Props {
  editor: Editor | null;
  saveStatus: 'saved' | 'saving' | 'unsaved' | '';
}

export default function NoteEditor({ editor, saveStatus }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-[var(--text-2)]">
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'unsaved' ? 'Unsaved changes' : ''}
        </p>
      </div>
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
