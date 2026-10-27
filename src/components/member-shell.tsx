'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from './auth-provider';
import { DashboardShell, type ShellLink } from './dashboard-shell';
import { MESSAGES_CHANGED } from './messages';
import { EmptyState, Spinner } from './ui';

const STUDENT_LINKS: ShellLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'star', exact: true },
  { href: '/dashboard/lessons', label: 'Lessons', icon: 'calendar' },
  { href: '/dashboard/messages', label: 'Messages', icon: 'message' },
  { href: '/dashboard/resources', label: 'Resources', icon: 'book' },
  { href: '/applications', label: 'My applications', icon: 'file' },
  { href: '/apply', label: 'Apply', icon: 'school' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'mail' },
  { href: '/faq', label: 'Help', icon: 'help' },
];

const MENTOR_LINKS: ShellLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'star', exact: true },
  { href: '/dashboard/lessons', label: 'Lessons', icon: 'calendar' },
  { href: '/dashboard/messages', label: 'Messages', icon: 'message' },
  { href: '/dashboard/resources', label: 'Resources', icon: 'book' },
  { href: '/dashboard/availability', label: 'My availability', icon: 'clock' },
  { href: '/dashboard/profile', label: 'My page', icon: 'users' },
  { href: '/dashboard/hours', label: 'Volunteer hours', icon: 'heart' },
  { href: '/applications', label: 'My applications', icon: 'file' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'mail' },
  { href: '/faq', label: 'Help', icon: 'help' },
];

/** A mentor who takes lessons too: the mentor tools, plus applying as a student. */
const MENTOR_STUDENT_LINKS: ShellLink[] = MENTOR_LINKS.flatMap((link) =>
  link.href === '/applications' ? [link, { href: '/apply', label: 'Apply', icon: 'school' as const }] : [link],
);

/**
 * Unread messages for the sidebar badge. Checked on every page change and
 * once a minute while the tab is open.
 */
function useUnreadMessages(enabled: boolean, pathname: string): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const check = () =>
      api
        .get<{ meta: { unread: number } }>('/messages')
        .then((body) => !cancelled && setUnread(body.meta.unread))
        .catch(() => undefined);
    void check();
    const timer = setInterval(check, 60_000);
    window.addEventListener(MESSAGES_CHANGED, check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED, check);
    };
  }, [enabled, pathname]);

  return enabled ? unread : 0;
}

/** The signed-in frame for students and mentors. Staff are pointed to the staff area. */
export function MemberShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const unread = useUnreadMessages(Boolean(user && !user.isStaff), pathname);

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

  const mentor = user.role === 'mentor';
  return (
    <DashboardShell
      title={mentor && user.alsoStudent ? 'Mentor and student' : mentor ? 'Mentor dashboard' : 'Student dashboard'}
      subtitle={user.name}
      links={(mentor && user.alsoStudent ? MENTOR_STUDENT_LINKS : mentor ? MENTOR_LINKS : STUDENT_LINKS).map((link) =>
        link.href === '/dashboard/messages' ? { ...link, badge: unread } : link,
      )}
    >
      {children}
    </DashboardShell>
  );
}
