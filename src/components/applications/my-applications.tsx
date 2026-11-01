'use client';

// The signed-in person's applications: continue a draft, withdraw one, start
// again after withdrawing, and see what to do next once accepted.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import type { Application } from '@/lib/types';
import { useAuth } from './auth-provider';
import { NextSteps } from './next-steps';
import { Alert, Button, ButtonLink, Card, EmptyState, Spinner, StatusBadge } from './ui';

/** Statuses an applicant can still withdraw from (the API's list). */
const WITHDRAWABLE = ['draft', 'submitted', 'under_review', 'waitlisted', 'accepted'];

const KIND_LABEL: Record<Application['formKind'], string> = {
  mentee: 'Student application',
  mentor: 'Mentor application',
  job: 'Volunteer application',
};

export function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: Application[] }>('/applications/mine')
      .then((body) => setApplications(body.data))
      .catch(() => setApplications([]));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function withdraw(application: Application) {
    const what =
      application.status === 'draft'
        ? 'This application hasn’t been sent. Withdraw it?'
        : application.status === 'accepted'
          ? 'You’ve been accepted. Withdrawing tells the team you no longer want a place, and cancels any mentor request that hasn’t been answered. Withdraw?'
          : 'Withdraw this application? The team will stop reviewing it.';
    if (!window.confirm(`${what}\n\nYou can apply again later, and your answers will be kept.`)) return;
    setBusy(application.id);
    setError(null);
    try {
      await api.post(`/applications/${application.id}/withdraw`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  if (authLoading) return <Spinner />;

  if (!user) {
    return (
      <EmptyState
        title="Sign in to see your applications"
        description="Your saved progress and any decisions live behind your account."
        action={<ButtonLink href="/login">Sign in</ButtonLink>}
      />
    );
  }

  if (!applications) return <Spinner />;

  if (!applications.length) {
    return (
      <EmptyState
        title="You have not applied yet"
        description="Open applications are listed on the apply page."
        action={<ButtonLink href="/apply">See what is open</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      {applications.map((application) => (
        <Card key={application.id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-medium text-ink">{KIND_LABEL[application.formKind] ?? application.formSlug.replace(/-/g, ' ')}</h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {application.status === 'withdrawn'
                  ? `Withdrawn. You can apply again whenever you like.`
                  : application.submittedAt
                    ? `Sent ${new Date(application.submittedAt).toLocaleDateString()}`
                    : `Saved ${new Date(application.updatedAt).toLocaleDateString()} (not sent yet)`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {application.status === 'draft' ? (
                <ButtonLink href={`/apply/${application.formSlug}`}>Continue</ButtonLink>
              ) : application.status === 'withdrawn' ? (
                <ButtonLink href={`/apply/${application.formSlug}`} variant="secondary">
                  Apply again
                </ButtonLink>
              ) : (
                <Link href={`/apply/${application.formSlug}`} className="text-sm font-medium text-accent underline underline-offset-2">
                  View
                </Link>
              )}
              {WITHDRAWABLE.includes(application.status) ? (
                <Button size="sm" variant="ghost" disabled={busy === application.id} onClick={() => withdraw(application)}>
                  {busy === application.id ? 'Withdrawing…' : 'Withdraw'}
                </Button>
              ) : null}
            </div>
          </div>

          {application.status === 'accepted' ? <NextSteps application={application} className="mt-5" /> : null}
        </Card>
      ))}
    </div>
  );
}
