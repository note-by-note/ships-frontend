'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading } from '@/components/dashboard-shell';
import { Badge, ButtonLink, Card, EmptyState, Spinner } from '@/components/ui';
import { TextInput } from '@/components/ui/fields';
import { api } from '@/lib/api';
import type { MentorListing } from '@/lib/types';

export default function StaffMentorsPage() {
  const { can } = useAuth();
  const [mentors, setMentors] = useState<MentorListing[] | null>(null);
  const [query, setQuery] = useState('');
  const [includeTest, setIncludeTest] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (includeTest) params.set('includeTest', '1');
    api
      .get<{ data: MentorListing[] }>(`/staff/mentors?${params.toString()}`)
      .then((body) => setMentors(body.data))
      .catch(() => setMentors([]));
  }, [includeTest]);

  const visible = (mentors ?? []).filter((mentor) =>
    `${mentor.name} ${mentor.instruments.join(' ')} ${mentor.account?.email ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <RequirePermission anyOf={['mentors.view', 'mentors.manage']}>
      <DashboardHeading
        title="Mentors"
        description="Every mentor profile, including unpublished ones. A profile becomes someone’s once it’s linked to their account."
        actions={can('mentors.manage') ? <ButtonLink href="/admin/mentors/new">Add a mentor</ButtonLink> : null}
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <TextInput
          type="search"
          aria-label="Search mentors"
          placeholder="Search by name, instrument or email"
          className="max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} className="size-4 accent-accent" />
          Show test profiles
        </label>
      </div>

      {!mentors ? (
        <Spinner />
      ) : !visible.length ? (
        <EmptyState
          title={mentors.length ? 'No mentors match' : 'No mentor profiles yet'}
          description={can('mentors.manage') ? 'Add one with the button above.' : undefined}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs tracking-wide text-ink-faint uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mentor</th>
                <th scope="col" className="px-4 py-3 font-medium">Instruments</th>
                <th scope="col" className="px-4 py-3 font-medium">Account</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link href={`/admin/mentors/${mentor.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                      {mentor.name}
                    </Link>
                    {mentor.isTest ? <Badge tone="warn" className="ml-2">Test</Badge> : null}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{mentor.instruments.join(', ')}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {mentor.account ? mentor.account.email : <span className="text-ink-faint">Not linked</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={mentor.published ? 'ok' : 'neutral'}>{mentor.published ? 'Published' : 'Hidden'}</Badge>
                      {mentor.verified ? <Badge tone="accent">Verified</Badge> : null}
                      {!mentor.acceptingStudents ? <Badge tone="warn">Full</Badge> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </RequirePermission>
  );
}
