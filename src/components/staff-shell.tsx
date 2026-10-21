'use client';

import type { ReactNode } from 'react';
import { ROLE_LABELS, type Permission } from '@/lib/types';
import { AdminGuard } from './admin-guard';
import { useAuth } from './auth-provider';
import { DashboardShell, type ShellLink } from './dashboard-shell';

/** Every staff section, and the permissions that unlock it ('all' = every staff role). */
const SECTIONS: (ShellLink & { anyOf: Permission[] | 'all' })[] = [
  { href: '/admin', label: 'Overview', icon: 'star', exact: true, anyOf: ['stats.view'] },
  { href: '/admin/applications', label: 'Applications', icon: 'file', anyOf: ['applications.review'] },
  { href: '/admin/mentors', label: 'Mentors', icon: 'music', anyOf: ['mentors.view', 'mentors.manage'] },
  { href: '/admin/photos', label: 'Mentor photos', icon: 'users', anyOf: ['mentors.manage'] },
  { href: '/admin/messages', label: 'Messages', icon: 'message', anyOf: ['messages.review'] },
  { href: '/admin/hours', label: 'Hours to approve', icon: 'check', anyOf: ['hours.approve'] },
  { href: '/admin/resources', label: 'Team resources', icon: 'book', anyOf: ['resources.manage'] },
  { href: '/admin/people', label: 'People & roles', icon: 'users', anyOf: ['users.view'] },
  { href: '/admin/forms', label: 'Forms', icon: 'file', anyOf: ['forms.manage'] },
  { href: '/admin/testing', label: 'Test mode', icon: 'code', anyOf: ['testing.use'] },
  { href: '/admin/my-hours', label: 'My volunteer hours', icon: 'heart', anyOf: 'all' },
];

function StaffFrame({ children }: { children: ReactNode }) {
  const { user, can } = useAuth();
  const links = SECTIONS.filter(
    (section) => section.anyOf === 'all' || section.anyOf.some((permission) => can(permission)),
  );

  return (
    <DashboardShell
      title="Staff area"
      subtitle={user ? `${user.name} · ${ROLE_LABELS[user.role]}` : undefined}
      links={links}
    >
      {children}
    </DashboardShell>
  );
}

export function StaffShell({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <StaffFrame>{children}</StaffFrame>
    </AdminGuard>
  );
}
