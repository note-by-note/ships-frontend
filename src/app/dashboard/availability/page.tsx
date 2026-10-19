'use client';

// A mentor's weekly availability: a grid of 30-minute blocks across the
// program's lesson hours (weekdays 4–8 PM, weekends 8 AM–8 PM — set in the
// API's util/scheduling.ts). Click or drag to mark blocks free. Lesson times
// are then agreed inside these blocks on the Lessons page.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Alert, Button, Spinner, cx } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { WEEKDAYS, blocksIn, formatTime, toMinutes, toTime, zoneLabel } from '@/lib/schedule';
import type { LessonRules, MentorProfile, ScheduleDay, Weekday } from '@/lib/types';

type Free = Record<Weekday, Set<string>>;

const emptyFree = (): Free => Object.fromEntries(WEEKDAYS.map((day) => [day, new Set<string>()])) as Free;

export default function AvailabilityPage() {
  const [rules, setRules] = useState<LessonRules | null>(null);
  const [profile, setProfile] = useState<(MentorProfile & { schedule?: ScheduleDay[] }) | null>(null);
  const [free, setFree] = useState<Free>(emptyFree);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const paint = useRef<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: LessonRules }>('/lessons/rules'),
      api.get<{ data: MentorProfile & { schedule?: ScheduleDay[] } }>('/me/mentor-profile'),
    ])
      .then(([rulesBody, profileBody]) => {
        setRules(rulesBody.data);
        setProfile(profileBody.data);
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
    setFree((current) => ({ ...current, [day]: on ? new Set(blocksIn(rules.windows[day], rules.blockMinutes)) : new Set() }));
  }

  async function save() {
    if (!profile) return;
    setStatus('saving');
    setError(null);
    try {
      const schedule = WEEKDAYS.filter((day) => free[day].size).map((day) => ({ day, slots: [...free[day]].sort() }));
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
          Changing your availability doesn’t move lessons you’ve already agreed. To change a lesson time, propose a new
          one on the <Link href="/dashboard/lessons" className="underline">Lessons</Link> page.
        </p>
      </Panel>
    </>
  );
}
