import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  href?: string;
};

export default function FeatureCard({ title, description, href }: Props) {
  const inner = (
    <div
      className="rounded-2xl p-5 border my-6 flex items-start justify-between gap-4"
      style={{ backgroundColor: 'rgba(255,101,0,0.06)', borderColor: 'rgba(255,101,0,0.2)' }}
    >
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {description}
        </p>
      </div>
      {href && (
        <ArrowRight size={18} className="shrink-0 mt-0.5" style={{ color: '#FF6500' }} />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}
