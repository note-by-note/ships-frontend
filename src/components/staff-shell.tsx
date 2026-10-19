'use client';

import type { ReactNode } from 'react';
import { ROLE_LABELS, type Permission } from '@/lib/types';
import { AdminGuard } from './admin-guard';
import { useAuth } from './auth-provider';
import { DashboardShell, type ShellLink } from './dashboard-shell';

/** Every staff section, and the permissions that unlock it. */
const SECTIONS: (ShellLink & { anyOf: Permission[] })[] = [
  { href: '/admin', label: 'Overview', icon: 'star', exact: true, anyOf: ['stats.view'] },
  { href: '/admin/applications', label: 'Applications', icon: 'file', anyOf: ['applications.review'] },
  { href: '/admin/mentors', label: 'Mentors', icon: 'music', anyOf: ['mentors.view', 'mentors.manage'] },
  { href: '/admin/people', label: 'People & roles', icon: 'users', anyOf: ['users.view'] },
  { href: '/admin/forms', label: 'Forms', icon: 'book', anyOf: ['forms.manage'] },
  { href: '/admin/testing', label: 'Test mode', icon: 'code', anyOf: ['testing.use'] },
];

function StaffFrame({ children }: { children: ReactNode }) {
  const { user, can } = useAuth();
  const links = SECTIONS.filter((section) => section.anyOf.some((permission) => can(permission)));

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
