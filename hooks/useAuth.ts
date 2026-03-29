'use client';

import { useAuthContext } from '@/context/AuthContext';

/**
 * Hook to access the authenticated user and auth actions.
 * Must be used within AuthProvider.
 */
export function useAuth() {
  return useAuthContext();
}
