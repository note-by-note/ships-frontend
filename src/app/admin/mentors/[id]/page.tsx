'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { MentorProfileForm } from '@/components/mentor-profile-form';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { TextInput } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import type { MentorProfile } from '@/lib/types';

export default function EditMentorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { can } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: MentorProfile }>(`/staff/mentors/${id}`)
      .then((body) => setMentor(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We could not load this profile.'));
  }, [id]);

  useEffect(load, [load]);

  const editable = can('mentors.manage');

  return (
    <RequirePermission anyOf={['mentors.view', 'mentors.manage']}>
      <Link href="/admin/mentors" className="mb-4 inline-block text-sm text-navy/70 hover:underline">
        ← All mentors
      </Link>

      {error ? <Alert>{error}</Alert> : null}
      {!mentor && !error ? <Spinner /> : null}

      {mentor ? (
        <>
          <DashboardHeading
            title={mentor.name}
            description={
              <span className="flex flex-wrap gap-1.5">
                <Badge tone={mentor.published ? 'ok' : 'neutral'}>{mentor.published ? 'Published' : 'Hidden'}</Badge>
                {mentor.verified ? <Badge tone="accent">Verified</Badge> : null}
                {mentor.isTest ? <Badge tone="warn">Test profile</Badge> : null}
              </span>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Panel title={editable ? 'Profile' : 'Profile (read only)'}>
              {editable ? (
                <MentorProfileForm
                  key={mentor.id}
                  profile={mentor}
                  staff
                  onSave={async (values) => {
                    const body = await api.patch<{ data: MentorProfile }>(`/mentors/${mentor.id}`, values);
                    setMentor({ ...body.data, account: mentor.account });
                  }}
                />
              ) : (
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-ink-faint">Instruments</dt><dd>{mentor.instruments.join(', ')}</dd></div>
                  <div><dt className="text-ink-faint">Languages</dt><dd>{mentor.languages.join(', ')}</dd></div>
                  <div><dt className="text-ink-faint">Levels</dt><dd>{mentor.experienceLevels.join(', ') || '—'}</dd></div>
                  <div><dt className="text-ink-faint">Ages</dt><dd>{mentor.ageGroups.join(', ') || '—'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-ink-faint">Short bio</dt><dd>{mentor.shortBio || '—'}</dd></div>
                </dl>
              )}
            </Panel>

            <AccountLink mentor={mentor} editable={editable} onChange={(account) => setMentor({ ...mentor, account })} />
          </div>
        </>
      ) : null}
    </RequirePermission>
  );
}

function AccountLink({
  mentor,
  editable,
  onChange,
}: {
  mentor: MentorProfile;
  editable: boolean;
  onChange: (account: MentorProfile['account']) => void;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function link(accountEmail: string | null) {
    setBusy(true);
    setError(null);
    try {
      const body = await api.post<{ data: MentorProfile }>(`/staff/mentors/${mentor.id}/link`, { accountEmail });
      onChange(body.data.account ?? null);
      setEmail('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Linked account" className="h-max">
      {mentor.account ? (
        <div className="flex flex-col gap-3 text-sm">
          <p>
            <strong>{mentor.account.name}</strong>
            <br />
            <span className="text-ink-soft">{mentor.account.email}</span>
          </p>
          <p className="text-xs text-ink-faint">They can edit this profile and see its match requests from their dashboard.</p>
          {editable ? (
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => link(null)}>
              Unlink
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-ink-soft">Not linked yet. Nobody can edit this profile except staff.</p>
          {editable ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) void link(email.trim());
              }}
            >
              <TextInput
                type="email"
                aria-label="Account email"
                placeholder="their-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={busy || !email.trim()}>
                Link account
              </Button>
              <p className="text-xs text-ink-faint">They must have registered first. Linking makes them a mentor account.</p>
            </form>
          ) : null}
        </div>
      )}
      {error ? <div className="mt-3"><Alert>{error}</Alert></div> : null}
    </Panel>
  );
}
