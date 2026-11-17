'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AgreementReminder } from '../policies/agreement-cards';
import { sidesOf, useAuth } from '../account/auth-provider';
import { DashboardShell, type ShellLink } from './dashboard-shell';
import { MESSAGES_CHANGED } from '../messages/messages';
import { useAnnouncementsUnseen } from '../messages/announcements';
import { useTeamUnread } from '../messages/team-messages';
import { EmptyState, Spinner } from '../ui';

// The sidebar, in sections. Everyone gets the overview, lessons and account
// sections; mentors also get the tools for teaching and volunteering.
// (Section headings show on wide screens; phones get one row of tabs.)

const OVERVIEW: ShellLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home', exact: true },
  { href: '/dashboard/announcements', label: 'Announcements', icon: 'megaphone' },
];

const LESSONS: ShellLink[] = [
  { group: 'Lessons', href: '/dashboard/lessons', label: 'Lessons', icon: 'music' },
  { group: 'Lessons', href: '/dashboard/calendar', label: 'Calendar', icon: 'calendar' },
  { group: 'Lessons', href: '/dashboard/messages', label: 'Messages', icon: 'message' },
  { group: 'Lessons', href: '/dashboard/resources', label: 'Resources', icon: 'book' },
];

const MENTORING: ShellLink[] = [
  { group: 'Mentoring', href: '/dashboard/profile', label: 'My page', icon: 'user' },
  { group: 'Mentoring', href: '/dashboard/availability', label: 'Availability', icon: 'clock' },
  { group: 'Mentoring', href: '/dashboard/hours', label: 'Volunteer hours', icon: 'heart' },
  { group: 'Mentoring', href: '/dashboard/team-messages', label: 'Team messages', icon: 'users' },
];

const ACCOUNT: ShellLink[] = [
  { group: 'Account', href: '/applications', label: 'My applications', icon: 'file' },
  { group: 'Account', href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
  { group: 'Account', href: '/dashboard/report', label: 'Report a concern', icon: 'shield' },
  { group: 'Account', href: '/faq', label: 'Help', icon: 'help' },
];

const STUDENT_LINKS: ShellLink[] = [...OVERVIEW, ...LESSONS, ...ACCOUNT];
const MENTOR_LINKS: ShellLink[] = [...OVERVIEW, ...LESSONS, ...MENTORING, ...ACCOUNT];

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

/**
 * The signed-in frame for students and mentors. Staff who also mentor or take
 * lessons use it too (with a way back to the staff area); other staff are
 * pointed to the staff area.
 */
export function MemberShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sides = user ? sidesOf(user) : { mentor: false, student: false, any: false };
  const unread = useUnreadMessages(Boolean(user && sides.any), pathname);
  const teamUnread = useTeamUnread(Boolean(user && sides.mentor), pathname);
  const unseenAnnouncements = useAnnouncementsUnseen(Boolean(user && sides.any), pathname);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) return <Spinner label="Loading your dashboard" />;
  if (!user) return <Spinner label="Redirecting to sign in" />;

  if (user.isStaff && !sides.any) {
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

  const base = sides.mentor ? MENTOR_LINKS : STUDENT_LINKS;
  return (
    <DashboardShell
      title={sides.mentor && sides.student ? 'Mentor and student' : sides.mentor ? 'Mentor dashboard' : 'Student dashboard'}
      subtitle={user.name}
      links={[
        ...(user.isStaff ? [{ href: '/admin', label: 'Staff area', icon: 'star' as const }] : []),
        ...base.map((link) =>
          link.href === '/dashboard/messages'
            ? { ...link, badge: unread }
            : link.href === '/dashboard/team-messages'
              ? { ...link, badge: teamUnread }
              : link.href === '/dashboard/announcements'
                ? { ...link, badge: unseenAnnouncements }
                : link,
        ),
      ]}
    >
      <AgreementReminder className="mb-6" />
      {children}
    </DashboardShell>
  );
}
