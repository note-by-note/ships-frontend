'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Icon } from '@/components/marketing';
import { Alert, Spinner, cx } from '@/components/ui';
import { api } from '@/lib/api';
import { ROLE_LABELS, type Permission, type StaffOverview } from '@/lib/types';

// The staff home: what needs someone now, then the numbers at a glance.
// Counts only. Every staff role can read it, marketing included, so nothing
// here identifies anyone.

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

  return (
    <RequirePermission anyOf={['stats.view']}>
      <DashboardHeading
        title={`Welcome back, ${user?.name.split(' ')[0] ?? ''}!`}
        description={`Signed in as ${user ? ROLE_LABELS[user.role] : ''}.`}
      />

      {error ? <Alert>We could not load the overview.</Alert> : null}
      {!overview && !error ? <Spinner /> : null}

      {overview ? (
        <div className="flex max-w-4xl flex-col gap-6">
          <NeedsAttention overview={overview} can={can} />
          <AtAGlance overview={overview} />
          {overview.studentsBySchool?.length ? (
            <Panel title="Students by school">
              <ul className="grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
                {overview.studentsBySchool.map((row) => (
                  <li key={row.school} className="flex justify-between gap-4">
                    <span className="text-navy/70">{row.school}</span>
                    <strong className="tabular-nums">{row.count}</strong>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
          {!overview.emailConfigured ? (
            <p className="text-xs text-navy/50">
              Email isn’t set up yet, so missed-lesson and message notices only show on dashboards.
            </p>
          ) : null}
        </div>
      ) : null}
    </RequirePermission>
  );
}

function NeedsAttention({ overview, can }: { overview: StaffOverview; can: (permission: Permission) => boolean }) {
  const waiting = overview.waiting ?? { photos: 0, hours: 0, reports: 0, toMatch: 0 };
  const rows = [
    { count: waiting.reports, label: ['reported message', 'reported messages'], href: '/admin/messages', permission: 'messages.review' as Permission, urgent: true },
    { count: overview.applications.byStatus.submitted ?? 0, label: ['application to review', 'applications to review'], href: '/admin/applications', permission: 'applications.review' as Permission, urgent: false },
    { count: waiting.toMatch ?? 0, label: ['student waiting for a mentor', 'students waiting for a mentor'], href: '/admin/matching', permission: 'applications.review' as Permission, urgent: false },
    { count: waiting.photos, label: ['mentor photo to approve', 'mentor photos to approve'], href: '/admin/photos', permission: 'mentors.manage' as Permission, urgent: false },
    { count: waiting.hours, label: ['hours entry to approve', 'hours entries to approve'], href: '/admin/hours', permission: 'hours.approve' as Permission, urgent: false },
  ].filter((row) => row.count > 0 && can(row.permission));

  return (
    <Panel title="Needs attention">
      {!rows.length ? (
        <p className="flex items-center gap-2 text-sm text-ok">
          <Icon name="check" className="size-4" />
          You’re all caught up.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.href}>
              <Link href={row.href} className="group flex items-center gap-4 py-3">
                <span
                  className={cx(
                    'flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums',
                    row.urgent ? 'bg-danger-soft text-danger' : 'bg-gold/30 text-navy',
                  )}
                >
                  {row.count}
                </span>
                <span className="flex-1 text-sm font-medium text-navy">{row.label[row.count === 1 ? 0 : 1]}</span>
                <Icon name="arrow" className="size-4 text-navy/40 transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AtAGlance({ overview }: { overview: StaffOverview }) {
  const status = (key: string) => overview.applications.byStatus[key] ?? 0;
  const stats: [string, string | number][] = [
    ['Under review', status('under_review')],
    ['Accepted', status('accepted')],
    ['Open forms', overview.openForms],
    ['Mentors live', `${overview.mentors.published} of ${overview.mentors.total}`],
    ['Taking students', overview.mentors.accepting],
    ['Student accounts', overview.accounts.student ?? 0],
    ['Mentor accounts', overview.accounts.mentor ?? 0],
    ['Matched pairs', overview.matchRequests.accepted ?? 0],
  ];

  return (
    <Panel title="At a glance">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-navy/55">{label}</dt>
            <dd className="mt-0.5 font-display text-2xl font-bold text-navy tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
