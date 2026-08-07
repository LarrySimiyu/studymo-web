'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor, useEditorState } from '@tiptap/react';
import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Baseline, Highlighter, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Props {
  editor: Editor;
  saveStatus: 'saved' | 'saving' | 'unsaved' | '';
  onSimplify: () => void;
  simplifyLoading: boolean;
  simplifyOptions: { label: string; text: string }[] | null;
  onApplySimplify: (text: string) => void;
  onClearSimplify: () => void;
}

const TEXT_COLORS = ['#FFFFFF', '#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FCA5A5', '#FED7AA', '#F9A8D4'];
const PICKER_WIDTH = 280;

export default function EditorToolbar({
  editor,
  saveStatus,
  onSimplify,
  simplifyLoading,
  simplifyOptions,
  onApplySimplify,
  onClearSimplify,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState<'text' | 'highlight' | null>(null);
  const [pickerLeft, setPickerLeft] = useState(0);

  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      code: editor.isActive('code'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      color: editor.getAttributes('textStyle').color as string | undefined,
      highlight: editor.getAttributes('highlight').color as string | undefined,
      hasSelection: !editor.state.selection.empty,
    }),
  });

  useEffect(() => {
    if (!picker) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setPicker(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [picker]);

  // Touch targets stay 44px on mobile and tighten to 32px from sm up.
  const btnClass = 'shrink-0 flex items-center justify-center rounded-lg transition-colors h-11 w-11 sm:h-8 sm:w-8 disabled:opacity-30';
  const toggleClass = (active: boolean) => cn(
    btnClass,
    active
      ? 'bg-[var(--brand-subtle)] text-[var(--brand-ink)]'
      : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
  );

  const sep = <div className="w-px h-5 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />;

  const mkBtn = (icon: React.ReactNode, action: () => void, active: boolean, title: string, disabled = false) => (
    <button
      key={title}
      onClick={action}
      title={title}
      aria-pressed={active}
      disabled={disabled}
      className={toggleClass(active)}
    >
      {icon}
    </button>
  );

  function togglePicker(kind: 'text' | 'highlight', e: React.MouseEvent<HTMLButtonElement>) {
    const wrap = wrapRef.current;
    if (wrap) {
      const left = e.currentTarget.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
      setPickerLeft(Math.max(0, Math.min(left, wrap.clientWidth - PICKER_WIDTH)));
    }
    setPicker(prev => (prev === kind ? null : kind));
  }

  const mkColorBtn = (kind: 'text' | 'highlight', icon: React.ReactNode, swatch: string, title: string) => (
    <button
      title={title}
      onClick={e => togglePicker(kind, e)}
      aria-pressed={picker === kind}
      className={cn(toggleClass(picker === kind), 'flex-col gap-0.5')}
    >
      {icon}
      <div className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: swatch }} />
    </button>
  );

  const popoverStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseDown={e => e.preventDefault()}
    >
      <div
        className="flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {mkBtn(<Undo2 size={15} />, () => editor.chain().focus().undo().run(), false, 'Undo', !s.canUndo)}
        {mkBtn(<Redo2 size={15} />, () => editor.chain().focus().redo().run(), false, 'Redo', !s.canRedo)}

        {sep}

        {mkBtn(<Bold size={15} />, () => editor.chain().focus().toggleBold().run(), s.bold, 'Bold')}
        {mkBtn(<Italic size={15} />, () => editor.chain().focus().toggleItalic().run(), s.italic, 'Italic')}
        {mkBtn(<Underline size={15} />, () => editor.chain().focus().toggleUnderline().run(), s.underline, 'Underline')}
        {mkBtn(<Strikethrough size={15} />, () => editor.chain().focus().toggleStrike().run(), s.strike, 'Strikethrough')}
        {mkBtn(<Code size={15} />, () => editor.chain().focus().toggleCode().run(), s.code, 'Code')}

        {sep}

        {mkColorBtn('text', <Baseline size={15} />, s.color ?? 'var(--text-1)', 'Text color')}
        {mkColorBtn('highlight', <Highlighter size={15} />, s.highlight ?? '#FEF08A', 'Highlight')}

        {sep}

        {mkBtn(<Heading1 size={15} />, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), s.h1, 'Heading 1')}
        {mkBtn(<Heading2 size={15} />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), s.h2, 'Heading 2')}
        {mkBtn(<Heading3 size={15} />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), s.h3, 'Heading 3')}

        {sep}

        {mkBtn(<List size={15} />, () => editor.chain().focus().toggleBulletList().run(), s.bulletList, 'Bullet list')}
        {mkBtn(<ListOrdered size={15} />, () => editor.chain().focus().toggleOrderedList().run(), s.orderedList, 'Numbered list')}
        {mkBtn(<Quote size={15} />, () => editor.chain().focus().toggleBlockquote().run(), s.blockquote, 'Blockquote')}

        <span className="ml-auto hidden shrink-0 whitespace-nowrap px-2 text-2xs text-[var(--text-3)] md:block">
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'unsaved' ? 'Unsaved changes' : ''}
        </span>

        <Button
          variant="primary"
          size="xs"
          title={s.hasSelection ? 'Simplify selected text' : 'Select text to simplify'}
          onClick={onSimplify}
          disabled={simplifyLoading || !s.hasSelection}
          className="ml-1 h-11 shrink-0 disabled:opacity-40 sm:h-7 md:ml-0"
        >
          {simplifyLoading
            ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            : <Star size={14} fill="white" />
          }
          Simplify
        </Button>
      </div>

      {picker && (
        <div
          className="absolute z-30 mt-1 flex items-center gap-1 px-2 py-2 rounded-lg shadow-xl"
          style={{ ...popoverStyle, left: pickerLeft }}
        >
          {(picker === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).map(color => (
            <button
              key={color}
              title={color}
              onClick={() => {
                if (picker === 'text') editor.chain().focus().setColor(color).run();
                else editor.chain().focus().setHighlight({ color }).run();
                setPicker(null);
              }}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
              style={{
                backgroundColor: color,
                borderColor: (picker === 'text' ? s.color : s.highlight) === color ? 'var(--brand)' : 'var(--border-md)',
              }}
            />
          ))}
          <button
            title={picker === 'text' ? 'Remove color' : 'Remove highlight'}
            onClick={() => {
              if (picker === 'text') editor.chain().focus().unsetColor().run();
              else editor.chain().focus().unsetHighlight().run();
              setPicker(null);
            }}
            className="shrink-0 rounded border border-[var(--border-md)] px-1.5 py-0.5 text-xs text-[var(--text-3)] transition-colors hover:text-[var(--text-1)]"
          >✕</button>
        </div>
      )}

      {simplifyOptions && (
        <div className="absolute right-0 z-30 mt-1 w-[min(320px,90vw)] rounded-lg shadow-xl overflow-hidden" style={popoverStyle}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>Simplify</span>
            <button
              onClick={onClearSimplify}
              className="text-xs transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]"
            >✕</button>
          </div>
          {simplifyOptions.map((option, i) => (
            <button
              key={i}
              onClick={() => onApplySimplify(option.text)}
              className="w-full text-left px-3 py-2.5 transition-colors"
              style={{ borderBottom: i < simplifyOptions.length - 1 ? '1px solid var(--border)' : undefined }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,101,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="block text-2xs font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>{option.label}</span>
              <span className="block text-xs" style={{ color: 'var(--text-1)', whiteSpace: 'pre-line' }}>{option.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
