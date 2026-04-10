'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Baseline, Highlighter, Star,
} from 'lucide-react';

interface BubblePos { top: number; left: number; bottom: number }

interface Props {
  editor: Editor;
  bubblePos: BubblePos | null;
  onBubblePosChange: (pos: BubblePos | null) => void;
  onSimplify: () => void;
  simplifyLoading: boolean;
  simplifyOptions: { label: string; text: string }[] | null;
  onApplySimplify: (text: string) => void;
  onClearSimplify: () => void;
}

const TEXT_COLORS = ['#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FCA5A5', '#FED7AA', '#F9A8D4'];

export default function EditorBubbleToolbar({
  editor,
  bubblePos,
  onBubblePosChange,
  onSimplify,
  simplifyLoading,
  simplifyOptions,
  onApplySimplify,
  onClearSimplify,
}: Props) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Recalculate position whenever window resizes OR the editor container resizes (panel drag)
  useEffect(() => {
    if (!bubblePos) return;

    function recalc() {
      const { from, to } = editor.state.selection;
      if (from === to) { onBubblePosChange(null); return; }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { onBubblePosChange(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      onBubblePosChange({ top: rect.top + window.scrollY - 48, left: rect.left + window.scrollX, bottom: rect.bottom + window.scrollY });
    }

    window.addEventListener('resize', recalc);

    // Also watch the editor DOM element for size changes (e.g. panel drag resize)
    const editorEl = editor.view.dom.closest('[class]') as Element | null;
    const ro = editorEl ? new ResizeObserver(recalc) : null;
    ro?.observe(editorEl!);

    return () => {
      window.removeEventListener('resize', recalc);
      ro?.disconnect();
    };
  }, [bubblePos, editor]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!bubblePos) return null;

  const sep = <div className="w-px h-4 mx-0.5 shrink-0" style={{ backgroundColor: 'var(--border)' }} />;

  const mkBtn = (icon: React.ReactNode, action: () => void, active: boolean, title: string) => (
    <button
      key={title}
      onClick={action}
      title={title}
      className="p-1.5 rounded transition-colors shrink-0"
      style={{
        color: active ? '#fff' : 'var(--text-2)',
        backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = active ? 'rgba(255,255,255,0.15)' : 'transparent'; }}
    >
      {icon}
    </button>
  );

  const simplifyActive = simplifyLoading || !!simplifyOptions;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: bubblePos.top,
          left: bubblePos.left,
          transform: 'translateY(-100%)',
          marginTop: '-6px',
          zIndex: 50,
          maxWidth: '90vw',
        }}
        onMouseDown={e => e.preventDefault()}
      >
        {/* Main toolbar */}
        <div
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg shadow-xl overflow-x-auto"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            scrollbarWidth: 'none',
          }}
        >
          {mkBtn(<Bold size={13} />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold')}
          {mkBtn(<Italic size={13} />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic')}
          {mkBtn(<Strikethrough size={13} />, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Strikethrough')}
          {mkBtn(<Code size={13} />, () => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Code')}

          {sep}

          {/* Text color */}
          <button
            title="Text Color"
            onClick={() => { setShowHighlightPicker(false); setShowTextColorPicker(v => !v); }}
            className="p-1.5 rounded transition-colors shrink-0 flex flex-col items-center gap-0.5"
            style={{
              color: showTextColorPicker ? '#fff' : 'var(--text-2)',
              backgroundColor: showTextColorPicker ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
            onMouseEnter={e => { if (!showTextColorPicker) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = showTextColorPicker ? 'rgba(255,255,255,0.15)' : 'transparent'; }}
          >
            <Baseline size={13} />
            <div className="h-0.5 w-3 rounded-full" style={{ backgroundColor: (editor.getAttributes('textStyle').color as string | undefined) ?? 'var(--text-1)' }} />
          </button>

          {/* Highlight */}
          <button
            title="Highlight"
            onClick={() => { setShowTextColorPicker(false); setShowHighlightPicker(v => !v); }}
            className="p-1.5 rounded transition-colors shrink-0 flex flex-col items-center gap-0.5"
            style={{
              color: showHighlightPicker ? '#fff' : 'var(--text-2)',
              backgroundColor: showHighlightPicker ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
            onMouseEnter={e => { if (!showHighlightPicker) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = showHighlightPicker ? 'rgba(255,255,255,0.15)' : 'transparent'; }}
          >
            <Highlighter size={13} />
            <div className="h-0.5 w-3 rounded-full" style={{ backgroundColor: (editor.getAttributes('highlight').color as string | undefined) ?? '#FEF08A' }} />
          </button>

          {sep}

          {mkBtn(<Heading1 size={13} />, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), 'H1')}
          {mkBtn(<Heading2 size={13} />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'H2')}
          {mkBtn(<Heading3 size={13} />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'H3')}

          {sep}

          {mkBtn(<List size={13} />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bullet List')}
          {mkBtn(<ListOrdered size={13} />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Numbered List')}
          {mkBtn(<Quote size={13} />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Blockquote')}

          {sep}

          {/* Simplify */}
          <button
            title="Simplify selected text"
            onClick={onSimplify}
            disabled={simplifyLoading}
            className="flex items-center gap-1 px-2 py-1.5 rounded transition-colors shrink-0 disabled:opacity-50"
            style={{
              color: '#fff',
              backgroundColor: 'var(--brand)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {simplifyLoading
              ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              : <Star size={13} fill="white" />
            }
            <span className="hidden sm:inline text-xs font-medium">Simplify</span>
          </button>
        </div>

        {/* Text color swatches */}
        {showTextColorPicker && (
          <div
            className="flex items-center gap-1 px-2 py-2 mt-1 rounded-lg shadow-xl overflow-x-auto"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', scrollbarWidth: 'none' }}
          >
            {TEXT_COLORS.map(color => (
              <button
                key={color}
                title={color}
                onClick={() => { editor.chain().focus().setColor(color).run(); setShowTextColorPicker(false); }}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                style={{ backgroundColor: color, borderColor: editor.getAttributes('textStyle').color === color ? 'var(--brand)' : 'transparent' }}
              />
            ))}
            <button
              title="Remove color"
              onClick={() => { editor.chain().focus().unsetColor().run(); setShowTextColorPicker(false); }}
              className="text-xs px-1.5 py-0.5 rounded transition-colors shrink-0"
              style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
            >✕</button>
          </div>
        )}

        {/* Highlight swatches */}
        {showHighlightPicker && (
          <div
            className="flex items-center gap-1 px-2 py-2 mt-1 rounded-lg shadow-xl overflow-x-auto"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', scrollbarWidth: 'none' }}
          >
            {HIGHLIGHT_COLORS.map(color => (
              <button
                key={color}
                title={color}
                onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setShowHighlightPicker(false); }}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                style={{ backgroundColor: color, borderColor: editor.getAttributes('highlight').color === color ? 'var(--brand)' : 'transparent' }}
              />
            ))}
            <button
              title="Remove highlight"
              onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
              className="text-xs px-1.5 py-0.5 rounded transition-colors shrink-0"
              style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
            >✕</button>
          </div>
        )}
      </div>

      {/* Simplify options panel */}
      {simplifyOptions && (
        <div
          style={{
            position: 'fixed',
            top: bubblePos.bottom + 8,
            left: bubblePos.left,
            zIndex: 50,
            width: 'min(320px, 90vw)',
          }}
          onMouseDown={e => e.preventDefault()}
        >
          <div
            className="rounded-lg shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--brand)' }}>Simplify</span>
              <button
                onClick={onClearSimplify}
                className="text-xs transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >✕</button>
            </div>
            {simplifyOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => onApplySimplify(option.text)}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  borderBottom: i < 2 ? '1px solid var(--border)' : undefined,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,101,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span className="block text-[10px] font-semibold mb-0.5" style={{ color: 'var(--brand)' }}>{option.label}</span>
                <span className="block text-xs" style={{ color: 'var(--text-1)', whiteSpace: 'pre-line' }}>{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
