'use client';

import { useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import { renderMarkdown } from '@/lib/tutor/markdown';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface Props {
  content: string;
  isStreaming?: boolean;
}

export default function AssistantMessage({ content, isStreaming }: Props) {
  const { copied, copy } = useCopyToClipboard();

  // Reparsing on every streamed token is the hot path here
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div className="group/msg">
      <div
        className="tutor-message text-sm text-[var(--text-1)] leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: html + (isStreaming ? '<span class="tutor-cursor"></span>' : ''),
        }}
      />

      {!isStreaming && content.trim() && (
        <div className="mt-1.5 flex opacity-0 transition-opacity group-hover/msg:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() => copy(content)}
            aria-label={copied ? 'Copied' : 'Copy response'}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: copied ? '#22C55E' : 'var(--text-3)' }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
