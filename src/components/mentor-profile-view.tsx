'use client';

// The public mentor page. Loaded in the browser rather than on the server
// because who's signed in changes what can be seen: staff and test accounts
// can open test profiles, and a mentor can open their own page before it's
// published.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import type { PublicMentor } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Container, Icon } from './marketing';
import { MentorAction, useStudentStanding } from './mentor-request';
import { MentorPage } from './mentor-page';
import { Spinner } from './ui';

export function MentorProfileView({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const standing = useStudentStanding();
  const [mentor, setMentor] = useState<PublicMentor | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [problem, setProblem] = useState<'missing' | 'failed' | null>(null);

  useEffect(() => {
    if (authLoading) return;
    api
      .get<{ data: PublicMentor; meta?: { isOwner?: boolean } }>(`/mentors/${encodeURIComponent(slug)}`)
      .then((body) => {
        setMentor(body.data);
        setIsOwner(Boolean(body.meta?.isOwner));
        setProblem(null);
      })
      .catch((err: unknown) => setProblem(err instanceof ApiError && err.status === 404 ? 'missing' : 'failed'));
  }, [slug, authLoading, user?.id]);

  useEffect(() => {
    if (mentor) document.title = `${mentor.name} · Note by Note`;
  }, [mentor]);

  if (problem) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-navy">
          {problem === 'missing' ? 'This mentor page isn’t available' : 'We couldn’t load this page'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-navy/70">
          {problem === 'missing'
            ? 'The mentor may have stopped taking students, or the link may be wrong.'
            : 'Please try again in a moment.'}
        </p>
        <Link href="/find-a-mentor" className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream">
          See all mentors
        </Link>
      </Container>
    );
  }

  if (!mentor) return <Spinner label="Loading the mentor’s page" />;

  return (
    <>
      {isOwner ? (
        <div className="bg-navy text-cream">
          <Container className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <p>
              <strong>This is your page.</strong>{' '}
              {mentor.published || mentor.isTest
                ? 'Students see it from Find a Mentor.'
                : 'Only you and staff can see it until staff publish your profile.'}
            </p>
            <Link href="/dashboard/profile" className="rounded-full bg-gold px-4 py-1.5 font-semibold text-navy">
              Edit my page
            </Link>
          </Container>
        </div>
      ) : null}

      <div className="bg-cream">
        <Container className="pt-6">
          <Link href="/find-a-mentor" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/70 hover:text-navy">
            <Icon name="arrow" className="size-4 rotate-180" />
            All mentors
          </Link>
        </Container>
      </div>

      <MentorPage mentor={mentor} action={isOwner ? null : <MentorAction mentor={mentor} standing={standing} />} />
    </>
  );
}
