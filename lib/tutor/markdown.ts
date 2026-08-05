import { marked } from 'marked';

export function renderMarkdown(text: string): string {
  // Collapse 3+ consecutive newlines to 2, and 2 newlines between short lines to 1
  const collapsed = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(?=[^\n])/g, (_, offset, str) => {
      // If previous paragraph is short (< 120 chars) treat as single newline
      const prev = str.slice(0, offset).split('\n').pop() ?? '';
      return prev.length < 120 ? '\n' : '\n\n';
    });
  return marked.parse(collapsed, { breaks: true }) as string;
}
