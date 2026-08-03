'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FAQItem[];
};

export default function FAQ({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="my-8 divide-y" style={{ borderColor: 'var(--border)' }}>
      {items.map((item, i) => (
        <div key={i} className="py-4">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 text-left"
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              {item.question}
            </span>
            {open === i ? (
              <X size={16} className="shrink-0" style={{ color: 'var(--text-3)' }} />
            ) : (
              <Plus size={16} className="shrink-0" style={{ color: 'var(--text-3)' }} />
            )}
          </button>
          {open === i && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
