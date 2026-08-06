import { marked } from 'marked';

interface GeneratedNote {
  summary?: string;
  sections?: { heading: string; content: string }[];
  keyTerms?: { term: string; definition: string }[];
  keyTakeaways?: string[];
}

/**
 * AI notes are stored as the raw generation JSON until the user's first edit,
 * after which the editor overwrites `content` with HTML. The catch branch is
 * that already-edited case.
 */
export function convertNoteToHTML(content: string): string {
  try {
    const notes = JSON.parse(content) as GeneratedNote;
    let md = '';
    if (notes.summary) md += `## Summary\n\n${notes.summary}\n\n`;
    for (const s of notes.sections ?? []) {
      md += `## ${s.heading}\n\n${s.content}\n\n`;
    }
    if (notes.keyTerms?.length) {
      md += '## Key Terms\n\n';
      for (const kt of notes.keyTerms) md += `- **${kt.term}**: ${kt.definition}\n`;
      md += '\n';
    }
    if (notes.keyTakeaways?.length) {
      md += '## Key Takeaways\n\n';
      for (const kt of notes.keyTakeaways) md += `- ${kt}\n`;
    }
    return marked(md) as string;
  } catch {
    return marked(content) as string;
  }
}

/** Styling lives in the `.note-content` block in globals.css. */
export const NOTE_CONTENT_CLASS = 'note-content max-w-none focus:outline-none';
