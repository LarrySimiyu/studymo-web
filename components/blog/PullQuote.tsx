import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function PullQuote({ children }: Props) {
  return (
    <blockquote
      className="border-l-4 my-8 px-6 py-2"
      style={{ borderColor: '#FF6500' }}
    >
      <p
        className="font-playfair text-xl sm:text-2xl italic leading-relaxed"
        style={{ color: 'var(--text-1)' }}
      >
        {children}
      </p>
    </blockquote>
  );
}
