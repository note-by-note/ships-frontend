'use client';

// The calendar: a month of lessons, important dates and logged volunteer
// hours, with the chosen day's details beside it (below it on a phone).
//
// Lessons show on the viewer's own clock. From a lesson, people can join the
// call, add it to their calendar app, say they can't make it (ahead of time),
// and the mentor marks what happened once it has started.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import {
  STATUS_LABEL,
  STATUS_TONE,
  WEEKDAY_SHORT,
  addDaysKey,
  clock,
  clockRange,
  downloadLesson,
  firstName,
  fromKey,
  lessonDay,
  longDay,
  monthGrid,
  monthTitle,
  todayKey,
  viewerZone,
} from '@/lib/calendar';
import { formatRange, zoneLabel } from '@/lib/schedule';
import type { AttendanceStatus, CalendarData, CalendarDate, CalendarHours, LessonEvent } from '@/lib/types';
import { Icon } from '../public/marketing';
import { Alert, Badge, Button, cx } from '../ui';
import { TextArea } from '../ui/fields';

const MARKS: AttendanceStatus[] = ['held', 'student_missed', 'mentor_missed', 'cancelled'];

type Kind = 'upcoming' | 'unmarked' | AttendanceStatus;

function kindOf(lesson: LessonEvent, now: number): Kind {
  if (lesson.status) return lesson.status;
  return new Date(lesson.startsAt).getTime() > now ? 'upcoming' : 'unmarked';
}

const CHIP: Record<Kind, string> = {
  upcoming: 'bg-sky/60 text-navy',
  unmarked: 'bg-white text-navy ring-1 ring-inset ring-dashed ring-line-strong',
  held: 'bg-ok-soft text-ok',
  student_missed: 'bg-warn-soft text-warn',
  mentor_missed: 'bg-danger-soft text-danger',
  cancelled: 'bg-paper text-ink-faint line-through',
};

const DOT: Record<Kind, string> = {
  upcoming: 'bg-navy',
  unmarked: 'bg-white ring-1 ring-line-strong',
  held: 'bg-ok',
  student_missed: 'bg-warn',
  mentor_missed: 'bg-danger',
  cancelled: 'bg-ink-faint',
};

/** Whether an important date covers a day. */
function covers(item: CalendarDate, key: string) {
  return item.date <= key && key <= (item.endDate ?? item.date);
}

function hoursLabel(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
}

