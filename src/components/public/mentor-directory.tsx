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
import { useEffect, useId, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { APPLY_LINKS, INSTRUMENT_FAMILIES, type InstrumentFamily } from '@/lib/site';
import { useAuth } from './auth-provider';
import { Avatar } from './avatar';
import { Icon } from './marketing';
import { MentorAction, firstNameOf, useStudentStanding, type StudentStanding } from './mentor-request';
import { SlowNotice, cx } from './ui';

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
  photoPath?: string | null;
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
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<InstrumentFamily | null>(null);
  const [language, setLanguage] = useState('');
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
  const standing = useStudentStanding();

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
    return (
      <div className="flex flex-col items-center py-16 text-navy/60">
        <p>Loading mentors…</p>
        <SlowNotice />
      </div>
    );
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
              <MentorCard mentor={mentor} index={index} standing={standing} />
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

function describeAvailability(mentor: DirectoryMentor): string {
  const parts = [...(mentor.availability?.days ?? []), ...(mentor.availability?.times ?? [])];
  return parts.length ? parts.join(', ') : 'Ask when you request';
}

function MentorCard({ mentor, index, standing }: { mentor: DirectoryMentor; index: number; standing: StudentStanding }) {
  const experience =
    mentor.experienceHeadline ||
    (mentor.yearsTeaching ? `${mentor.yearsTeaching} year${mentor.yearsTeaching === 1 ? '' : 's'} teaching` : 'Volunteer mentor');

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
        <Avatar
          name={mentor.name}
          photoPath={mentor.photoPath}
          tone={AVATAR_TONES[index % AVATAR_TONES.length]}
          className="size-16 text-xl"
        />
        <div className="flex min-w-0 flex-col items-start gap-1">
          <h3 className="font-display text-xl font-bold text-navy">
            <Link href={`/find-a-mentor/${mentor.slug}`} className="hover:underline hover:underline-offset-4">
              {mentor.name}
            </Link>
          </h3>
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

      <div className="flex flex-col gap-2">
        <Link
          href={`/find-a-mentor/${mentor.slug}`}
          className="group flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-navy hover:bg-navy/5"
        >
          See {firstNameOf(mentor.name)}&apos;s page and times
          <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <MentorAction mentor={mentor} standing={standing} />
      </div>
    </article>
  );
}
