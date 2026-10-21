'use client';

// Find a Mentor: published mentor profiles from the API, filterable by
// instrument family and language.
//
// Students who haven't been accepted yet apply to learn with a mentor: the
// card opens the student application with that mentor named on it, and the
// mentor hears about them once staff accept it. Students already accepted
// skip straight to a request, which the mentor answers from their dashboard.
//
// Staff and test accounts also see test profiles (the API decides), marked
// "Test", so the whole flow can be tried without the public seeing them.

import Link from 'next/link';
import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { APPLY_LINKS, INSTRUMENT_FAMILIES, type InstrumentFamily } from '@/lib/site';
import type { Application, Options } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Icon } from './marketing';
import { cx } from './ui';

/** The card fields `GET /api/mentors` returns. */
interface DirectoryMentor {
  id: string;
  name: string;
  slug: string;
  instruments: string[];
  languages: string[];
  experienceHeadline?: string;
  yearsTeaching?: number;
  availability?: { days: string[]; times: string[] };
  shortBio?: string;
  verified?: boolean;
  acceptingStudents?: boolean;
  isTest?: boolean;
}

// Cards alternate tilt like the Figma "Meet our mentors" row, and straighten on
// hover/focus so the one you're reading sits square.
const TILTS = ['-rotate-[1.5deg]', 'rotate-[1.5deg]'];
const AVATAR_TONES = ['bg-gold', 'bg-sage', 'bg-sky', 'bg-coral/70'];

const FAMILY_OF = new Map<string, InstrumentFamily>(
  INSTRUMENT_FAMILIES.flatMap((group) => group.instruments.map((instrument) => [instrument, group.family] as const)),
);

