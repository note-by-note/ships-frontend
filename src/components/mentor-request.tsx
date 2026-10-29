'use client';

// What a visitor can do about one mentor, shared by Find a Mentor's cards and
// the mentor's own page:
//   - anyone who hasn't been accepted as a student applies to learn with them
//     (the student application opens with the mentor named on it)
//   - an accepted student sends a request straight away (RequestDialog)
//   - staff are pointed to Test mode, since staff aren't students
//   - someone already learning with the mentor, or waiting on their answer,
//     sees that instead of being asked to apply again

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { APPLY_LINKS } from '@/lib/site';
import type { Application, Options, OwnMatchRequest } from '@/lib/types';
import { sidesOf, useAuth } from './auth-provider';
import { Icon } from './marketing';
import { cx } from './ui';
import { ConductGate } from './conduct-acceptance';

/** The fields a request needs to know about a mentor. */
export interface RequestableMentor {
  id: string;
  name: string;
  slug: string;
  instruments: string[];
  acceptingStudents?: boolean;
  isTest?: boolean;
}

export function firstNameOf(name: string): string {
  return name.replace(/\s*\(test\)$/, '').split(' ')[0];
}

export interface StudentStanding {
  /** Where "Apply to learn with…" goes, or undefined when this person requests directly (or is staff). */
  applyHref: (slug: string) => string | undefined;
  /** Whether this mentor is the one named on the student's application. */
  chosen: (slug: string) => boolean;
  /** This person's lessons with the mentor: already learning, waiting on an answer, or neither. */
  withMentor: (slug: string) => 'accepted' | 'pending' | null;
}

/** Load the signed-in student's applications once, for every mentor on the page. */
export function useStudentStanding(): StudentStanding {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [requests, setRequests] = useState<OwnMatchRequest[]>([]);

  useEffect(() => {
    if (!user || (user.isStaff && !sidesOf(user).student)) return;
    api
      .get<{ data: Application[] }>('/applications/mine')
      .then((body) => setApplications(body.data))
      .catch(() => setApplications([]));
    api
      .get<{ data: OwnMatchRequest[] }>('/me/match-requests')
      .then((body) => setRequests(body.data))
      .catch(() => setRequests([]));
  }, [user]);

  const studentApplication =
    user && !(user.isStaff && !sidesOf(user).student)
      ? applications.find((application) => application.formKind === 'mentee' && application.status !== 'withdrawn')
      : undefined;
  const accepted = studentApplication?.status === 'accepted';
  const chosenSlug = accepted ? undefined : studentApplication?.requestedMentor?.slug;
  // Staff who don't take lessons are pointed to Test mode instead.
  const staff = Boolean(user?.isStaff && !sidesOf(user).student);

  return useMemo(
    () => ({
      applyHref: (slug: string) =>
        staff || accepted ? undefined : `${APPLY_LINKS.student}?mentor=${encodeURIComponent(slug)}`,
      chosen: (slug: string) => chosenSlug === slug,
      withMentor: (slug: string) => {
        const mine = requests.filter((request) => request.mentor?.slug === slug);
        if (mine.some((request) => request.status === 'accepted')) return 'accepted';
        if (mine.some((request) => request.status === 'pending')) return 'pending';
        return null;
      },
    }),
    [staff, accepted, chosenSlug, requests],
  );
}

