'use client';

// "What's next" after an application is accepted: a short checklist that
// ticks itself off from real data, with the next thing to do as a button.
//
//   student: choose a mentor → mentor says yes → agree a weekly time → join
//   mentor:  set up your page → set your free times → page goes live →
//            accept a student → agree a lesson time
//   volunteer: the team gets in touch about the role

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Application, MentorProfile, OwnMatchRequest, Pairing, ScheduleDay } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Spinner, cx } from './ui';

interface Step {
  label: string;
  /** Shown under the label while it's the current step. */
  detail?: string;
  done: boolean;
  /** A step that waits on someone else has no button. */
  action?: { href: string; label: string; external?: boolean };
}

type OwnProfile = MentorProfile & { schedule?: ScheduleDay[] };

function useStepData(kind: Application['formKind']) {
  const [pairings, setPairings] = useState<Pairing[] | null>(null);
  const [requests, setRequests] = useState<OwnMatchRequest[] | null>(null);
  const [profile, setProfile] = useState<OwnProfile | 'none' | null>(null);

  useEffect(() => {
    if (kind === 'job') return;
    api.get<{ data: Pairing[] }>('/lessons').then((body) => setPairings(body.data)).catch(() => setPairings([]));
    if (kind === 'mentee') {
      api.get<{ data: OwnMatchRequest[] }>('/me/match-requests').then((body) => setRequests(body.data)).catch(() => setRequests([]));
    } else {
      api
        .get<{ data: OwnProfile }>('/me/mentor-profile')
        .then((body) => setProfile(body.data))
        .catch(() => setProfile('none'));
    }
  }, [kind]);

  return { pairings, requests, profile };
}

function studentSteps(application: Application, pairings: Pairing[], requests: OwnMatchRequest[]): Step[] {
  const asked = requests.find((request) => request.status === 'pending' || request.status === 'accepted');
  const chosen = application.requestedMentor?.name ?? asked?.mentor?.name;
  const paired = pairings.find((pairing) => pairing.side === 'student');
  const withTime = pairings.find((pairing) => pairing.side === 'student' && pairing.lesson);

  return [
    { label: 'Application accepted', done: true },
    {
      label: chosen ? `You asked ${chosen.replace(/\s*\(test\)$/, '')} to be your mentor` : 'Choose a mentor',
      detail: 'Look through the mentors and send a request to the one you’d like to learn with.',
      done: Boolean(chosen || paired),
      action: { href: '/find-a-mentor', label: 'Find a mentor' },
    },
    {
      label: 'Your mentor says yes',
      detail: 'They answer from their dashboard. You’ll see them here as soon as they do.',
      done: Boolean(paired),
    },
    {
      label: 'Agree a weekly lesson time',
      detail: 'Propose a time that suits you inside your mentor’s free hours, or answer theirs.',
      done: Boolean(withTime),
      action: { href: '/dashboard/lessons', label: 'Propose a time' },
    },
    {
      label: 'Join your first lesson',
      detail: paired?.meetingUrl ? 'Use the video call link at lesson time.' : 'Your mentor adds the video call link on the Lessons page.',
      done: false,
      action: paired?.meetingUrl ? { href: paired.meetingUrl, label: 'Join lesson', external: true } : { href: '/dashboard/lessons', label: 'See your lessons' },
    },
  ];
}

