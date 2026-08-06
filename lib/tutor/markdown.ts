import { marked } from 'marked';

/**
 * The tutor prompt leans on single newlines for grouped lead-in lines and blank
 * lines for real paragraph breaks, so `breaks: true` stays and blank lines are
 * preserved. Only runs of 3+ newlines collapse.
 */
export function renderMarkdown(text: string): string {
  return marked.parse(text.replace(/\n{3,}/g, '\n\n'), { breaks: true }) as string;
}
