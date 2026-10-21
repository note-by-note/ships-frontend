// A mentor's page: who they are, what they teach and when they're free.
//
// One component for both places it appears: the public page at
// /find-a-mentor/[slug], and the live preview beside the mentor's editor.
// It lays itself out with container queries rather than the viewport, so the
// same markup works full width and squeezed into the preview column.
//
// With `preview`, empty sections show a hint about what goes there instead
// of disappearing, so a mentor can see the shape of the page as they fill it.

import type { ReactNode } from 'react';
import { DAY_NAMES, WEEKDAYS, formatTime, toMinutes, toTime, zoneLabel } from '@/lib/schedule';
import type { PageTheme, PublicMentor, ScheduleDay } from '@/lib/types';
import { Avatar } from './avatar';
import { Icon, type IconName } from './marketing';
import { firstNameOf } from './mentor-request';
import { cx } from './ui';

export const PAGE_THEMES: Record<PageTheme, { label: string; band: string; solid: string; soft: string }> = {
  sky: { label: 'Sky', band: 'bg-sky/45', solid: 'bg-sky', soft: 'bg-sky/15' },
  gold: { label: 'Gold', band: 'bg-gold/40', solid: 'bg-gold', soft: 'bg-gold/15' },
  sage: { label: 'Sage', band: 'bg-sage/45', solid: 'bg-sage', soft: 'bg-sage/15' },
  coral: { label: 'Coral', band: 'bg-coral/35', solid: 'bg-coral/80', soft: 'bg-coral/10' },
  mist: { label: 'Mist', band: 'bg-mist', solid: 'bg-white', soft: 'bg-mist/50' },
};

const BLOCK_MINUTES = 30;

/** Join back-to-back 30-minute blocks into ranges: 16:00, 16:30, 17:00 → 4:00 PM to 5:30 PM. */
export function rangesOf(slots: string[]): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  for (const slot of [...slots].sort()) {
    const begin = toMinutes(slot);
    const last = ranges[ranges.length - 1];
    if (last && toMinutes(last.end) === begin) last.end = toTime(begin + BLOCK_MINUTES);
    else ranges.push({ start: slot, end: toTime(begin + BLOCK_MINUTES) });
  }
  return ranges;
}