function mentorSteps(profile: OwnProfile | 'none', pairings: Pairing[]): Step[] {
  if (profile === 'none') {
    return [
      { label: 'Application accepted', done: true },
      {
        label: 'The team sets up your mentor page',
        detail: 'It appears in your dashboard as soon as it’s linked to your account. Reload the page if you don’t see it yet.',
        done: false,
      },
    ];
  }
  const pageStarted = Boolean((profile.about || profile.shortBio) && profile.instruments.length);
  const freeTimes = Boolean(profile.schedule?.some((day) => day.slots.length));
  const students = pairings.filter((pairing) => pairing.side === 'mentor');

  return [
    { label: 'Application accepted', done: true },
    {
      label: 'Set up your mentor page',
      detail: 'Add a photo, a few lines about you and how you teach. Students read this before choosing you.',
      done: pageStarted,
      action: { href: '/dashboard/profile', label: 'Set up my page' },
    },
    {
      label: 'Set your weekly free times',
      detail: 'Mark the hours you could teach. Students pick lesson times inside them.',
      done: freeTimes,
      action: { href: '/dashboard/availability', label: 'Set my times' },
    },
    {
      label: 'Your page goes live',
      detail: 'Staff check your page and publish it on Find a Mentor.',
      done: profile.published || Boolean(profile.isTest),
    },
    {
      label: 'Accept your first student',
      detail: 'Requests show up on your dashboard. Accept one to start.',
      done: students.length > 0,
      action: { href: '/dashboard', label: 'See requests' },
    },
    {
      label: 'Agree a weekly lesson time',
      detail: 'Propose a time to your student, or answer theirs, and add your video call link.',
      done: students.some((pairing) => pairing.lesson),
      action: { href: '/dashboard/lessons', label: 'Propose a time' },
    },
  ];
}

export function NextSteps({
  application,
  hideWhenDone = false,
  className,
}: {
  application: Application;
  /** On dashboards, disappear once every step is done. */
  hideWhenDone?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const { pairings, requests, profile } = useStepData(application.formKind);

  if (application.formKind === 'job') {
    return (
      <div className={cx('rounded-2xl bg-sage/25 p-5', className)}>
        <p className="font-display text-lg font-bold text-navy">What’s next</p>
        <p className="mt-1 text-sm text-navy/80">
          Someone from the team will be in touch by email about your role.
          {user?.isStaff ? (
            <>
              {' '}
              You can already{' '}
              <Link href="/admin/my-hours" className="font-semibold underline underline-offset-2">
                log your volunteer hours
              </Link>
              .
            </>
          ) : null}
        </p>
      </div>
    );
  }

  const loading = !pairings || (application.formKind === 'mentee' ? !requests : !profile);
  if (loading) return <Spinner label="Loading your next steps" />;

  const steps =
    application.formKind === 'mentee' ? studentSteps(application, pairings, requests ?? []) : mentorSteps(profile!, pairings);
  // The last student step ("join your lesson") is ongoing, so it never counts against being done.
  const countable = application.formKind === 'mentee' ? steps.slice(0, -1) : steps;
  const allDone = countable.every((step) => step.done);
  if (hideWhenDone && allDone) return null;
  const current = steps.findIndex((step) => !step.done);

  return (
    <section className={cx('rounded-2xl bg-sky/30 p-5 sm:p-6', className)} aria-label="What’s next">
      <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">You’re accepted</p>
      <h2 className="font-display text-xl font-bold text-navy">What’s next</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          return (
            <li key={step.label} className={cx('flex gap-3', !isCurrent && !step.done && 'opacity-60')}>
              <span
                aria-hidden
                className={cx(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  step.done ? 'bg-sage text-white' : isCurrent ? 'bg-navy text-cream' : 'border border-navy/30 text-navy/60',
                )}
              >
                {step.done ? '✓' : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cx('text-sm', step.done ? 'text-navy/60' : 'font-semibold text-navy')}>
                  {step.label}
                  <span className="sr-only">{step.done ? ' (done)' : isCurrent ? ' (next)' : ''}</span>
                </p>
                {isCurrent && step.detail ? <p className="mt-0.5 text-sm text-navy/75">{step.detail}</p> : null}
                {isCurrent && step.action ? (
                  step.action.external ? (
                    <a
                      href={step.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"
                    >
                      {step.action.label}
                    </a>
                  ) : (
                    <Link
                      href={step.action.href}
                      className="mt-2 inline-block rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"
                    >
                      {step.action.label}
                    </Link>
                  )
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