export function LessonCalendar({ showHours = true, lessonHint = true }: { showHours?: boolean; lessonHint?: boolean }) {
  const today = todayKey();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(today);
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const grid = useMemo(() => monthGrid(month.year, month.month), [month]);

  const load = useCallback(() => {
    // A day of slack each side: a lesson's day can differ by time zone.
    const from = addDaysKey(grid[0], -1);
    const to = addDaysKey(grid[grid.length - 1], 1);
    api
      .get<{ data: CalendarData }>(`/lessons/calendar?from=${from}&to=${to}`)
      .then((body) => {
        setError(null);
        setData(body.data);
        setNow(Date.now());
      })
      .catch(() => setError('We couldn’t load your calendar. Try again in a moment.'));
  }, [grid]);

  useEffect(load, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, { lessons: LessonEvent[]; dates: CalendarDate[]; hours: CalendarHours[] }>();
    for (const key of grid) map.set(key, { lessons: [], dates: [], hours: [] });
    if (!data) return map;
    for (const lesson of data.lessons) map.get(lessonDay(lesson))?.lessons.push(lesson);
    for (const key of grid) {
      const entry = map.get(key)!;
      entry.dates = data.dates.filter((item) => covers(item, key));
      if (showHours) entry.hours = data.hours.filter((item) => item.date === key);
    }
    return map;
  }, [data, grid, showHours]);

  const toMark = useMemo(
    () =>
      (data?.lessons ?? []).filter(
        (lesson) => lesson.side === 'mentor' && !lesson.status && new Date(lesson.startsAt).getTime() <= now,
      ),
    [data, now],
  );

  function go(offset: number) {
    setMonth(({ year, month: current }) => {
      const next = new Date(year, current + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function jumpTo(key: string) {
    const date = fromKey(key);
    setMonth({ year: date.getFullYear(), month: date.getMonth() });
    setSelected(key);
  }

  const day = byDay.get(selected) ?? { lessons: [], dates: [], hours: [] };
  const hasAnyLesson = Boolean(data?.lessons.length);

  return (
    <div className="flex flex-col gap-4">
      {error ? <Alert>{error}</Alert> : null}

      {toMark.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold bg-gold/15 px-4 py-3 text-sm text-navy">
          <span>
            <strong>{toMark.length === 1 ? '1 lesson needs' : `${toMark.length} lessons need`} marking.</strong> Did it happen?
          </span>
          <Button size="sm" variant="secondary" onClick={() => jumpTo(lessonDay(toMark[0]))}>
            Show {toMark.length === 1 ? 'it' : 'the first one'}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Month */}
        <div className="@container rounded-2xl bg-white p-3 shadow-sm ring-1 ring-navy/5 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-navy" aria-live="polite">
              {monthTitle(month.year, month.month)}
            </h2>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => go(-1)} className="rounded-lg p-2 text-navy hover:bg-paper" aria-label="Previous month">
                <Icon name="arrow" className="size-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => jumpTo(today)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-navy hover:bg-paper"
              >
                Today
              </button>
              <button type="button" onClick={() => go(1)} className="rounded-lg p-2 text-navy hover:bg-paper" aria-label="Next month">
                <Icon name="arrow" className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-ink-faint" aria-hidden>
            {WEEKDAY_SHORT.map((name) => (
              <div key={name} className="pb-2">
                <span className="@md:hidden">{name.charAt(0)}</span>
                <span className="hidden @md:inline">{name}</span>
              </div>
            ))}
          </div>

          <div className={cx('grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-line', !data && 'opacity-60')}>
            {grid.map((key) => {
              const entry = byDay.get(key)!;
              const inMonth = fromKey(key).getMonth() === month.month;
              const isToday = key === today;
              const isSelected = key === selected;
              const items = entry.lessons.length + entry.dates.length + entry.hours.length;
              const label = [
                longDay(key),
                entry.lessons.length ? `${entry.lessons.length} lesson${entry.lessons.length > 1 ? 's' : ''}` : '',
                entry.dates.length ? `${entry.dates.length} important date${entry.dates.length > 1 ? 's' : ''}` : '',
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  aria-label={label}
                  aria-pressed={isSelected}
                  className={cx(
                    'flex min-h-14 flex-col items-stretch gap-1 p-1 text-left align-top @2xl:min-h-24 @2xl:p-1.5',
                    inMonth ? 'bg-white' : 'bg-paper/70',
                    isSelected && 'outline-2 -outline-offset-2 outline-navy',
                  )}
                >
                  <span
                    className={cx(
                      'flex size-6 items-center justify-center self-center rounded-full text-xs font-semibold @2xl:self-start',
                      isToday ? 'bg-coral text-white' : inMonth ? 'text-navy' : 'text-ink-faint',
                    )}
                  >
                    {fromKey(key).getDate()}
                  </span>

                  {/* A narrow calendar shows dots; a wide one shows short labels. */}
                  {items ? (
                    <span className="flex flex-wrap justify-center gap-0.5 @2xl:hidden">
                      {entry.lessons.map((lesson) => (
                        <span key={lesson.id} className={cx('size-2 rounded-full', DOT[kindOf(lesson, now)])} />
                      ))}
                      {entry.dates.length ? <span className="size-2 rounded-full bg-gold" /> : null}
                      {entry.hours.length ? <span className="size-2 rounded-full bg-sage" /> : null}
                    </span>
                  ) : null}
                  <span className="hidden flex-col gap-0.5 @2xl:flex">
                    {entry.lessons.slice(0, 3).map((lesson) => (
                      <span key={lesson.id} className={cx('truncate rounded px-1 py-0.5 text-[11px] leading-tight font-semibold', CHIP[kindOf(lesson, now)])}>
                        {clock(lesson.startsAt)} {firstName(lesson.withName)}
                      </span>
                    ))}
                    {entry.dates.slice(0, entry.lessons.length >= 3 ? 0 : 2).map((item) => (
                      <span key={item.id} className="truncate rounded bg-gold/30 px-1 py-0.5 text-[11px] leading-tight font-semibold text-navy">
                        {item.title}
                      </span>
                    ))}
                    {entry.hours.length && entry.lessons.length + entry.dates.length < 3 ? (
                      <span className="truncate rounded bg-sage/25 px-1 py-0.5 text-[11px] leading-tight font-semibold text-navy">
                        {hoursLabel(entry.hours.reduce((sum, item) => sum + item.minutes, 0))} logged
                      </span>
                    ) : null}
                    {items > 3 ? <span className="px-1 text-[11px] text-ink-faint">+{items - 3} more</span> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft" aria-label="Key">
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-navy" /> Upcoming</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-ok" /> Happened</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-warn" /> Student missed</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-danger" /> Mentor missed</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-ink-faint" /> Cancelled</li>
            <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gold" /> Important date</li>
            {showHours ? <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-sage" /> Hours logged</li> : null}
          </ul>
        </div>

        {/* The chosen day */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-navy">{selected === today ? 'Today' : longDay(selected)}</h3>
            <div className="flex gap-1">
              <button type="button" onClick={() => jumpTo(addDaysKey(selected, -1))} className="rounded-lg p-1.5 text-navy hover:bg-paper" aria-label="Previous day">
                <Icon name="arrow" className="size-4 rotate-180" />
              </button>
              <button type="button" onClick={() => jumpTo(addDaysKey(selected, 1))} className="rounded-lg p-1.5 text-navy hover:bg-paper" aria-label="Next day">
                <Icon name="arrow" className="size-4" />
              </button>
            </div>
          </div>
          {selected === today ? <p className="-mt-2 text-sm text-ink-soft">{longDay(selected)}</p> : null}

          {!data ? <p className="text-sm text-ink-faint">Loading…</p> : null}
          {data && !day.lessons.length && !day.dates.length && !day.hours.length ? (
            <p className="text-sm text-ink-soft">Nothing on this day.</p>
          ) : null}

          {day.lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} now={now} onChange={load} />
          ))}

          {day.dates.map((item) => (
            <div key={item.id} className="rounded-xl bg-gold/20 p-3">
              <p className="text-xs font-semibold tracking-wide text-navy/60 uppercase">Important date</p>
              <p className="font-semibold text-navy">{item.title}</p>
              {item.time ? <p className="text-sm text-navy/80">{item.time}</p> : null}
              {item.endDate && item.endDate !== item.date ? (
                <p className="text-sm text-navy/70">
                  {longDay(item.date)} to {longDay(item.endDate)}
                </p>
              ) : null}
              {item.body ? <p className="mt-1 text-sm whitespace-pre-line text-ink-soft">{item.body}</p> : null}
              {item.link ? (
                <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-coral underline">
                  {item.link.label || 'Open link'}
                </a>
              ) : null}
            </div>
          ))}

          {day.hours.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-sage/15 p-3 text-sm">
              <span className="text-navy">
                <strong>{hoursLabel(item.minutes)}</strong> · {item.activity}
              </span>
              <Badge tone={item.status === 'approved' ? 'ok' : item.status === 'declined' ? 'danger' : 'neutral'}>
                {item.status === 'pending' ? 'Waiting for approval' : item.status === 'approved' ? 'Approved' : 'Declined'}
              </Badge>
            </div>
          ))}

          {data && lessonHint && !hasAnyLesson && selected === today ? (
            <p className="mt-auto border-t border-line pt-3 text-sm text-ink-soft">
              Lessons show here once you and your mentor or student agree a weekly time on the{' '}
              <Link href="/dashboard/lessons" className="font-semibold text-coral underline">
                Lessons
              </Link>{' '}
              page.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LessonItem({ lesson, now, onChange }: { lesson: LessonEvent; now: number; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [message, setMessage] = useState('');

  const started = new Date(lesson.startsAt).getTime() <= now;
  const ended = new Date(lesson.endsAt).getTime() <= now;
  const kind = kindOf(lesson, now);
  const other = firstName(lesson.withName);
  const otherZone = lesson.timeZone !== viewerZone();
  const myNotice = lesson.notices.some((notice) => notice.side === lesson.side);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cx('rounded-xl p-3', kind === 'upcoming' ? 'bg-sky/30' : kind === 'unmarked' ? 'bg-paper' : 'bg-paper/60')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-navy">{clockRange(lesson)}</p>
          {otherZone ? (
            <p className="text-xs text-ink-faint">
              {formatRange(lesson.start, lesson.durationMinutes)} {zoneLabel(lesson.timeZone)}
            </p>
          ) : null}
        </div>
        {lesson.status ? (
          <Badge tone={STATUS_TONE[lesson.status]}>{STATUS_LABEL[lesson.status]}</Badge>
        ) : started ? (
          <Badge>Not marked</Badge>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-navy">
        {lesson.instrument} with {lesson.side === 'mentor' ? lesson.withName.replace(/\s*\(test\)$/, '') : lesson.withName}
      </p>

      {lesson.notices.length ? (
        <ul className="mt-2 flex flex-col gap-1">
          {lesson.notices.map((notice, index) => (
            <li key={index} className="rounded-lg bg-coral/15 px-2.5 py-1.5 text-sm text-navy">
              {notice.side === lesson.side ? 'You' : other} can’t make this one{notice.message ? `: “${notice.message}”` : '.'}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <div className="mt-2"><Alert>{error}</Alert></div> : null}

      {/* What happened: the mentor marks it once it has started. */}
      {lesson.side === 'mentor' && started ? (
        <fieldset className="mt-3">
          <legend className="mb-1.5 text-xs font-semibold text-ink-soft">Did it happen?</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {MARKS.map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                aria-pressed={lesson.attendance?.status === status}
                onClick={() =>
                  run(() =>
                    lesson.attendance?.status === status
                      ? api.delete(`/lessons/${lesson.matchId}/attendance/${lesson.date}`)
                      : api.put(`/lessons/${lesson.matchId}/attendance/${lesson.date}`, { status }),
                  )
                }
                className={cx(
                  'rounded-lg border px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-60 pointer-coarse:py-2.5',
                  lesson.attendance?.status === status
                    ? 'border-navy bg-navy text-white'
                    : 'border-line-strong bg-white text-navy hover:bg-paper',
                )}
              >
                {STATUS_LABEL[status]}
              </button>
            ))}
          </div>
          {lesson.attendance ? <p className="mt-1.5 text-xs text-ink-faint">Tap it again to clear it.</p> : null}
        </fieldset>
      ) : null}
      {lesson.side === 'student' && started && !lesson.status ? (
        <p className="mt-2 text-xs text-ink-faint">Your mentor marks whether each lesson happened.</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {lesson.meetingUrl && !ended && !lesson.status ? (
          <a
            href={lesson.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90"
          >
            Join the call
          </a>
        ) : null}
        {!ended ? (
          <button
            type="button"
            onClick={() => downloadLesson(lesson)}
            className="rounded-lg border border-line-strong bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-paper"
          >
            Add to my calendar
          </button>
        ) : null}
        {!started && !myNotice && !noticeOpen ? (
          <button
            type="button"
            onClick={() => setNoticeOpen(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-coral hover:bg-coral/10"
          >
            I can’t make it
          </button>
        ) : null}
      </div>

      {noticeOpen ? (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => api.post(`/lessons/${lesson.matchId}/absences`, { date: lesson.date, message })).then(() =>
              setNoticeOpen(false),
            );
          }}
        >
          <label className="text-xs font-semibold text-ink-soft" htmlFor={`notice-${lesson.id}`}>
            Message for {other} (optional)
          </label>
          <TextArea
            id={`notice-${lesson.id}`}
            rows={2}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="e.g. school trip, can we do Thursday?"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="secondary" disabled={busy}>
              Let {other} know
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setNoticeOpen(false)}>
              Never mind
            </Button>
          </div>
        </form>
      ) : null}
      {myNotice && !started ? (
        <p className="mt-2 text-xs text-ink-faint">
          Changed your mind? Take it back on the{' '}
          <Link href="/dashboard/lessons" className="font-semibold underline">
            Lessons
          </Link>{' '}
          page.
        </p>
      ) : null}
    </div>
  );
}
