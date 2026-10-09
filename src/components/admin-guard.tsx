'use client';

// Keeps the admin pages from rendering for anyone else.
//
// This is a convenience, not a security boundary: every admin route on the API
// checks the role again, so a determined visitor who bypasses this sees an
// empty page and a wall of 403s rather than anyone's data.

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { EmptyState, Spinner } from './ui';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) return <Spinner label="Checking your access" />;
  if (!user) return <Spinner label="Redirecting to sign in" />;

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyState
          title="You do not have access to this area"
          description="Admin pages are limited to staff accounts. If you think this is wrong, ask an admin to check your role."
        />
      </div>
    );
  }

  return <>{children}</>;
}
