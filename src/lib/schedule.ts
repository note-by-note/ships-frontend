// Time helpers for availability and lesson times. Times are "HH:mm" in the
// mentor's time zone; the API applies the same rules (util/scheduling.ts).

import type { ScheduleDay, Weekday } from './types';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_NAMES: Record<Weekday, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function toTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** "16:30" → "4:30 PM" */
export function formatTime(time: string): string {
  const minutes = toMinutes(time);
  const hours = Math.floor(minutes / 60);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${((hours + 11) % 12) + 1}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
}

export function formatRange(start: string, durationMinutes: number): string {
  return `${formatTime(start)} – ${formatTime(toTime(toMinutes(start) + durationMinutes))}`;
}

/** "America/Toronto" → "Toronto time" */
export function zoneLabel(timeZone: string): string {
  return `${timeZone.split('/').pop()?.replace(/_/g, ' ') ?? timeZone} time`;
}

/** Start times of every block in a window, e.g. 16:00, 16:30 … 19:30. */
export function blocksIn(window: { start: string; end: string }, blockMinutes: number): string[] {
  const out: string[] = [];
  for (let m = toMinutes(window.start); m + blockMinutes <= toMinutes(window.end); m += blockMinutes) out.push(toTime(m));
  return out;
}

/** Lesson start times on a day where the whole lesson fits the mentor's free blocks and misses other lessons. */
export function validStarts(
  schedule: ScheduleDay[],
  busy: { day: Weekday; start: string; durationMinutes: number }[],
  day: Weekday,
  durationMinutes: number,
  blockMinutes: number,
): string[] {
  const free = new Set(schedule.find((entry) => entry.day === day)?.slots ?? []);
  return [...free].sort().filter((start) => {
    const begin = toMinutes(start);
    for (let block = begin; block < begin + durationMinutes; block += blockMinutes) {
      if (!free.has(toTime(block))) return false;
    }
    return !busy.some(
      (other) =>
        other.day === day &&
        begin < toMinutes(other.start) + other.durationMinutes &&
        toMinutes(other.start) < begin + durationMinutes,
    );
  });
}

const DAY_INDEX: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** The next `count` calendar dates falling on `day`, starting today. */
export function upcomingDates(day: Weekday, count: number): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (dates.length < count) {
    if (DAY_INDEX[cursor.getDay()] === day) dates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/** "2026-10-20" → "Tue, Oct 20" */
export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