export function MentorDirectory() {
  const [mentors, setMentors] = useState<DirectoryMentor[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [requesting, setRequesting] = useState<DirectoryMentor | null>(null);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<InstrumentFamily | null>(null);
  const [language, setLanguage] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const { user, loading: authLoading } = useAuth();
  const searchId = useId();
  const languageId = useId();

  // Re-fetch once we know who's signed in: staff and test accounts get test profiles too.
  useEffect(() => {
    if (authLoading) return;
    api
      .get<{ data: DirectoryMentor[] }>('/mentors?limit=60&sort=name')
      .then((body) => setMentors(body.data))
      .catch(() => setFailed(true));
  }, [authLoading, user?.id]);

  // A student's own applications decide whether a card applies or requests.
  useEffect(() => {
    if (!user || user.isStaff) return;
    api
      .get<{ data: Application[] }>('/applications/mine')
      .then((body) => setApplications(body.data))
      .catch(() => setApplications([]));
  }, [user]);

  const studentApplication = user && !user.isStaff
    ? applications.find((application) => application.formKind === 'mentee' && application.status !== 'withdrawn')
    : undefined;
  const accepted = studentApplication?.status === 'accepted';

  const languages = useMemo(
    () => [...new Set((mentors ?? []).flatMap((mentor) => mentor.languages))].sort(),
    [mentors],
  );
  const families = useMemo(
    () => INSTRUMENT_FAMILIES.map((group) => group.family).filter((name) =>
      (mentors ?? []).some((mentor) => mentor.instruments.some((instrument) => FAMILY_OF.get(instrument) === name)),
    ),
    [mentors],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (mentors ?? []).filter((mentor) => {
      if (family && !mentor.instruments.some((instrument) => FAMILY_OF.get(instrument) === family)) return false;
      if (language && !mentor.languages.includes(language)) return false;
      if (!needle) return true;
      return [mentor.name, mentor.experienceHeadline ?? '', mentor.shortBio ?? '', ...mentor.instruments].some((text) =>
        text.toLowerCase().includes(needle),
      );
    });
  }, [mentors, query, family, language]);

  const filtered = Boolean(query || family || language);

  function reset() {
    setQuery('');
    setFamily(null);
    setLanguage('');
  }

  if (failed) {
    return (
      <EmptyPanel
        title="We couldn’t load mentors right now"
        body="Please try again in a moment, or apply and we’ll match you with someone."
      />
    );
  }

  if (!mentors) {
    return <p className="py-16 text-center text-navy/60">Loading mentors…</p>;
  }

  if (!mentors.length) {
    return (
      <EmptyPanel
        title="Mentor profiles are coming soon"
        body="We’re still setting up our first mentors. Apply now and we’ll match you with someone who teaches what you want to learn."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Filters */}
      <div className="rounded-3xl bg-white p-6 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.03)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={searchId} className="text-sm font-semibold text-navy/65">
              Search
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or instrument"
              className="rounded-lg border border-navy/15 bg-white p-3 text-sm text-navy placeholder:text-navy/35 focus:border-navy"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:w-56">
            <label htmlFor={languageId} className="text-sm font-semibold text-navy/65">
              Language
            </label>
            <select
              id={languageId}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-navy/15 bg-white p-3 text-sm text-navy focus:border-navy"
            >
              <option value="">Any language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-navy/65">Instrument</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[null, ...families].map((option) => {
              const active = family === option;
              return (
                <button
                  key={option ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFamily(option)}
                  className={cx(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    active ? 'border-navy bg-navy text-cream' : 'border-navy/15 bg-cream/60 text-navy hover:border-navy/40',
                  )}
                >
                  {option ?? 'All'}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Results */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p aria-live="polite" className="text-[15px] text-navy/60">
          {results.length === 1 ? '1 mentor' : `${results.length} mentors`}
          {filtered ? ' match your filters' : ' ready to teach'}
        </p>
        {filtered ? (
          <button type="button" onClick={reset} className="text-sm font-semibold text-navy underline underline-offset-4">
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((mentor, index) => (
            <li key={mentor.id}>
              <MentorCard
                mentor={mentor}
                index={index}
                onRequest={() => setRequesting(mentor)}
                applyHref={
                  user?.isStaff || accepted ? undefined : `${APPLY_LINKS.student}?mentor=${encodeURIComponent(mentor.slug)}`
                }
                chosen={!accepted && studentApplication?.requestedMentor?.slug === mentor.slug}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-navy/20 px-6 py-14 text-center">
          <p className="font-display text-[22px] font-bold text-navy">No mentors match yet</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-navy/60">
            Try another instrument or language, or apply anyway and we&apos;ll find someone for you.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full border-2 border-navy px-6 py-3 text-sm font-semibold text-navy"
          >
            Clear filters
          </button>
        </div>
      )}

      {requesting ? <RequestDialog mentor={requesting} onClose={() => setRequesting(null)} /> : null}
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-navy/20 bg-white/50 px-6 py-16 text-center">
      <p className="font-display text-[22px] font-bold text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-navy/60">{body}</p>
      <Link
        href={APPLY_LINKS.student}
        className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy/90"
      >
        Apply for lessons
      </Link>
    </div>
  );
}

function firstNameOf(name: string): string {
  return name.replace(/\s*\(test\)$/, '').split(' ')[0];
}

function describeAvailability(mentor: DirectoryMentor): string {
  const parts = [...(mentor.availability?.days ?? []), ...(mentor.availability?.times ?? [])];
  return parts.length ? parts.join(', ') : 'Ask when you request';
}

function MentorCard({
  mentor,
  index,
  onRequest,
  applyHref,
  chosen,
}: {
  mentor: DirectoryMentor;
  index: number;
  onRequest: () => void;
  /** Set for anyone who still needs to apply: the card links to the application instead of requesting. */
  applyHref?: string;
  /** This is the mentor named on the student's application. */
  chosen?: boolean;
}) {
  const initials = mentor.name
    .replace(/\s*\(test\)$/, '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  const experience =
    mentor.experienceHeadline ||
    (mentor.yearsTeaching ? `${mentor.yearsTeaching} year${mentor.yearsTeaching === 1 ? '' : 's'} teaching` : 'Volunteer mentor');
  const accepting = mentor.acceptingStudents !== false;

  return (
    <article
      className={cx(
        'flex h-full flex-col gap-5 rounded-[20px] bg-cream p-6 shadow-[0px_6px_8px_0px_rgba(0,0,0,0.13)]',
        'transition-transform duration-200 hover:rotate-0 focus-within:rotate-0',
        TILTS[index % TILTS.length],
        mentor.isTest && 'ring-2 ring-gold ring-offset-2 ring-offset-cream',
      )}
    >
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className={cx(
            'flex size-16 shrink-0 items-center justify-center rounded-full font-display text-xl font-bold text-navy',
            AVATAR_TONES[index % AVATAR_TONES.length],
          )}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1">
          <h3 className="font-display text-xl font-bold text-navy">{mentor.name}</h3>
          <div className="flex flex-wrap gap-1">
            <span className="rounded-md bg-sage/30 px-2 py-0.5 text-xs font-semibold text-navy">
              {mentor.instruments.slice(0, 2).join(' & ')}
            </span>
            {mentor.isTest ? (
              <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-semibold text-navy">Test</span>
            ) : null}
            {mentor.verified ? (
              <span className="rounded-md bg-sky/50 px-2 py-0.5 text-xs font-semibold text-navy">Verified</span>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-2 text-[13px]">
        <dt className="font-bold text-navy/50">Exp:</dt>
        <dd className="text-navy/75">{experience}</dd>
        <dt className="font-bold text-navy/50">Lang:</dt>
        <dd className="text-navy/75">{mentor.languages.join(', ') || 'English'}</dd>
        <dt className="font-bold text-navy/50">When:</dt>
        <dd className="text-navy/75">{describeAvailability(mentor)}</dd>
      </dl>

      {mentor.shortBio ? (
        <blockquote className="flex-1 border border-coral p-2 text-sm leading-[1.4] text-navy/60">
          &ldquo;{mentor.shortBio}&rdquo;
        </blockquote>
      ) : (
        <div className="flex-1" />
      )}

      {!accepting ? (
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-navy/30 py-3 text-sm font-semibold text-cream"
        >
          Not taking new students
        </button>
      ) : chosen && applyHref ? (
        <Link
          href={applyHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
        >
          <span aria-hidden>✓</span> On your application
        </Link>
      ) : applyHref ? (
        <Link
          href={applyHref}
          className="flex w-full items-center justify-center rounded-xl bg-navy py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Apply to learn with {firstNameOf(mentor.name)}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRequest}
          className="flex w-full items-center justify-center rounded-xl bg-navy py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
        >
          Request {firstNameOf(mentor.name)}
        </button>
      )}
    </article>
  );
}

/** Sends a match request to one mentor. Signs people in first if needed. */
function RequestDialog({ mentor, onClose }: { mentor: DirectoryMentor; onClose: () => void }) {
  const { user } = useAuth();
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
  } else if (user.isStaff) {
    content = (
      <p className="text-navy/75">
        Staff accounts can’t send requests. To try this, open{' '}
        <Link href="/admin/testing" className="font-semibold underline">Test mode</Link>, switch to a test student and
        request a test mentor.
      </p>
    );
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
