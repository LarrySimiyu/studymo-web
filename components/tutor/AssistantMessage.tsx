'use client';

import { useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
          <Button
            variant="ghost"
            size="xs"
            onClick={() => copy(content)}
            aria-label={copied ? 'Copied' : 'Copy response'}
            className={copied ? 'text-[var(--success-ink)] hover:text-[var(--success-ink)]' : 'text-[var(--text-3)]'}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      )}
    </div>
  );
}
