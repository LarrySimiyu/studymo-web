'use client';

import { motion } from 'framer-motion';

interface Props {
  /** sm = small panel, md = section (default), lg = full page */
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZE = {
  sm: { spinner: 'w-6 h-6 border-2',  text: 'text-xs',      gap: 'gap-2', padding: 'py-8'  },
  md: { spinner: 'w-10 h-10 border-3', text: 'text-sm',      gap: 'gap-3', padding: 'py-12' },
  lg: { spinner: 'w-14 h-14 border-4', text: 'text-base',    gap: 'gap-4', padding: 'py-20' },
};

export default function LoadingSpinner({ size = 'md', label = 'Loading' }: Props) {
  const s = SIZE[size];

  return (
    <div className={`flex flex-col items-center justify-center w-full ${s.padding} ${s.gap}`}>
      <motion.div
        className={`${s.spinner} rounded-full border-t-transparent`}
        style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      {label && (
        <p className={`${s.text} font-medium text-[var(--text-1)]`}>{label}</p>
      )}
    </div>
  );
}
