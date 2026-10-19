'use client';

// A mentor's weekly availability: a grid of 30-minute blocks across the
// program's lesson hours (weekdays 4–8 PM, weekends 8 AM–8 PM — set in the
// API's util/scheduling.ts). Click or drag to mark blocks free. Lesson times
// are then agreed inside these blocks on the Lessons page.
//
// Blocks a student has an accepted lesson in are shown in coral with their
// name, and are locked: the lesson has to move (on the Lessons page) before
// those hours can be removed. The API enforces the same rule.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Alert, Button, Spinner, cx } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { DAY_NAMES, WEEKDAYS, blocksIn, formatRange, formatTime, toMinutes, toTime, zoneLabel } from '@/lib/schedule';
import type { LessonRules, MentorProfile, Pairing, ScheduleDay, Weekday } from '@/lib/types';

type Free = Record<Weekday, Set<string>>;

const emptyFree = (): Free => Object.fromEntries(WEEKDAYS.map((day) => [day, new Set<string>()])) as Free;

/** A block taken by an accepted lesson. `first` marks the block that carries the label. */
interface Booking {
  student: string;
  when: string;
  first: boolean;
}

const blockKey = (day: Weekday, slot: string) => `${day} ${slot}`;

/** Every block an accepted lesson touches, e.g. a 45-minute lesson at 16:30 takes 16:30 and 17:00. */
function bookingsFrom(pairings: Pairing[], blockMinutes: number): Map<string, Booking> {
  const map = new Map<string, Booking>();
  for (const pairing of pairings) {
    const lesson = pairing.lesson;
    if (!lesson) continue;
    const student = pairing.student.name.replace(/\s*\(test\)$/, '');
    const when = `${DAY_NAMES[lesson.day]}s ${formatRange(lesson.start, lesson.durationMinutes)}`;
    const begin = toMinutes(lesson.start);
    for (let block = begin; block < begin + lesson.durationMinutes; block += blockMinutes) {
      map.set(blockKey(lesson.day, toTime(block)), { student, when, first: block === begin });
    }
  }
  return map;
}

