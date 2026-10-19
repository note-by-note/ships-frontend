'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  api,
  beginTestSession,
  endTestSession,
  onAuthChange,
  restoreSession,
  setSession,
  signOut as clearSession,
} from '@/lib/api';
import type { AccountUser, Permission } from '@/lib/types';

interface SessionEnvelope {
  data: { user: AccountUser; accessToken: string; refreshToken: string };
}

interface AuthValue {
  user: AccountUser | null;
  /** True until the stored session has been checked, so guards do not flash. */
  loading: boolean;
  signIn(email: string, password: string): Promise<AccountUser>;
  register(input: { name: string; email: string; password: string; role?: 'student' | 'mentor' }): Promise<AccountUser>;
  signOut(): Promise<void>;
  refreshUser(): Promise<void>;
  /** True if the signed-in account's role grants this permission. */
  can(permission: Permission): boolean;
  /** Staff only: switch into a test account. */
  enterTestAccount(id: string): Promise<AccountUser>;
  /** Leave a test account and go back to the staff account behind it. */
  leaveTestAccount(): Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const body = await api.get<{ data: AccountUser }>('/auth/me');
      setUser(body.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const restored = await restoreSession();
      if (cancelled) return;
      if (restored) await loadUser();
      if (!cancelled) setLoading(false);
    })();

    // The client clears the session on its own when a refresh fails; without
    // this the UI would keep showing a signed-in header over 401s.
    const unsubscribe = onAuthChange(() => {
      if (typeof window !== 'undefined' && !window.localStorage.getItem('nbn.refresh')) {
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadUser]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async signIn(email, password) {
        const body = await api.post<SessionEnvelope>('/auth/login', { email, password }, { anonymous: true });
        setSession({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
        setUser(body.data.user);
        return body.data.user;
      },
      async register(input) {
        const body = await api.post<SessionEnvelope>('/auth/register', input, { anonymous: true });
        setSession({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
        setUser(body.data.user);
        return body.data.user;
      },
      async signOut() {
        await clearSession();
        setUser(null);
      },
      refreshUser: loadUser,
      can(permission) {
        return Boolean(user?.permissions?.includes(permission));
      },
      async enterTestAccount(id) {
        const body = await api.post<SessionEnvelope>(`/testing/accounts/${id}/session`);
        beginTestSession({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
        setUser(body.data.user);
        return body.data.user;
      },
      async leaveTestAccount() {
        const restored = await endTestSession();
        if (restored) await loadUser();
        else setUser(null);
      },
    }),
    [user, loading, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
