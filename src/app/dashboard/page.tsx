'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Avatar } from '@/components/avatar';
import { DashboardHeading, Panel, StatTile } from '@/components/dashboard-shell';
import {
  HelpPanel,
  HoursPanel,
  MessagesPanel,
  NextLessons,
  PageChecklist,
  PracticeThisWeek,
  ResourcesPanel,
  useLessonsAndMessages,
} from '@/components/dashboard-widgets';
import { Icon } from '@/components/marketing';
import { Alert, Button, ButtonLink, Spinner, StatusBadge, humanize } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { Application, MatchRequest, MentorProfile, OwnMatchRequest, ScheduleDay } from '@/lib/types';
import { APPLY_LINKS } from '@/lib/site';

// Student and mentor dashboards, after the Figma "student-dashboard" and
// "mentor-dashboard" frames: what's next, lessons, practice, messages and
// resources for both; requests, students, the mentor's page and volunteer
// hours for mentors.

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'mentor' ? <MentorDashboard /> : <StudentDashboard />;
}

function firstName(name: string) {
  return name.replace(/\s*\(test\)$/, '').split(' ')[0];
}

// --- Student ---------------------------------------------------------------------------

function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [requests, setRequests] = useState<OwnMatchRequest[] | null>(null);
  const { pairings, conversations } = useLessonsAndMessages();

  useEffect(() => {
    api.get<{ data: Application[] }>('/applications/mine').then((b) => setApplications(b.data)).catch(() => setApplications([]));
    api.get<{ data: OwnMatchRequest[] }>('/me/match-requests').then((b) => setRequests(b.data)).catch(() => setRequests([]));
  }, []);

  const mentors = (requests ?? []).filter((request) => request.status === 'accepted' && request.mentor);
  const studentApplication = applications?.find((application) => application.formKind === 'mentee');
  const matched = Boolean(pairings?.length);

  return (
    <>
      <DashboardHeading
        title={`Welcome back, ${firstName(user!.name)}!`}
        description={matched ? 'Your lessons, practice and messages.' : 'Your applications and what happens next.'}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {!matched ? (
            <NextStep application={studentApplication} loading={!applications || !requests || !pairings} />
          ) : null}
          <NextLessons pairings={pairings} />
          <PracticeThisWeek pairings={pairings} />
          <ResourcesPanel scope="shared" title="Shared with you" />

          <Panel title="Your applications" action={<Link href="/applications" className="text-sm font-semibold text-coral">See all</Link>}>
            {!applications ? (
              <Spinner />
            ) : !applications.length ? (
              <p className="text-sm text-ink-soft">
                You haven’t applied yet. <Link href="/apply" className="font-semibold underline">See what’s open</Link>.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {applications.map((application) => (
                  <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium capitalize text-ink">{application.formSlug.replace(/-/g, ' ')}</p>
                      <p className="text-xs text-ink-faint">
                        {application.submittedAt
                          ? `Sent ${new Date(application.submittedAt).toLocaleDateString()}`
                          : `Saved ${new Date(application.updatedAt).toLocaleDateString()} (not sent yet)`}
                      </p>
                      {application.requestedMentor ? (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {application.mentorRequestSent
                            ? `Passed to ${application.requestedMentor.name}. Waiting for their answer.`
                            : `Asking to learn with ${application.requestedMentor.name}`}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={application.status} />
                      {application.status === 'draft' ? (
                        <ButtonLink href={`/apply/${application.formSlug}`} size="sm">Continue</ButtonLink>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title={mentors.length > 1 ? 'Your mentors' : 'Your mentor'}>
            {!requests ? (
              <Spinner />
            ) : mentors.length ? (
              <ul className="flex flex-col gap-4">
                {mentors.map((request) => {
                  const mentor = request.mentor!;
                  const pairing = pairings?.find((entry) => entry.mentor.id === mentor.id);
                  const conversation = conversations?.find((entry) => entry.pairingId === pairing?.id);
                  return (
                    <li key={request.id} className="flex flex-col items-center gap-2 text-center">
                      <Avatar name={mentor.name} photoPath={conversation?.withPhotoPath} className="size-20 text-2xl" />
                      <p className="font-display text-lg font-bold">{mentor.name.replace(/\s*\(test\)$/, '')}</p>
                      <p className="text-xs text-ink-faint">{request.instrument}</p>
                      <div className="flex gap-2">
                        {pairing ? (
                          <Link href={`/dashboard/messages/${pairing.id}`} className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-cream">
                            Message
                          </Link>
                        ) : null}
                        <Link href={`/find-a-mentor/${mentor.slug}`} className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-navy">
                          Their page
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">
                Once you’re matched, your mentor will appear here. Matching happens after your application is reviewed.
              </p>
            )}
          </Panel>

          <MessagesPanel conversations={conversations} />

          {requests && requests.some((request) => request.status !== 'accepted') ? (
            <Panel title="Requests you’ve sent">
              <ul className="flex flex-col gap-3 text-sm">
                {requests
                  .filter((request) => request.status !== 'accepted')
                  .map((request) => (
                    <li key={request.id} className="flex items-center justify-between gap-2">
                      <span>
                        {request.mentor?.name ?? 'A mentor'} · <span className="text-ink-faint">{request.instrument}</span>
                      </span>
                      <StatusBadge status={request.status} />
                    </li>
                  ))}
              </ul>
            </Panel>
          ) : null}

          <HelpPanel />
        </div>
      </div>
    </>
  );
}

function NextStep({ application, loading }: { application?: Application; loading: boolean }) {
  if (loading) return null;

  const step = !application
    ? { title: 'Start your application', body: 'Tell us which instrument you’d like to learn and when you’re free.', href: APPLY_LINKS.student }
    : application.status === 'draft'
      ? { title: 'Finish your application', body: 'Your answers are saved. Send it when you’re ready.', href: `/apply/${application.formSlug}` }
      : application.status === 'accepted'
        ? { title: 'Accepted!', body: 'We’re finding you a mentor. You’ll see them here once you’re matched.', href: null }
        : { title: `Application ${humanize(application.status).toLowerCase()}`, body: 'Someone on the team will be in touch by email.', href: null };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-sky/40 p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-navy">
          <Icon name="music" />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">Next step</p>
          <h2 className="font-display text-xl font-bold text-navy">{step.title}</h2>
          <p className="text-sm text-navy/75">{step.body}</p>
        </div>
      </div>
      {step.href ? <ButtonLink href={step.href}>Go</ButtonLink> : null}
    </div>
  );
}

// --- Mentor -------------------------------------------------------------------------------

type OwnProfile = MentorProfile & { schedule?: ScheduleDay[] };

function MentorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OwnProfile | null | 'none'>(null);
  const [requests, setRequests] = useState<MatchRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { pairings, conversations } = useLessonsAndMessages();

  const load = useCallback(() => {
    api
      .get<{ data: OwnProfile }>('/me/mentor-profile')
      .then((body) => {
        setProfile(body.data);
        return api.get<{ data: MatchRequest[] }>(`/mentors/${body.data.id}/match-requests?limit=60`);
      })
      .then((body) => setRequests(body.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) setProfile('none');
        else setError('We could not load your dashboard.');
      });
  }, []);

  useEffect(load, [load]);

  async function respond(request: MatchRequest, status: 'accepted' | 'declined') {
    if (!profile || profile === 'none') return;
    setError(null);
    try {
      await api.patch(`/mentors/${profile.id}/match-requests/${request.id}`, { status });
      // Accepting creates a pairing, so lessons and messages change too.
      window.location.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not save.');
    }
  }

  const heading = (
    <DashboardHeading title={`Welcome, ${firstName(user!.name)}!`} description="Your students, lessons, messages and page." />
  );

  if (error && !profile) return <>{heading}<Alert>{error}</Alert></>;
  if (!profile) return <>{heading}<Spinner /></>;
  if (profile === 'none') {
    return (
      <>
        {heading}
        <Panel>
          <p className="text-ink-soft">
            Your account isn’t linked to a mentor profile yet. Once your mentor application is accepted, the team will
            set up your profile and link it here.
          </p>
          <div className="mt-4"><ButtonLink href="/applications" variant="secondary">My applications</ButtonLink></div>
        </Panel>
      </>
    );
  }

  const pending = (requests ?? []).filter((request) => request.status === 'pending');
  const students = (requests ?? []).filter((request) => request.status === 'accepted');
  const unread = (conversations ?? []).reduce((sum, conversation) => sum + conversation.unread, 0);

  return (
    <>
      {heading}
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="New requests" value={pending.length} />
        <StatTile label="Your students" value={students.length} />
        <StatTile label="Unread messages" value={unread} />
        <StatTile
          label="Your page"
          value={profile.published || profile.isTest ? 'Live' : 'Hidden'}
          hint={profile.published || profile.isTest ? 'Visible on Find a Mentor' : 'Staff publish pages once checked'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {pending.length ? (
            <Panel title="Requests waiting for you">
              <ul className="flex flex-col gap-4">
                {pending.map((request) => (
                  <li key={request.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                          {request.student?.firstName || 'A student'}
                          {request.application ? (
                            <span className="rounded-md bg-ok-soft px-2 py-0.5 text-xs font-semibold text-ok">
                              Application approved
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-ink-soft">
                          {request.instrument} · {request.student?.experienceLevel ?? 'Level not given'} · ages {request.student?.ageGroup ?? 'not given'}
                        </p>
                        <p className="mt-1 text-xs text-ink-faint">
                          Prefers {[...(request.preferredDays ?? []), ...(request.preferredTimes ?? [])].join(', ') || 'any time'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => respond(request, 'accepted')}>Accept</Button>
                        <Button size="sm" variant="secondary" onClick={() => respond(request, 'declined')}>Decline</Button>
                      </div>
                    </div>
                    {request.message ? <p className="mt-3 rounded-lg bg-paper p-3 text-sm text-ink-soft">“{request.message}”</p> : null}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <NextLessons pairings={pairings} />

          <Panel title="Your students">
            {!requests ? (
              <Spinner />
            ) : !students.length ? (
              <p className="text-sm text-ink-soft">
                Students you accept appear here. New requests show up above when students ask for you.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {students.map((request) => {
                  const pairing = pairings?.find((entry) => entry.id === request.id);
                  return (
                    <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-ink">{request.student?.firstName || request.requester?.name}</p>
                        <p className="text-xs text-ink-faint">
                          {request.instrument} · {request.student?.experienceLevel}
                          {request.requester?.email ? (
                            <>
                              {' · '}
                              <a href={`mailto:${request.requester.email}`} className="text-coral">
                                {request.requester.email}
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                      {pairing ? (
                        <div className="flex gap-2">
                          <Link href={`/dashboard/messages/${pairing.id}`} className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-navy hover:bg-paper">
                            Message
                          </Link>
                          <Link href="/dashboard/lessons" className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-navy hover:bg-paper">
                            Notes
                          </Link>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <MessagesPanel conversations={conversations} />
        </div>

        <div className="flex flex-col gap-6">
          <PageChecklist profile={profile} />
          <HoursPanel />
          <ResourcesPanel scope="team" title="From the Note by Note team" />
          <HelpPanel />
        </div>
      </div>
    </>
  );
}
