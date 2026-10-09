'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { INSTRUMENTS, LANGUAGES, MENTORS, type Instrument, type Mentor } from '@/lib/mentors';
import { cx } from './ui';

// Cards alternate tilt like the Figma "Meet our mentors" row, and straighten on
// hover/focus so the one you're reading sits square.
const TILTS = ['-rotate-[1.5deg]', 'rotate-[1.5deg]'];
const AVATAR_TONES = ['bg-gold', 'bg-sage', 'bg-sky', 'bg-coral/70'];

export function MentorDirectory() {
  const [query, setQuery] = useState('');
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [language, setLanguage] = useState('');
  const searchId = useId();
  const languageId = useId();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return MENTORS.filter((mentor) => {
      if (instrument && !mentor.instruments.includes(instrument)) return false;
      if (language && !mentor.languages.includes(language)) return false;
      if (!needle) return true;
      return [mentor.name, mentor.focus, mentor.experience, ...mentor.instruments]
        .some((text) => text.toLowerCase().includes(needle));
    });
  }, [query, instrument, language]);

  const filtered = Boolean(query || instrument || language);

  function reset() {
    setQuery('');
    setInstrument(null);
    setLanguage('');
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
              placeholder="Name, instrument or style"
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
              {LANGUAGES.map((lang) => (
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
            {[null, ...INSTRUMENTS].map((option) => {
              const active = instrument === option;
              return (
                <button
                  key={option ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setInstrument(option)}
                  className={cx(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'border-navy bg-navy text-cream'
                      : 'border-navy/15 bg-cream/60 text-navy hover:border-navy/40',
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
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-navy underline underline-offset-4"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((mentor, index) => (
            <li key={mentor.id}>
              <MentorCard mentor={mentor} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-navy/20 px-6 py-14 text-center">
          <p className="font-display text-[22px] font-bold text-navy">No mentors match yet</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-navy/60">
            Try another instrument or language — or apply anyway and we&apos;ll find someone for you.
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

function MentorCard({ mentor, index }: { mentor: Mentor; index: number }) {
  const initials = mentor.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <article
      className={cx(
        'flex h-full flex-col gap-5 rounded-[20px] bg-cream p-6 shadow-[0px_6px_8px_0px_rgba(0,0,0,0.13)]',
        'transition-transform duration-200 hover:rotate-0 focus-within:rotate-0',
        TILTS[index % TILTS.length],
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
        <div className="flex flex-col items-start gap-1">
          <h3 className="font-display text-xl font-bold text-navy">{mentor.name}</h3>
          <span className="rounded-md bg-sage/30 px-2 py-0.5 text-xs font-semibold text-navy">
            {mentor.focus}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-2 text-[13px]">
        <dt className="font-bold text-navy/50">Exp:</dt>
        <dd className="text-navy/75">{mentor.experience}</dd>
        <dt className="font-bold text-navy/50">Lang:</dt>
        <dd className="text-navy/75">{mentor.languages.join(', ')}</dd>
        <dt className="font-bold text-navy/50">When:</dt>
        <dd className="text-navy/75">{mentor.availability}</dd>
      </dl>

      <blockquote className="flex-1 border border-coral p-2 text-sm leading-[1.4] text-navy/60">
        &ldquo;{mentor.quote}&rdquo;
      </blockquote>

      <Link
        href="/apply"
        className="flex w-full items-center justify-center rounded-xl bg-navy py-3 text-sm font-semibold text-cream transition-colors hover:bg-navy/90"
      >
        Request {mentor.name.split(' ')[0]}
      </Link>
    </article>
  );
}
