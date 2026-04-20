import { Lightbulb, Info, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

type CalloutType = 'tip' | 'note' | 'warning';

const config: Record<CalloutType, { icon: typeof Lightbulb; color: string; bg: string; label: string }> = {
  tip: {
    icon: Lightbulb,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.08)',
    label: 'Tip',
  },
  note: {
    icon: Info,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    label: 'Note',
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    label: 'Warning',
  },
};

type Props = {
  type?: CalloutType;
  children: ReactNode;
};

export default function Callout({ type = 'tip', children }: Props) {
  const { icon: Icon, color, bg, label } = config[type];

  return (
    <div
      className="border-l-4 rounded-r-xl px-5 py-4 my-6 flex gap-3"
      style={{ borderColor: color, backgroundColor: bg }}
    >
      <Icon size={18} className="shrink-0 mt-0.5" style={{ color }} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color }}>
          {label}
        </p>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