export default function AvailabilityPage() {
  const [rules, setRules] = useState<LessonRules | null>(null);
  const [profile, setProfile] = useState<(MentorProfile & { schedule?: ScheduleDay[] }) | null>(null);
  const [free, setFree] = useState<Free>(emptyFree);
  const [booked, setBooked] = useState<Map<string, Booking>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const paint = useRef<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: LessonRules }>('/lessons/rules'),
      api.get<{ data: MentorProfile & { schedule?: ScheduleDay[] } }>('/me/mentor-profile'),
      api.get<{ data: Pairing[] }>('/lessons'),
    ])
      .then(([rulesBody, profileBody, lessonsBody]) => {
        setRules(rulesBody.data);
        setProfile(profileBody.data);
        setBooked(bookingsFrom(lessonsBody.data.filter((pairing) => pairing.side === 'mentor'), rulesBody.data.blockMinutes));
        const next = emptyFree();
        for (const entry of profileBody.data.schedule ?? []) {
          // Anything saved before the lesson hours existed is dropped here.
          const allowed = new Set(blocksIn(rulesBody.data.windows[entry.day], rulesBody.data.blockMinutes));
          for (const slot of entry.slots) if (allowed.has(slot)) next[entry.day].add(slot);
        }
        setFree(next);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We could not load your availability.'));
  }, []);

  useEffect(() => {
    const stop = () => (paint.current = null);
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  function setBlock(day: Weekday, slot: string, on: boolean) {
    if (booked.has(blockKey(day, slot))) return;
    setStatus('idle');
    setFree((current) => {
      const next = { ...current, [day]: new Set(current[day]) };
      if (on) next[day].add(slot);
      else next[day].delete(slot);
      return next;
    });
  }

  function setDay(day: Weekday, on: boolean) {
    if (!rules) return;
    setStatus('idle');
    // "Clear" keeps booked blocks: a student's lesson is in them.
    const keep = [...free[day]].filter((slot) => booked.has(blockKey(day, slot)));
    setFree((current) => ({
      ...current,
      [day]: on ? new Set(blocksIn(rules.windows[day], rules.blockMinutes)) : new Set(keep),
    }));
  }

  async function save() {
    if (!profile) return;
    setStatus('saving');
    setError(null);
    try {
      // Booked blocks always go back, so an accepted lesson can't fall out of the availability.
      const withBooked = Object.fromEntries(WEEKDAYS.map((day) => [day, new Set(free[day])])) as Free;
      for (const key of booked.keys()) {
        const [day, slot] = key.split(' ') as [Weekday, string];
        withBooked[day].add(slot);
      }
      const schedule = WEEKDAYS.filter((day) => withBooked[day].size).map((day) => ({ day, slots: [...withBooked[day]].sort() }));
      await api.patch(`/mentors/${profile.id}`, { schedule });
      setStatus('saved');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof ApiError ? err.message : 'Your availability did not save.');
    }
  }

  if (error && !rules) return <Alert>{error}</Alert>;
  if (!rules || !profile) return <Spinner label="Loading your availability" />;

  // Every row from the earliest window start to the latest end, across all days.
  const earliest = Math.min(...WEEKDAYS.map((day) => toMinutes(rules.windows[day].start)));
  const latest = Math.max(...WEEKDAYS.map((day) => toMinutes(rules.windows[day].end)));
  const rows = blocksIn({ start: toTime(earliest), end: toTime(latest) }, rules.blockMinutes);
  const inWindow = (day: Weekday, slot: string) =>
    toMinutes(slot) >= toMinutes(rules.windows[day].start) && toMinutes(slot) + rules.blockMinutes <= toMinutes(rules.windows[day].end);

  const totalHours = WEEKDAYS.reduce((sum, day) => sum + free[day].size, 0) * (rules.blockMinutes / 60);

  return (
    <>
      <DashboardHeading
        title="My availability"
        description={`Mark the times you could teach each week. Lessons are 30 to 60 minutes and are agreed with your student inside these times. All times are ${zoneLabel(profile.timeZone ?? 'America/Toronto')}.`}
        actions={
          <>
            {status === 'saved' ? <span className="text-sm text-ok">Saved</span> : null}
            <Button onClick={save} disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save availability'}
            </Button>
          </>
        }
      />

      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <Panel>
        <p className="mb-4 text-sm text-ink-soft">
          Lesson hours: weekdays {formatTime(rules.windows.Mon.start)}–{formatTime(rules.windows.Mon.end)}, weekends{' '}
          {formatTime(rules.windows.Sat.start)}–{formatTime(rules.windows.Sat.end)}. Click or drag across blocks.{' '}
          <strong className="text-ink">{totalHours} hour{totalHours === 1 ? '' : 's'}</strong> marked.
        </p>

        <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft" aria-label="Colour key">
          <li className="flex items-center gap-1.5"><span className="size-3.5 rounded bg-sage" /> Free</li>
          <li className="flex items-center gap-1.5"><span className="size-3.5 rounded bg-coral" /> Booked lesson</li>
          <li className="flex items-center gap-1.5"><span className="size-3.5 rounded border border-line bg-white" /> Not free</li>
          <li className="flex items-center gap-1.5"><span className="size-3.5 rounded bg-stone/60" /> Outside lesson hours</li>
        </ul>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 select-none">
            <thead>
              <tr>
                <th scope="col" className="w-20" />
                {WEEKDAYS.map((day) => (
                  <th key={day} scope="col" className="pb-1 text-center text-sm font-semibold text-navy">
                    {day}
                    <div className="mt-1 flex justify-center gap-1 text-[11px] font-normal">
                      <button type="button" className="text-coral hover:underline" onClick={() => setDay(day, true)}>All</button>
                      <span className="text-ink-faint">·</span>
                      <button type="button" className="text-ink-faint hover:underline" onClick={() => setDay(day, false)}>Clear</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((slot) => (
                <tr key={slot}>
                  <th scope="row" className="pr-2 text-right text-xs font-normal whitespace-nowrap text-ink-faint">
                    {slot.endsWith(':00') ? formatTime(slot) : ''}
                  </th>
                  {WEEKDAYS.map((day) => {
                    if (!inWindow(day, slot)) {
                      return <td key={day} aria-hidden className="h-7 rounded bg-stone/60" />;
                    }
                    const booking = booked.get(blockKey(day, slot));
                    if (booking) {
                      return (
                        <td key={day} className="p-0">
                          <div
                            role="img"
                            aria-label={`${day} ${formatTime(slot)}: lesson with ${booking.student}`}
                            title={`Lesson with ${booking.student} · ${booking.when}. Change it on the Lessons page.`}
                            className="flex h-7 w-full cursor-not-allowed items-center overflow-hidden rounded bg-coral px-1.5 text-[11px] leading-none font-semibold whitespace-nowrap text-white"
                          >
                            {booking.first ? booking.student : ''}
                          </div>
                        </td>
                      );
                    }
                    const on = free[day].has(slot);
                    return (
                      <td key={day} className="p-0">
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`${day} ${formatTime(slot)}`}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            paint.current = !on;
                            setBlock(day, slot, !on);
                          }}
                          onPointerEnter={() => {
                            if (paint.current !== null) setBlock(day, slot, paint.current);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setBlock(day, slot, !on);
                            }
                          }}
                          className={cx(
                            'h-7 w-full rounded transition-colors',
                            on ? 'bg-sage hover:bg-sage/80' : 'border border-line bg-white hover:bg-sky/30',
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-ink-faint">
          Booked lessons are locked here. To move one, propose a new time on the{' '}
          <Link href="/dashboard/lessons" className="underline">Lessons</Link> page — once your student accepts, the old
          blocks free up.
        </p>
      </Panel>
    </>
  );
}
