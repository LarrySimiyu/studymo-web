import { cn } from '@/lib/utils';

const WIDTHS = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  full: 'max-w-none',
} as const;

interface Props {
  children: React.ReactNode;
  /**
   * The page's `PageHeader`. Rendered outside the content column so the bar
   * spans the whole pane — passing it here rather than as a child is what keeps
   * it from being indented and width-capped along with the content.
   */
  header?: React.ReactNode;
  /** Content column width. Reading-length pages use md; data-dense ones xl. */
  width?: keyof typeof WIDTHS;
  /**
   * Centres the column instead of anchoring it to the sidebar. Focus views —
   * a quiz run, an exam, settings — read better centred; list pages don't,
   * they just push the content into the middle of the screen.
   */
  center?: boolean;
  className?: string;
}

/**
 * The one container every dashboard page sits in. Owns the responsive gutter so
 * pages stop each inventing their own (`p-6`, `px-6 py-6`, or none at all).
 * The gutter matches PageHeader's so the title and the content share an edge.
 */
export default function PageShell({ children, header, width = 'md', center, className }: Props) {
  return (
    <>
      {header}
      <div className={cn('w-full px-4 py-5 sm:px-5', WIDTHS[width], center && 'mx-auto', className)}>
        {children}
      </div>
    </>
  );
}
