import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface Props {
  icon: LucideIcon;
  /** Icon colour. Pass a token or a PALETTE accent; defaults to brand. */
  accent?: string;
  /** Icon tint behind the glyph. Defaults to the brand tint. */
  accentBg?: string;
  title: string;
  description: string;
  action?: Action;
  /** Fills the glyph as well as stroking it — used by the Quizzes heart. */
  fillIcon?: boolean;
}

export default function EmptyState({
  icon: Icon,
  accent = 'var(--brand)',
  accentBg = 'var(--brand-subtle)',
  title,
  description,
  action,
  fillIcon,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl p-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:p-8 sm:text-left"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl sm:h-24 sm:w-24"
        style={{ backgroundColor: accentBg }}
      >
        <Icon size={40} style={{ color: accent }} fill={fillIcon ? accent : 'none'} />
      </div>
      <div className="flex flex-col items-center sm:items-start">
        <h3 className="text-heading-sm text-[var(--text-1)]">{title}</h3>
        <p className="mt-1 text-body-sm text-[var(--text-2)]">{description}</p>
        {action && (
          <div className="mt-4">
            {action.href ? (
              <Button variant="primary" size="sm" asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
