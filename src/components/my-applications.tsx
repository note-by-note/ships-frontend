'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Application } from '@/lib/types';
import { useAuth } from './auth-provider';
import { ButtonLink, Card, EmptyState, Spinner, StatusBadge } from './ui';

export function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ data: Application[] }>('/applications/mine')
      .then((body) => setApplications(body.data))
      .catch(() => setApplications([]));
  }, [user]);

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
    <div className="space-y-3">
      {applications.map((application) => (
        <Card key={application.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="font-medium text-ink">{application.formSlug.replace(/-/g, ' ')}</h2>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {application.submittedAt
                ? `Sent ${new Date(application.submittedAt).toLocaleDateString()}`
                : `Saved ${new Date(application.updatedAt).toLocaleDateString()} (not sent yet)`}
            </p>
          </div>

          {application.status === 'draft' ? (
            <ButtonLink href={`/apply/${application.formSlug}`}>Continue</ButtonLink>
          ) : (
            <Link
              href={`/apply/${application.formSlug}`}
              className="text-sm font-medium text-accent underline underline-offset-2"
            >
              View
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
}