export function OpenTimes({ schedule, timeZone, name }: { schedule: ScheduleDay[]; timeZone?: string; name: string }) {
  const byDay = new Map(schedule.map((entry) => [entry.day, entry.slots]));
  if (!schedule.some((entry) => entry.slots.length)) {
    return <p className="text-sm text-navy/65">{firstNameOf(name)} has no open times right now.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-navy/10">
        {WEEKDAYS.map((day) => {
          const ranges = rangesOf(byDay.get(day) ?? []);
          return (
            <li key={day} className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 py-2.5">
              <span className="w-24 shrink-0 text-sm font-semibold text-navy">{DAY_NAMES[day]}</span>
              {ranges.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {ranges.map((range) => (
                    <span key={range.start} className="rounded-full bg-sage/25 px-2.5 py-0.5 text-xs font-medium text-navy">
                      {formatTime(range.start)} to {formatTime(range.end)}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-xs text-navy/40">Not available</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-navy/60">
        Times are in {zoneLabel(timeZone || 'America/Toronto')}. Once you&apos;re matched, you agree a lesson time of 30
        to 60 minutes inside these hours.
      </p>
    </>
  );
}

function Block({
  icon,
  title,
  children,
  hint,
  preview,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  /** Shown in the editor preview when the section is empty. */
  hint: string;
  preview?: boolean;
}) {
  if (!children && !preview) return null;
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-navy">
        <Icon name={icon} className="size-5 text-coral" />
        {title}
      </h2>
      <div className="mt-3">
        {children || <p className="rounded-xl border border-dashed border-navy/20 p-4 text-sm text-navy/50">{hint}</p>}
      </div>
    </section>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function Chips({ items, tone = 'bg-white' }: { items: string[]; tone?: string }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={cx('rounded-full px-3 py-1 text-sm font-medium text-navy', tone)}>
          {item}
        </span>
      ))}
    </span>
  );
}

function Facts({ rows }: { rows: [string, string[]][] }) {
  const shown = rows.filter(([, values]) => values.length);
  if (!shown.length) return null;
  return (
    <dl className="flex flex-col gap-3">
      {shown.map(([label, values]) => (
        <div key={label}>
          <dt className="text-xs font-semibold tracking-wider text-navy/50 uppercase">{label}</dt>
          <dd className="mt-1 text-sm text-navy">{values.join(', ')}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MentorPage({
  mentor,
  action,
  preview = false,
}: {
  mentor: PublicMentor;
  /** The apply/request button, or whatever fits the viewer. */
  action?: ReactNode;
  preview?: boolean;
}) {
  const theme = PAGE_THEMES[mentor.pageTheme ?? 'sky'] ?? PAGE_THEMES.sky;
  const displayName = mentor.name.replace(/\s*\(test\)$/, '') || 'Your name';
  const first = firstNameOf(displayName);
  const trust = [
    mentor.verified && 'Verified mentor',
    mentor.screening?.backgroundCheckCleared && 'Background checked',
    mentor.screening?.childSafetyCertified && 'Child safety trained',
  ].filter((entry): entry is string => Boolean(entry));
  const firstLesson = (mentor.whatToExpect ?? []).filter((item) => item.trim());
  const experience =
    mentor.experienceHeadline ||
    (mentor.yearsTeaching ? `${mentor.yearsTeaching} year${mentor.yearsTeaching === 1 ? '' : 's'} teaching` : '');

  return (
    <div className="@container bg-cream text-navy">
      <header className={cx('px-5 pt-10 pb-8 @3xl:px-10 @3xl:pt-14', theme.band)}>
        <div className="mx-auto flex max-w-5xl flex-col gap-6 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="flex flex-col gap-5 @lg:flex-row @lg:items-center">
            <Avatar
              name={displayName}
              photoPath={mentor.photoPath}
              tone={theme.solid}
              className="size-24 text-3xl shadow-sm ring-4 ring-cream @3xl:size-28"
            />
            <div className="min-w-0">
              <h1 className="font-display text-4xl leading-tight font-bold @3xl:text-5xl">
                {displayName}
                {mentor.isTest ? (
                  <span className="ml-3 rounded-md bg-gold px-2 py-0.5 align-middle font-sans text-xs font-semibold">Test</span>
                ) : null}
              </h1>
              {mentor.pronouns ? <p className="mt-1 text-sm text-navy/70">{mentor.pronouns}</p> : null}
              {experience ? <p className="mt-2 text-lg text-navy/80">{experience}</p> : null}
              <div className="mt-4">
                <Chips items={mentor.instruments.length ? mentor.instruments : preview ? ['Your instruments'] : []} tone="bg-navy text-cream!" />
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl bg-cream/90 p-5 shadow-sm @3xl:w-72">
            {mentor.acceptingStudents === false ? (
              <p className="text-sm font-semibold text-navy/70">{first} isn&apos;t taking new students right now.</p>
            ) : (
              <p className="text-sm font-semibold text-ok">Taking new students</p>
            )}
            {action ? <div className="mt-3">{action}</div> : null}
            {mentor.responseTime ? <p className="mt-3 text-xs text-navy/60">Usually replies {mentor.responseTime}</p> : null}
          </div>
        </div>

        {trust.length ? (
          <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap gap-2">
            {trust.map((entry) => (
              <li key={entry} className="flex items-center gap-1.5 rounded-full bg-cream/80 px-3 py-1 text-xs font-semibold">
                <Icon name="shield" className="size-3.5 text-ok" />
                {entry}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 @3xl:grid-cols-[1fr_320px] @3xl:px-10">
        <div className="flex min-w-0 flex-col gap-10">
          <Block icon="heart" title={`About ${first}`} hint="A few lines about you: how you got into music and what you enjoy playing." preview={preview}>
            {mentor.about || mentor.shortBio ? (
              <p className="leading-relaxed whitespace-pre-line text-navy/80">{mentor.about || mentor.shortBio}</p>
            ) : null}
          </Block>

          <Block icon="school" title="How I teach" hint="How you like to run a lesson, and what you'd want a student to feel." preview={preview}>
            {mentor.teachingPhilosophy ? (
              <p className="leading-relaxed whitespace-pre-line text-navy/80">{mentor.teachingPhilosophy}</p>
            ) : null}
          </Block>

          <Block icon="star" title="Your first lesson" hint="A few points on what happens in a first lesson with you." preview={preview}>
            {firstLesson.length ? (
              <ol className="flex flex-col gap-3">
                {firstLesson.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold', theme.solid)}>
                      {index + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed text-navy/80">{item}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </Block>

          <Block icon="music" title="Music I love" hint="Styles, pieces or artists you love. Students like knowing what you're into." preview={preview}>
            {mentor.favoriteMusic || mentor.genres.length ? (
              <div className="flex flex-col gap-3">
                {mentor.genres.length ? <Chips items={mentor.genres} tone={theme.soft} /> : null}
                {mentor.favoriteMusic ? (
                  <p className="leading-relaxed whitespace-pre-line text-navy/80">{mentor.favoriteMusic}</p>
                ) : null}
              </div>
            ) : null}
          </Block>

          {mentor.sampleUrl?.startsWith('https://') ? (
            <a
              href={mentor.sampleUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 hover:ring-navy/20"
            >
              <span>
                <span className="block font-display text-lg font-bold">Hear {first} play</span>
                <span className="block truncate text-sm text-navy/60">{hostOf(mentor.sampleUrl)}</span>
              </span>
              <Icon name="arrow" className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : null}

          {mentor.reviews.length ? (
            <Block icon="message" title="What students say" hint="">
              <ul className="flex flex-col gap-4">
                {mentor.reviews.map((review, index) => (
                  <li key={review.id ?? index} className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-gold" aria-label={`${review.rating} out of 5`}>
                      {'★'.repeat(review.rating)}
                      <span className="text-navy/15">{'★'.repeat(5 - review.rating)}</span>
                    </p>
                    <p className="mt-2 leading-relaxed text-navy/80">&ldquo;{review.body}&rdquo;</p>
                    <p className="mt-2 text-sm font-semibold">
                      {review.authorName}
                      {review.authorRole ? <span className="font-normal text-navy/60">, {review.authorRole}</span> : null}
                    </p>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <Icon name="calendar" className="size-5 text-coral" />
              When I&apos;m free
            </h2>
            <div className="mt-3">
              <OpenTimes schedule={mentor.openSchedule} timeZone={mentor.timeZone} name={displayName} />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <Icon name="users" className="size-5 text-coral" />
              Who I teach
            </h2>
            <Facts
              rows={[
                ['Levels', mentor.experienceLevels],
                ['Ages', mentor.ageGroups],
                ['Lessons', mentor.formats],
                ['Languages', mentor.languages],
                ['Based in', mentor.location ? [mentor.location] : []],
              ]}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
