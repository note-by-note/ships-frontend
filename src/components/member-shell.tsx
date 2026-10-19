'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { DashboardShell, type ShellLink } from './dashboard-shell';
import { EmptyState, Spinner } from './ui';

const STUDENT_LINKS: ShellLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'star', exact: true },
  { href: '/applications', label: 'My applications', icon: 'file' },
  { href: '/apply', label: 'Apply', icon: 'book' },
  { href: '/faq', label: 'Help', icon: 'help' },
];

const MENTOR_LINKS: ShellLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'star', exact: true },
  { href: '/dashboard/profile', label: 'My profile', icon: 'users' },
  { href: '/applications', label: 'My applications', icon: 'file' },
  { href: '/faq', label: 'Help', icon: 'help' },
];

/** The signed-in frame for students and mentors. Staff are pointed to the staff area. */
export function MemberShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) return <Spinner label="Loading your dashboard" />;
  if (!user) return <Spinner label="Redirecting to sign in" />;

  if (user.isStaff) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <EmptyState
          title="This is the student and mentor dashboard"
          description="Staff accounts use the staff area. To see this page as a student or mentor would, use Test mode."
          action={
            <div className="flex gap-3">
              <Link href="/admin" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Staff area</Link>
              <Link href="/admin/testing" className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium">Test mode</Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <DashboardShell
      title={user.role === 'mentor' ? 'Mentor dashboard' : 'Student dashboard'}
      subtitle={user.name}
      links={user.role === 'mentor' ? MENTOR_LINKS : STUDENT_LINKS}
    >
      {children}
    </DashboardShell>
  );
}
