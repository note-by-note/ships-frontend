'use client';

// Once signed in, the dashboard is home: opening the site's front page takes
// you there. The public pages stay one click away (the header's "Explore"
// menu), and its "Home page" link (/?home) shows the front page as usual.

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasStoredSession } from '@/lib/api';
import { accountHome, useAuth } from './auth-provider';
import { Spinner } from './ui';

const noChanges = () => () => {};

export function SignedInHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Asking for the front page on purpose (?home) skips the redirect.
  const wantsFrontPage = useSearchParams().has('home');
  // The saved sign-in lives in the browser only; the server always renders
  // "no", and the browser switches after hydration, so the two never disagree.
  const hadSavedSignIn = useSyncExternalStore(noChanges, hasStoredSession, () => false);
  const mayRedirect = !wantsFrontPage && hadSavedSignIn;

  useEffect(() => {
    if (!loading && user && !wantsFrontPage) router.replace(accountHome(user));
  }, [loading, user, wantsFrontPage, router]);

  // Someone with a saved sign-in sees a quiet loading screen rather than the
  // front page flashing up before the dashboard.
  if (mayRedirect && (loading || user)) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-cream">
        <Spinner label="Opening your dashboard" />
      </div>
    );
  }
  return null;
}
