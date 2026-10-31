'use client';

// The staff area's frame. The sidebar is kept short on purpose: closely
// related pages share one entry and switch with tabs at the top of the page
// (Mentors / Photos, Forms / Partner schools, My hours / To approve).
// Counts of what's waiting show on the entry they belong to.

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { ROLE_LABELS, type Permission, type StaffOverview } from '@/lib/types';
import { AdminGuard } from './admin-guard';
import { AgreementReminder } from './agreement-cards';
import { sidesOf, useAuth } from './auth-provider';
import { DashboardShell, PageTabs, type ShellLink } from './dashboard-shell';
import { useTeamUnread } from './team-messages';

type Waiting = NonNullable<StaffOverview['waiting']>;

const WaitingContext = createContext<Waiting>({ photos: 0, hours: 0, reports: 0, toMatch: 0 });

/** Every staff section and the permissions that unlock it ('all' = every staff role). */
const SECTIONS: (ShellLink & { anyOf: Permission[] | 'all'; count?: keyof Waiting })[] = [
  { href: '/admin', label: 'Overview', icon: 'star', exact: true, anyOf: ['stats.view'] },
  { href: '/admin/team-messages', label: 'Team messages', icon: 'megaphone', anyOf: 'all' },
  { group: 'Program', href: '/admin/applications', also: ['/admin/matching'], label: 'Applications', icon: 'file', anyOf: ['applications.review'], count: 'toMatch' },
  { group: 'Program', href: '/admin/mentors', also: ['/admin/photos'], label: 'Mentors', icon: 'music', anyOf: ['mentors.view', 'mentors.manage'], count: 'photos' },
  { group: 'Program', href: '/admin/messages', also: ['/admin/reports'], label: 'Messages & reports', icon: 'message', anyOf: ['messages.review'], count: 'reports' },
  { group: 'Program', href: '/admin/my-hours', also: ['/admin/hours'], label: 'Volunteer hours', icon: 'heart', anyOf: 'all', count: 'hours' },
  { group: 'Program', href: '/admin/resources', label: 'Resources', icon: 'book', anyOf: ['resources.manage'] },
  { group: 'Site & settings', href: '/admin/forms', also: ['/admin/schools'], label: 'Forms', icon: 'file', anyOf: ['forms.manage'] },
  { group: 'Site & settings', href: '/admin/team', label: 'Team page', icon: 'users', anyOf: ['team.manage'] },
  { group: 'Site & settings', href: '/admin/people', label: 'People & roles', icon: 'shield', anyOf: ['users.view'] },
  { group: 'Site & settings', href: '/admin/testing', label: 'Test mode', icon: 'code', anyOf: ['testing.use'] },
];

/** Which counts each role can act on, so nobody sees a badge for work they can't do. */
const COUNT_PERMISSION: Record<keyof Waiting, Permission> = {
  toMatch: 'applications.review',
  photos: 'mentors.manage',
  reports: 'messages.review',
  hours: 'hours.approve',
};

function StaffFrame({ children }: { children: ReactNode }) {
  const { user, can } = useAuth();
  const pathname = usePathname();
  const [waiting, setWaiting] = useState<Waiting>({ photos: 0, hours: 0, reports: 0, toMatch: 0 });
  const teamUnread = useTeamUnread(Boolean(user), pathname);

  // Refreshed on every page change, so a badge clears after the work is done.
  useEffect(() => {
    if (!can('stats.view')) return;
    api
      .get<{ data: StaffOverview }>('/staff/overview')
      .then((body) => body.data.waiting && setWaiting(body.data.waiting))
      .catch(() => undefined);
  }, [can, pathname]);

  const links: ShellLink[] = SECTIONS.filter(
    (section) => section.anyOf === 'all' || section.anyOf.some((permission) => can(permission)),
  ).map(({ count, ...link }) => ({
    ...link,
    badge:
      link.href === '/admin/team-messages' ? teamUnread : count && can(COUNT_PERMISSION[count]) ? waiting[count] : undefined,
  }));
  // Volunteers who also mentor or take lessons reach their own dashboard from here.
  if (user && sidesOf(user).any) {
    links.push({ group: 'You', href: '/dashboard', label: 'My lessons & mentoring', icon: 'calendar' });
  }

  return (
    <WaitingContext.Provider value={waiting}>
      <DashboardShell
        title="Staff area"
        subtitle={user ? `${user.name} · ${ROLE_LABELS[user.role]}` : undefined}
        links={links}
      >
        <AgreementReminder className="mb-6" />
        {children}
      </DashboardShell>
    </WaitingContext.Provider>
  );
}

export function StaffShell({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <StaffFrame>{children}</StaffFrame>
    </AdminGuard>
  );
}

// --- Tabs for sections with more than one page ------------------------------------------

export function ApplicationTabs() {
  const waiting = useContext(WaitingContext);
  return (
    <PageTabs
      tabs={[
        { href: '/admin/applications', label: 'Applications' },
        { href: '/admin/matching', label: 'Matching', badge: waiting.toMatch },
      ]}
    />
  );
}

export function MentorTabs() {
  const { can } = useAuth();
  const waiting = useContext(WaitingContext);
  return (
    <PageTabs
      tabs={[
        { href: '/admin/mentors', label: 'Mentor pages' },
        ...(can('mentors.manage') ? [{ href: '/admin/photos', label: 'Photos to approve', badge: waiting.photos }] : []),
      ]}
    />
  );
}

export function MessageTabs() {
  return (
    <PageTabs
      tabs={[
        { href: '/admin/messages', label: 'Conversations' },
        { href: '/admin/reports', label: 'Reports' },
      ]}
    />
  );
}

export function FormTabs() {
  return (
    <PageTabs
      tabs={[
        { href: '/admin/forms', label: 'Application forms' },
        { href: '/admin/schools', label: 'Partner schools' },
      ]}
    />
  );
}

export function HoursTabs() {
  const { can } = useAuth();
  const waiting = useContext(WaitingContext);
  return (
    <PageTabs
      tabs={[
        { href: '/admin/my-hours', label: 'My hours' },
        ...(can('hours.approve') ? [{ href: '/admin/hours', label: 'To approve', badge: waiting.hours }] : []),
      ]}
    />
  );
}
