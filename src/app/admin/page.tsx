'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel, StatTile } from '@/components/dashboard-shell';
import { Icon } from '@/components/marketing';
import { Alert, Spinner, humanize } from '@/components/ui';
import { api } from '@/lib/api';
import { ROLE_LABELS, type Permission, type StaffOverview, type UserRole } from '@/lib/types';

// The staff home. Counts only — every staff role can read it, marketing
// included, so nothing here identifies anyone.

const SHORTCUTS: { href: string; label: string; body: string; anyOf: Permission[] }[] = [
  { href: '/admin/applications', label: 'Review applications', body: 'Read, add notes and decide.', anyOf: ['applications.review'] },
  { href: '/admin/mentors/new', label: 'Add a mentor', body: 'Create a profile and link it to an account.', anyOf: ['mentors.manage'] },
  { href: '/admin/people', label: 'People & roles', body: 'Accounts, roles and access.', anyOf: ['users.view'] },
  { href: '/admin/forms', label: 'Edit forms', body: 'Questions, publishing and closing.', anyOf: ['forms.manage'] },
  { href: '/admin/testing', label: 'Test mode', body: 'Try the site as a test student or mentor.', anyOf: ['testing.use'] },
];

export default function StaffOverviewPage() {
  const { user, can } = useAuth();
  const [overview, setOverview] = useState<StaffOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!can('stats.view')) return;
    api
      .get<{ data: StaffOverview }>('/staff/overview')
      .then((body) => setOverview(body.data))
      .catch(() => setError(true));
  }, [can]);

  const shortcuts = SHORTCUTS.filter((shortcut) => shortcut.anyOf.some((permission) => can(permission)));
  const submitted = (status: string) => overview?.applications.byStatus[status] ?? 0;

  return (
    <RequirePermission anyOf={['stats.view']}>
      <DashboardHeading
        title={`Welcome back, ${user?.name.split(' ')[0] ?? ''}!`}
        description={`You’re signed in as ${user ? ROLE_LABELS[user.role] : ''}. Here’s where things stand.`}
      />

      {error ? <Alert>We could not load the overview.</Alert> : null}
      {!overview && !error ? <Spinner /> : null}

      {overview ? (
        <div className="flex flex-col gap-8">
          {!overview.emailConfigured ? (
            <Alert tone="warn">
              Email isn’t set up yet, so absence and message notifications are only shown on dashboards, not emailed. Add the
              SMTP settings to the API’s <code>.env</code> (see <code>.env.example</code>) to turn email on.
            </Alert>
          ) : null}
          {overview.waiting ? <Waiting waiting={overview.waiting} can={can} /> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Waiting for review" value={submitted('submitted')} hint="Submitted, not yet looked at" />
            <StatTile label="Under review" value={submitted('under_review')} />
            <StatTile label="Accepted" value={submitted('accepted')} />
            <StatTile label="Open forms" value={overview.openForms} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Applications by type">
              <ul className="flex flex-col gap-2 text-sm">
                {(['mentee', 'mentor', 'job'] as const).map((kind) => (
                  <li key={kind} className="flex justify-between">
                    <span className="text-navy/70">{kind === 'job' ? 'Volunteer' : humanize(kind)}</span>
                    <strong>{overview.applications.byKind[kind] ?? 0}</strong>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Mentor profiles">
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex justify-between"><span className="text-navy/70">Total</span><strong>{overview.mentors.total}</strong></li>
                <li className="flex justify-between"><span className="text-navy/70">Published</span><strong>{overview.mentors.published}</strong></li>
                <li className="flex justify-between"><span className="text-navy/70">Accepting students</span><strong>{overview.mentors.accepting}</strong></li>
              </ul>
            </Panel>
            <Panel title="Active accounts">
              <ul className="flex flex-col gap-2 text-sm">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                  <li key={role} className="flex justify-between">
                    <span className="text-navy/70">{ROLE_LABELS[role]}</span>
                    <strong>{overview.accounts[role] ?? 0}</strong>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {shortcuts.length ? (
            <div>
              <h2 className="mb-4 font-display text-xl font-bold text-navy">Shortcuts</h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shortcuts.map((shortcut) => (
                  <li key={shortcut.href}>
                    <Link
                      href={shortcut.href}
                      className="group flex h-full items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(30,42,68,0.06)] hover:ring-2 hover:ring-navy/20"
                    >
                      <span>
                        <span className="block font-semibold text-navy">{shortcut.label}</span>
                        <span className="text-sm text-navy/65">{shortcut.body}</span>
                      </span>
                      <Icon name="arrow" className="mt-1 size-4 shrink-0 text-navy/50 group-hover:text-navy" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </RequirePermission>
  );
}

/** Things staff need to act on: photos, hours and reported messages. Only the ones this role can act on are links. */
function Waiting({
  waiting,
  can,
}: {
  waiting: NonNullable<StaffOverview['waiting']>;
  can: (permission: Permission) => boolean;
}) {
  const items = [
    { count: waiting.reports, label: ['reported message', 'reported messages'], href: '/admin/messages', permission: 'messages.review' as Permission, urgent: true },
    { count: waiting.photos, label: ['mentor photo to approve', 'mentor photos to approve'], href: '/admin/photos', permission: 'mentors.manage' as Permission, urgent: false },
    { count: waiting.hours, label: ['volunteer hours entry to approve', 'volunteer hours entries to approve'], href: '/admin/hours', permission: 'hours.approve' as Permission, urgent: false },
  ].filter((item) => item.count > 0);
  if (!items.length) return null;

  return (
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => {
        const text = `${item.count} ${item.label[item.count === 1 ? 0 : 1]}`;
        const style = item.urgent ? 'bg-danger-soft text-danger' : 'bg-gold/25 text-navy';
        return (
          <li key={item.href}>
            {can(item.permission) ? (
              <Link href={item.href} className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${style} hover:underline`}>
                {text}
              </Link>
            ) : (
              <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${style}`}>{text}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
