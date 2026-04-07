'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, trackPage } from '@/lib/analytics';

export default function RouteTracker() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initAnalytics();
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    trackPage(pathname);
  }, [pathname]);

  return null;
}