/** The one button for a mentor: apply, see the application, or request. */
export function MentorAction({
  mentor,
  standing,
  className,
}: {
  mentor: RequestableMentor;
  standing: StudentStanding;
  className?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const applyHref = standing.applyHref(mentor.slug);
  const already = standing.withMentor(mentor.slug);
  const base = 'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors';
  const solid = 'bg-navy text-cream hover:bg-navy/90';

  let action: ReactNode;
  if (user?.mentorProfile?.id === mentor.id) {
    // Mentors can ask other mentors for lessons, never themselves.
    action = (
      <Link href="/dashboard/profile" className={cx(base, 'border-2 border-navy py-2.5 text-navy hover:bg-navy/5', className)}>
        This is you: edit your page
      </Link>
    );
  } else if (already === 'accepted') {
    action = (
      <Link href="/dashboard/lessons" className={cx(base, 'border-2 border-navy py-2.5 text-navy hover:bg-navy/5', className)}>
        <span aria-hidden>✓</span> Your mentor: see your lessons
      </Link>
    );
  } else if (already === 'pending') {
    action = (
      <Link href="/dashboard" className={cx(base, 'border-2 border-navy py-2.5 text-navy hover:bg-navy/5', className)}>
        Request sent: waiting for {firstNameOf(mentor.name)}
      </Link>
    );
  } else if (mentor.acceptingStudents === false) {
    action = (
      <button type="button" disabled className={cx(base, 'cursor-not-allowed bg-navy/30 text-cream', className)}>
        Not taking new students
      </button>
    );
  } else if (applyHref && standing.chosen(mentor.slug)) {
    action = (
      <Link href={applyHref} className={cx(base, 'border-2 border-navy py-2.5 text-navy hover:bg-navy/5', className)}>
        <span aria-hidden>✓</span> On your application
      </Link>
    );
  } else if (applyHref) {
    action = (
      <Link href={applyHref} className={cx(base, solid, className)}>
        Apply to learn with {firstNameOf(mentor.name)}
      </Link>
    );
  } else {
    action = (
      <button type="button" onClick={() => setOpen(true)} className={cx(base, solid, className)}>
        Request {firstNameOf(mentor.name)}
      </button>
    );
  }

  return (
    <>
      {action}
      {open ? <RequestDialog mentor={mentor} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** Sends a match request to one mentor. Signs people in first if needed. */
export function RequestDialog({ mentor, onClose }: { mentor: RequestableMentor; onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const pathname = usePathname();
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState({
    instrument: mentor.instruments[0] ?? '',
    firstName: user?.name.replace(/\s*\(test\)$/, '').split(' ')[0] ?? '',
    ageGroup: '',
    experienceLevel: 'Beginner',
    preferredDays: [] as string[],
    preferredTimes: [] as string[],
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get<{ data: Options }>('/options').then((body) => setOptions(body.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggle(field: 'preferredDays' | 'preferredTimes', value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value) ? current[field].filter((entry) => entry !== value) : [...current[field], value],
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post(`/mentors/${mentor.id}/match-requests`, {
        instrument: form.instrument,
        preferredDays: form.preferredDays,
        preferredTimes: form.preferredTimes,
        message: form.message.trim() || undefined,
        student: { firstName: form.firstName.trim(), ageGroup: form.ageGroup, experienceLevel: form.experienceLevel },
      });
      setSent(true);
      // A mentor asking for lessons now has a student side to their dashboard.
      if (user?.role === 'mentor' && !user.alsoStudent) void refreshUser();
    } catch (err) {
      // A 422 carries per-field reasons; show those rather than a bare "Validation failed".
      const details = err instanceof ApiError && err.details && typeof err.details === 'object'
        ? Object.values(err.details as Record<string, unknown>).filter((value): value is string => typeof value === 'string')
        : [];
      setError(
        details.length
          ? `Please check the form: ${details.join(' ')}`
          : err instanceof ApiError
            ? err.message
            : 'We couldn’t send that request. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  const firstName = mentor.name.replace(/\s*\(test\)$/, '').split(' ')[0];

  let content: ReactNode;
  if (!user) {
    content = (
      <>
        <p className="text-navy/75">Sign in or create a free account to send {firstName} a request.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream">
            Sign in
          </Link>
          <Link href="/register" className="rounded-full border-2 border-navy px-6 py-3 text-sm font-semibold text-navy">
            Create an account
          </Link>
        </div>
      </>
    );
  } else if (user.isStaff && !sidesOf(user).student) {
    content = (
      <p className="text-navy/75">
        To take lessons yourself, <Link href={APPLY_LINKS.student} className="font-semibold underline">apply as a student</Link>{' '}
        first. To try this as a student would, open{' '}
        <Link href="/admin/testing" className="font-semibold underline">Test mode</Link>, switch to a test student and
        request a test mentor.
      </p>
    );
  } else if (!user.agreements?.conduct && !sent) {
    // Asking a mentor for lessons needs the Code of Conduct accepted first.
    content = <ConductGate action={`ask ${firstName} for lessons`} />;
  } else if (sent) {
    content = (
      <>
        <p className="text-navy/75">
          Request sent to {firstName}. You’ll see their answer on your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream">
            Go to my dashboard
          </Link>
          <button type="button" onClick={onClose} className="rounded-full border-2 border-navy px-6 py-3 text-sm font-semibold text-navy">
            Keep browsing
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error ? <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy/70">
            Instrument
            <select
              required
              value={form.instrument}
              onChange={(e) => setForm({ ...form, instrument: e.target.value })}
              className="rounded-lg border border-navy/15 bg-white p-2.5 font-normal text-navy"
            >
              {mentor.instruments.map((instrument) => <option key={instrument}>{instrument}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy/70">
            Student’s first name
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="rounded-lg border border-navy/15 bg-white p-2.5 font-normal text-navy"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy/70">
            Student’s age
            <select
              required
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              className="rounded-lg border border-navy/15 bg-white p-2.5 font-normal text-navy"
            >
              <option value="">Choose…</option>
              {(options?.ageGroups ?? []).map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy/70">
            Experience
            <select
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              className="rounded-lg border border-navy/15 bg-white p-2.5 font-normal text-navy"
            >
              {(options?.experienceLevels ?? ['Beginner']).map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-navy/70">When suits you? (optional)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(options?.availabilityDays ?? []).map((value) => (
              <ChoiceChip key={value} label={value} on={form.preferredDays.includes(value)} onClick={() => toggle('preferredDays', value)} />
            ))}
            {(options?.availabilityTimes ?? []).map((value) => (
              <ChoiceChip key={value} label={value} on={form.preferredTimes.includes(value)} onClick={() => toggle('preferredTimes', value)} />
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy/70">
          Message (optional)
          <textarea
            rows={3}
            maxLength={1000}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={`Anything ${firstName} should know, like what you’d like to learn.`}
            className="rounded-lg border border-navy/15 bg-white p-2.5 font-normal text-navy"
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={busy || !form.ageGroup}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {busy ? 'Sending…' : `Send request to ${firstName}`}
          </button>
          <button type="button" onClick={onClose} className="rounded-full px-4 py-3 text-sm font-semibold text-navy/70 hover:text-navy">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-6"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="request-title" className="font-display text-2xl font-bold text-navy">
            Request {firstName}
            {mentor.isTest ? <span className="ml-2 rounded-md bg-gold px-2 py-0.5 align-middle text-xs">Test</span> : null}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-1 text-navy/60 hover:bg-navy/10 hover:text-navy">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}

function ChoiceChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        'rounded-full border px-3 py-1.5 text-sm',
        on ? 'border-navy bg-navy text-cream' : 'border-navy/20 bg-white text-navy hover:border-navy/50',
      )}
    >
      {label}
    </button>
  );
}
