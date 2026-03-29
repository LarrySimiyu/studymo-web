'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface Subscription {
  status: string;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
}

export function useSubscription() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    api.get<Subscription>('/subscriptions/me')
      .then(({ data }) => setSubscription(data))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const isActive = subscription?.status === 'active';

  return { subscription, loading, isActive };
}
