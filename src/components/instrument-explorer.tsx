'use client';

// The filterable instrument grid on /instruments, after "instruments-page-desktop":
// a row of family tabs over a grid of cards.

import { useState } from 'react';
import { INSTRUMENT_FAMILIES, type InstrumentFamily } from '@/lib/site';
import { cx } from './ui';

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

  const visible = INSTRUMENT_FAMILIES.filter((group) => family === 'All' || group.family === family);

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
      </div>

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
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-navy/70">
                      Beginners welcome
                    </span>
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
