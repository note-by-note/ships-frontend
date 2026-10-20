'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel, StatTile } from '@/components/dashboard-shell';
import { Icon } from '@/components/marketing';
import { Alert, Badge, Button, ButtonLink, Spinner, StatusBadge, humanize } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { DAY_NAMES, formatDate, formatRange, zoneLabel } from '@/lib/schedule';
import type { Application, MatchRequest, MentorProfile, OwnMatchRequest, Pairing } from '@/lib/types';

// Student and mentor dashboards, after the Figma "student-dashboard" and
// "mentor-dashboard" frames. Only sections with real data behind them are
// shown; lessons, notes and messaging are listed as coming later.

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

  useEffect(() => {
    api.get<{ data: Application[] }>('/applications/mine').then((b) => setApplications(b.data)).catch(() => setApplications([]));
    api.get<{ data: OwnMatchRequest[] }>('/me/match-requests').then((b) => setRequests(b.data)).catch(() => setRequests([]));
  }, []);

  const mentor = requests?.find((request) => request.status === 'accepted')?.mentor ?? null;
  const studentApplication = applications?.find((application) => application.formKind === 'mentee');

  return (
    <>
      <DashboardHeading
        title={`Welcome back, ${firstName(user!.name)}!`}
        description="Your applications, your mentor and what happens next."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <NextStep application={studentApplication} hasMentor={Boolean(mentor)} loading={!applications || !requests} />
          <LessonsSummary />

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

          <ComingLater items={['Meeting links for lessons', 'Lesson notes and practice assignments', 'Messages with your mentor']} />
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Your mentor">
            {!requests ? (
              <Spinner />
            ) : mentor ? (
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-sky/50 font-display text-2xl font-bold text-navy">
                  {mentor.name.charAt(0)}
                </span>
                <p className="font-display text-lg font-bold">{mentor.name}</p>
                <Link href={`/find-a-mentor`} className="text-sm font-semibold text-coral">About mentors</Link>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">
                Once you’re matched, your mentor will appear here. Matching happens after your application is reviewed.
              </p>
            )}
          </Panel>

          {requests && requests.length ? (
            <Panel title="Requests you’ve sent">
              <ul className="flex flex-col gap-3 text-sm">
                {requests.map((request) => (
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

          <section className="rounded-2xl bg-navy p-6 text-cream">
            <h2 className="font-display text-lg font-bold text-cream">Need help?</h2>
            <p className="mt-1 text-sm text-cream/75">Questions about lessons or your application?</p>
            <div className="mt-4 flex gap-3 text-sm font-semibold">
              <Link href="/faq" className="rounded-full bg-gold px-4 py-2 text-navy">FAQ</Link>
              <Link href="/contact" className="rounded-full border border-cream/40 px-4 py-2">Contact</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function NextStep({ application, hasMentor, loading }: { application?: Application; hasMentor: boolean; loading: boolean }) {
  if (loading) return null;

  const step = hasMentor
    ? { title: 'You’re matched', body: 'Your mentor will be in touch to set up your first lesson.', href: null }
    : !application
      ? { title: 'Start your application', body: 'Tell us which instrument you’d like to learn and when you’re free.', href: '/apply' }
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

function ComingLater({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border-2 border-dashed border-navy/15 p-6">
      <h2 className="font-display text-lg font-bold text-navy/70">Coming later</h2>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-navy/55">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </section>
  );
}

// --- Mentor -------------------------------------------------------------------------------

function MentorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MentorProfile | null | 'none'>(null);
  const [requests, setRequests] = useState<MatchRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: MentorProfile }>('/me/mentor-profile')
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
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not save.');
    }
  }

  const heading = (
    <DashboardHeading title={`Welcome, ${firstName(user!.name)}!`} description="Your students, requests and profile." />
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

  return (
    <>
      {heading}
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="New requests" value={pending.length} />
        <StatTile label="Your students" value={students.length} />
        <StatTile
          label="Profile"
          value={profile.published ? 'Live' : 'Hidden'}
          hint={profile.published ? 'Visible on Find a Mentor' : 'Staff publish profiles once checked'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <LessonsSummary />
          <Panel title="Requests waiting for you">
            {!requests ? (
              <Spinner />
            ) : !pending.length ? (
              <p className="text-sm text-ink-soft">No new requests right now.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {pending.map((request) => (
                  <li key={request.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{request.student?.firstName || 'A student'}</p>
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
            )}
          </Panel>

          <Panel title="Your students">
            {!students.length ? (
              <p className="text-sm text-ink-soft">Students you accept will appear here, with their contact details.</p>
            ) : (
              <ul className="divide-y divide-line">
                {students.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-ink">{request.student?.firstName || request.requester?.name}</p>
                      <p className="text-xs text-ink-faint">{request.instrument} · {request.student?.experienceLevel}</p>
                    </div>
                    {request.requester ? (
                      <a href={`mailto:${request.requester.email}`} className="text-sm font-semibold text-coral">
                        {request.requester.email}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <ComingLater items={['Google Meet links for lessons', 'Lesson notes and practice assignments', 'Volunteer hours log']} />
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Your profile" action={<Link href="/dashboard/profile" className="text-sm font-semibold text-coral">Edit</Link>}>
            <p className="font-display text-lg font-bold">{profile.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.instruments.map((instrument) => <Badge key={instrument}>{instrument}</Badge>)}
            </div>
            <p className="mt-3 text-sm text-ink-soft">{profile.shortBio || 'Add a short bio so students know who you are.'}</p>
            <p className="mt-3 text-xs text-ink-faint">
              {profile.acceptingStudents ? 'Accepting new students' : 'Not accepting new students'}
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

// --- Lessons summary (both sides) -----------------------------------------------------------

/** Each weekly lesson, plus anything waiting on this person: a new notice or a proposal to answer. */
function LessonsSummary() {
  const [pairings, setPairings] = useState<Pairing[] | null>(null);

  useEffect(() => {
    api.get<{ data: Pairing[] }>('/lessons').then((body) => setPairings(body.data)).catch(() => setPairings([]));
  }, []);

  if (!pairings || !pairings.length) return null;

  return (
    <Panel title="Lessons" action={<Link href="/dashboard/lessons" className="text-sm font-semibold text-coral">Manage</Link>}>
      <ul className="flex flex-col gap-3">
        {pairings.map((pairing) => {
          const other = (pairing.side === 'mentor' ? pairing.student : pairing.mentor).name.replace(/\s*\(test\)$/, '');
          const notices = pairing.absences.filter((absence) => absence.reporterSide !== pairing.side && !absence.acknowledgedAt);
          const toAnswer = pairing.proposal && pairing.proposal.proposedBy !== pairing.side;
          return (
            <li key={pairing.id} className="rounded-xl bg-paper p-4">
              <p className="font-semibold text-ink">
                {other} · <span className="font-normal text-ink-soft">{pairing.instrument}</span>
              </p>
              <p className="text-sm text-ink-soft">
                {pairing.lesson
                  ? `${DAY_NAMES[pairing.lesson.day]}s, ${formatRange(pairing.lesson.start, pairing.lesson.durationMinutes)} (${zoneLabel(pairing.timeZone)})`
                  : 'No weekly time agreed yet'}
              </p>
              {toAnswer ? (
                <p className="mt-2 text-sm font-semibold text-warn">{other} proposed a new time. Answer it on the Lessons page.</p>
              ) : null}
              {notices.map((notice) => (
                <p key={notice.id} className="mt-2 text-sm font-semibold text-coral">
                  {other} can’t make {formatDate(notice.date)}
                  {notice.message ? `: “${notice.message}”` : ''}
                </p>
              ))}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
