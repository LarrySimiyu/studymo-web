'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { auth, appleProvider } from '@/lib/firebase';
import { billingApi, SubscriptionStatus } from '@/lib/api/billing';
import { getOnboardingData, clearOnboardingData } from '@/lib/onboarding';
import { identifyUser, aliasUser, resetAnalytics, analytics, setSuperProperties, updateProfile } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

interface DbUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: DbSubscription | null;
}

interface DbSubscription {
  id: string;
  userId: string;
  status: string;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
}

interface AuthContextValue {
  currentUser: User | null;
  dbUser: DbUser | null;
  subscription: DbSubscription | null;
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, name?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
  appleSignIn: () => Promise<UserCredential>;
  refreshSubscription: () => Promise<void>;
}

const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncUser(user: User, name?: string): Promise<DbUser | null> {
  try {
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email ?? '',
        name: name ?? user.displayName ?? undefined,
      }),
    });
    if (!response.ok) return null;
    return (await response.json()) as DbUser;
  } catch {
    return null;
  }
}

async function syncOnboardingIfNeeded(user: User): Promise<void> {
  try {
    const onboardingData = getOnboardingData();
    // Only sync if there's meaningful onboarding data
    if (!onboardingData.gradeLevel && !onboardingData.subjects.length) return;

    const token = await user.getIdToken();

    // Check if user already has a profile
    const profileRes = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile?.onboardingComplete) {
        clearOnboardingData();
        return;
      }
    }

    // Sync onboarding data
    await fetch(`${API_URL}/profile/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(onboardingData),
    });

    clearOnboardingData();
  } catch {
    // Don't block sign-up if sync fails
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const { data } = await billingApi.getStatus();
      if (data) {
        setSubscriptionStatus(data);
        const planProps = { plan: data.plan ?? 'none', subscription_status: data.status, has_access: data.hasAccess };
        setSuperProperties(planProps);
        updateProfile(planProps);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const synced = await syncUser(user);
        setDbUser(synced);
        await fetchSubscriptionStatus();
        identifyUser(user.uid, {
          email: user.email ?? undefined,
          name: user.displayName ?? undefined,
        });
      } else {
        setDbUser(null);
        setSubscriptionStatus(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchSubscriptionStatus]);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const synced = await syncUser(cred.user);
    setDbUser(synced);
    await fetchSubscriptionStatus();
    analytics.loginCompleted('email');
    identifyUser(cred.user.uid, { email: cred.user.email ?? undefined });
    return cred;
  };

  const signUp = async (email: string, password: string, name?: string): Promise<UserCredential> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const synced = await syncUser(cred.user, name);
    setDbUser(synced);
    await syncOnboardingIfNeeded(cred.user);
    setSubscriptionStatus({ status: 'none', plan: null, isActive: false, hasAccess: false, isTrial: false, trialEnd: null, daysLeftInTrial: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, daysUntilRenewal: null });
    aliasUser(cred.user.uid);
    analytics.signupCompleted('email');
    identifyUser(cred.user.uid, { email: cred.user.email ?? undefined, name: name ?? undefined }, true);
    return cred;
  };

  const googleSignIn = async (): Promise<UserCredential> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const isNew = cred.user.metadata.creationTime === cred.user.metadata.lastSignInTime;
    const synced = await syncUser(cred.user);
    setDbUser(synced);
    await syncOnboardingIfNeeded(cred.user);
    await fetchSubscriptionStatus();
    if (isNew) {
      aliasUser(cred.user.uid);
      analytics.signupCompleted('google');
      identifyUser(cred.user.uid, { email: cred.user.email ?? undefined, name: cred.user.displayName ?? undefined }, true);
    } else {
      analytics.loginCompleted('google');
      identifyUser(cred.user.uid, { email: cred.user.email ?? undefined, name: cred.user.displayName ?? undefined });
    }
    return cred;
  };

  const appleSignIn = async (): Promise<UserCredential> => {
    const cred = await signInWithPopup(auth, appleProvider);
    const isNew = cred.user.metadata.creationTime === cred.user.metadata.lastSignInTime;
    const synced = await syncUser(cred.user);
    setDbUser(synced);
    await syncOnboardingIfNeeded(cred.user);
    await fetchSubscriptionStatus();
    if (isNew) {
      aliasUser(cred.user.uid);
      analytics.signupCompleted('apple');
      identifyUser(cred.user.uid, { email: cred.user.email ?? undefined, name: cred.user.displayName ?? undefined }, true);
    } else {
      analytics.loginCompleted('apple');
      identifyUser(cred.user.uid, { email: cred.user.email ?? undefined, name: cred.user.displayName ?? undefined });
    }
    return cred;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setDbUser(null);
    setSubscriptionStatus(null);
    resetAnalytics();
  };

  const refreshSubscription = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const subscription = dbUser?.subscription ?? null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      dbUser,
      subscription,
      subscriptionStatus,
      loading,
      signIn,
      signUp,
      signOut,
      googleSignIn,
      appleSignIn,
      refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
