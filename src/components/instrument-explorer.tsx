'use client';

// The filterable instrument grid on /instruments, after "instruments-page-desktop":
// a row of family tabs over a grid of cards. Each card says how many published
// mentors teach it (from the API), and you can show only instruments that
// have a mentor. Until any mentor is published, the counts stay hidden.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { INSTRUMENT_FAMILIES, type InstrumentFamily } from '@/lib/site';
import { cx } from './ui';

interface Facets {
  data: { instruments: { value: string; count: number }[] };
  meta: { totalMentors: number };
}

const TONES: Record<InstrumentFamily, string> = {
  Keys: 'bg-sky/50',
  Strings: 'bg-gold/50',
  Woodwinds: 'bg-sage/50',
  Brass: 'bg-gold/35',
  Percussion: 'bg-coral/35',
  Theory: 'bg-sky/35',
};

export function InstrumentExplorer() {
  const [family, setFamily] = useState<InstrumentFamily | 'All'>('All');
  const [counts, setCounts] = useState<Map<string, number> | null>(null);
  const [onlyTaught, setOnlyTaught] = useState(false);

  useEffect(() => {
    api
      .get<Facets>('/filters')
      .then((body) =>
        setCounts(body.meta.totalMentors ? new Map(body.data.instruments.map((entry) => [entry.value, entry.count])) : null),
      )
      .catch(() => setCounts(null));
  }, []);

  const taught = (instrument: string) => (counts?.get(instrument) ?? 0) > 0;
  const visible = INSTRUMENT_FAMILIES.filter((group) => family === 'All' || group.family === family)
    .map((group) => ({
      ...group,
      instruments: onlyTaught && counts ? group.instruments.filter(taught) : group.instruments,
    }))
    .filter((group) => group.instruments.length);

  return (
    <div>
      <div role="group" aria-label="Filter by family" className="mb-10 flex flex-wrap gap-2">
        {(['All', ...INSTRUMENT_FAMILIES.map((group) => group.family)] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={family === option}
            onClick={() => setFamily(option)}
            className={cx(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              family === option
                ? 'border-navy bg-navy text-cream'
                : 'border-navy/20 bg-white text-navy hover:border-navy/50',
            )}
          >
            {option}
          </button>
        ))}
        {counts ? (
          <label className="ml-auto flex items-center gap-2 text-sm text-navy/75">
            <input type="checkbox" checked={onlyTaught} onChange={(event) => setOnlyTaught(event.target.checked)} className="size-4 accent-navy" />
            Only instruments with a mentor
          </label>
        ) : null}
      </div>

      {!visible.length ? (
        <p className="rounded-2xl bg-white/60 p-6 text-center text-navy/70">
          No mentors teach these yet. Try another family, or{' '}
          <Link href="/apply" className="font-semibold underline">apply</Link> and tell us what you&apos;d like to learn.
        </p>
      ) : null}

      <div className="flex flex-col gap-12">
        {visible.map((group) => (
          <section key={group.family} aria-labelledby={`family-${group.family}`}>
            <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 id={`family-${group.family}`} className="font-display text-2xl font-bold">
                {group.family}
              </h2>
              <p className="text-sm text-navy/65">{group.blurb}</p>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.instruments.map((instrument) => (
                <li key={instrument} className="flex min-w-0 flex-col rounded-2xl bg-stone p-3">
                  <div
                    aria-hidden
                    className={cx(
                      'flex aspect-[4/3] items-center justify-center rounded-xl font-display text-4xl font-bold text-navy/75',
                      TONES[group.family],
                    )}
                  >
                    {instrument.charAt(0)}
                  </div>
                  <div className="flex min-w-0 flex-col items-start gap-1.5 px-1 pt-3 pb-1">
                    <span className="font-display text-base font-bold break-words">{instrument}</span>
                    {counts ? (
                      <span
                        className={cx(
                          'rounded-full px-2 py-0.5 text-[11px] font-medium',
                          taught(instrument) ? 'bg-sage/40 text-navy' : 'bg-white text-navy/50',
                        )}
                      >
                        {taught(instrument)
                          ? `${counts.get(instrument)} mentor${counts.get(instrument) === 1 ? '' : 's'}`
                          : 'No mentor yet'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-navy/70">
                        Beginners welcome
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
