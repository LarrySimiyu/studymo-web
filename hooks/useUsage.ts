'use client';

import { useCallback, useEffect, useState } from 'react';
import { billingApi, type FreeLimitKey, type UsageResponse } from '@/lib/api/billing';
import { onUsageChanged } from '@/lib/contentEvents';
import { useAuth } from './useAuth';

/**
 * Free-tier quotas and how much of each the user has spent. Paid users get
 * `isFree: false`, and every helper reports unlimited room.
 */
export function useUsage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setData(null);
      setLoading(false);
      return;
    }
    const { data: next } = await billingApi.getUsage();
    if (next) setData(next);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => onUsageChanged(() => { refresh(); }), [refresh]);

  const isFree = data?.isFree ?? false;

  const used = (key: FreeLimitKey): number => data?.usage[key] ?? 0;
  const limit = (key: FreeLimitKey): number => data?.limits[key] ?? 0;
  const remaining = (key: FreeLimitKey): number =>
    isFree ? Math.max(0, limit(key) - used(key)) : Infinity;
  const atLimit = (key: FreeLimitKey): boolean => isFree && used(key) >= limit(key);

  return { usage: data, loading, isFree, used, limit, remaining, atLimit, refresh };
}
