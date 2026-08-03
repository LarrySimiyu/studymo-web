'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import studymoLogo from '@/assets/studymo_logo.png';

type AuthShellProps = {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export default function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <div className="light min-h-screen min-h-dvh flex" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="flex flex-col flex-1 px-5 sm:px-10 lg:px-14 py-5 sm:py-6">
        <Link href="/" aria-label="Go to StudyMo home" className="self-start select-none">
          <Image src={studymoLogo} alt="StudyMo" height={64} className="h-11 sm:h-14 w-auto" priority />
        </Link>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[380px]"
          >
            <h1
              className="font-playfair text-3xl sm:text-[2.5rem] font-medium tracking-tight leading-tight text-center mb-8"
              style={{ color: 'var(--text-1)' }}
            >
              {title}
            </h1>

            <div className="flex flex-col gap-3">{children}</div>

            <p className="mt-5 text-xs leading-relaxed text-center px-2" style={{ color: 'var(--text-3)' }}>
              By continuing you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-8 text-sm text-center" style={{ color: 'var(--text-2)' }}>
              {footer}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 lg:max-w-[760px] p-3">
        <div
          className="h-full w-full rounded-3xl flex items-center px-10 xl:px-14"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="font-playfair text-[3.25rem] xl:text-[4.25rem] 2xl:text-[5rem] font-medium leading-[1.03] tracking-tight text-white max-w-[11ch]"
          >
            AI tutor that understands your learning style
          </motion.p>
        </div>
      </div>
    </div>
  );
}
