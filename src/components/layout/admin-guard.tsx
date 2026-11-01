'use client';

// Keeps the staff pages from rendering for anyone else.
//
// This is a convenience, not a security boundary: every staff route on the API
// checks the permission again, so a determined visitor who bypasses this sees an
// empty page and a wall of 403s rather than anyone's data.

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Permission } from '@/lib/types';
import { useAuth } from './auth-provider';
import { EmptyState, Spinner } from './ui';

/** Any staff role (admin, tech, outreach, marketing) gets past this. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) return <Spinner label="Checking your access" />;
  if (!user) return <Spinner label="Redirecting to sign in" />;

  if (!user.isStaff) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyState
          title={user.isTest ? 'You are in a test account' : 'You do not have access to this area'}
          description={
            user.isTest
              ? 'Use “Return to my account” in the yellow bar to get back to the staff area.'
              : 'The staff area is limited to Note by Note team accounts. If you think this is wrong, ask an admin to check your role.'
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}

/** Inside the staff area: show the page only if the role grants one of these permissions. */
export function RequirePermission({ anyOf, children }: { anyOf: Permission[]; children: ReactNode }) {
  const { can } = useAuth();
  if (anyOf.some((permission) => can(permission))) return <>{children}</>;
  return (
    <EmptyState
      title="Your role doesn’t include this page"
      description="Ask an admin if you need access."
    />
  );
}
