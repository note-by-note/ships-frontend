// Helpers for the calendar page: month grids, showing lessons in the viewer's
// own time zone, attendance words, and calendar files and feed addresses.
//
// Lessons come from the API with exact moments (`startsAt`), so each viewer
// sees them on their own clock. Important dates and logged hours are whole
// days and mean that day wherever the reader is.

import { API_BASE_URL } from './api';
import type { AttendanceStatus, LessonEvent } from './types';

/** A local date as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

/** "2026-11-17" → a Date at local noon (safe from daylight saving edges). */
export function fromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDaysKey(key: string, days: number): string {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/** The 6 weeks shown for a month, Monday first, as YYYY-MM-DD. */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset, 12);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return dayKey(day);
  });
}

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The local day a lesson falls on for this viewer. */
export function lessonDay(lesson: Pick<LessonEvent, 'startsAt'>): string {
  return dayKey(new Date(lesson.startsAt));
}

/** "4:00 PM" on the viewer's clock, the same style as the rest of the site. */
export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function clockRange(lesson: Pick<LessonEvent, 'startsAt' | 'endsAt'>): string {
  return `${clock(lesson.startsAt)} – ${clock(lesson.endsAt)}`;
}

/** "Tuesday, November 17" */
export function longDay(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function monthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** The viewer's own time zone, e.g. "America/Vancouver". */
export function viewerZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** How far a time zone is ahead of UTC at a moment, in milliseconds. */
function zoneOffset(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return asUtc - Math.floor(instant.getTime() / 60_000) * 60_000;
}

/** A date and "HH:mm" on another time zone's clock, as an exact moment (same rule as the API). */
export function zonedMoment(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const wall = Date.UTC(year, month - 1, day, hours, minutes);
  let instant = wall - zoneOffset(new Date(wall), timeZone);
  instant = wall - zoneOffset(new Date(instant), timeZone);
  return new Date(instant);
}

/**
 * A weekly time in the mentor's zone, on the viewer's clock this coming week,
 * e.g. "1:00 PM" (plus the weekday when it falls on a different day). Null
 * when both share a time zone.
 */
export function yourTime(day: string, start: string, durationMinutes: number, timeZone: string): string | null {
  if (timeZone === viewerZone()) return null;
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (order[cursor.getDay()] !== day) cursor.setDate(cursor.getDate() + 1);
  const begins = zonedMoment(dayKey(cursor), start, timeZone);
  const ends = new Date(begins.getTime() + durationMinutes * 60_000);
  const sameDay = order[begins.getDay()] === day;
  const weekday = sameDay ? '' : `${begins.toLocaleDateString(undefined, { weekday: 'long' })} `;
  return `${weekday}${clock(begins.toISOString())} – ${clock(ends.toISOString())}`;
}

export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  held: 'Happened',
  student_missed: 'Student missed',
  mentor_missed: 'Mentor missed',
  cancelled: 'Cancelled',
};

export const STATUS_TONE: Record<AttendanceStatus, 'ok' | 'warn' | 'danger' | 'neutral'> = {
  held: 'ok',
  student_missed: 'warn',
  mentor_missed: 'danger',
  cancelled: 'neutral',
};

/** Dot colours for the attendance rows and the month grid. */
export const STATUS_DOT: Record<AttendanceStatus | 'unmarked' | 'upcoming', string> = {
  held: 'bg-ok',
  student_missed: 'bg-warn',
  mentor_missed: 'bg-danger',
  cancelled: 'bg-ink-faint',
  unmarked: 'bg-white ring-1 ring-inset ring-line-strong',
  upcoming: 'bg-navy',
};

export const firstName = (name: string) => name.replace(/\s*\(test\)$/, '').split(' ')[0];

// --- Calendar files and feeds -----------------------------------------------------------------

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const icsStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** Download one lesson as a .ics file, which any calendar app can open. */
export function downloadLesson(lesson: LessonEvent): void {
  const title = `${lesson.instrument} lesson with ${firstName(lesson.withName)}`;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Note by Note//Lessons//EN',
    'BEGIN:VEVENT',
    `UID:lesson-${lesson.matchId}-${lesson.date}@notebynote`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(lesson.startsAt)}`,
    `DTEND:${icsStamp(lesson.endsAt)}`,
    `SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(lesson.meetingUrl ? `Join the call: ${lesson.meetingUrl}` : 'Online lesson on Note by Note')}`,
    `LOCATION:${icsText(lesson.meetingUrl ?? 'Online')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `lesson-${lesson.date}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The private feed address calendar apps subscribe to. */
export function feedUrl(token: string): string {
  return `${API_BASE_URL}/calendar/feed/${token}.ics`;
}

/** The same address as webcal://, which opens Apple Calendar or Outlook on the device. */
export function webcalUrl(token: string): string {
  return feedUrl(token).replace(/^https?:/, 'webcal:');
}

/** Opens Google Calendar's "add this calendar?" screen. */
export function googleSubscribeUrl(token: string): string {
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl(token))}`;
}
