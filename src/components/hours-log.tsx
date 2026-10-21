'use client';

// A volunteer's own hours: log time, see what's approved, print a summary.
// Used by mentors (dashboard) and team members (staff area).

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import type { HoursEntry, Pairing } from '@/lib/types';
import { useAuth } from './auth-provider';
import { StatTile } from './dashboard-shell';
import { Alert, Badge, Button, Spinner } from './ui';
import { Field, Select, TextArea, TextInput } from './ui/fields';

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const STATUS_TONE = { pending: 'warn', approved: 'ok', declined: 'danger' } as const;
const STATUS_LABEL = { pending: 'Waiting for approval', approved: 'Approved', declined: 'Not approved' } as const;

export function HoursLog({ summaryHref, mentor }: { summaryHref: string; mentor: boolean }) {
  const [entries, setEntries] = useState<HoursEntry[] | null>(null);
  const [totals, setTotals] = useState({ approvedMinutes: 0, pendingMinutes: 0 });
  const [activities, setActivities] = useState<string[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      api.get<{ data: HoursEntry[]; meta: { approvedMinutes: number; pendingMinutes: number } }>('/hours/mine'),
      api.get<{ data: string[] }>('/hours/activities'),
      mentor ? api.get<{ data: Pairing[] }>('/lessons') : Promise.resolve({ data: [] as Pairing[] }),
    ])
      .then(([mine, list, lessons]) => {
        setEntries(mine.data);
        setTotals(mine.meta);
        setActivities(list.data);
        setPairings(lessons.data);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load your hours.'));
  }, [mentor]);

  useEffect(load, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!entries) return <Spinner label="Loading your hours" />;

  async function remove(entry: HoursEntry) {
    if (!window.confirm(`Remove ${formatMinutes(entry.minutes)} on ${entry.date}?`)) return;
    try {
      await api.delete(`/hours/${entry.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Approved" value={formatMinutes(totals.approvedMinutes)} hint="Counts toward your summary" />
        <StatTile label="Waiting for approval" value={formatMinutes(totals.pendingMinutes)} hint="Staff look at these and approve them" />
        <div className="flex flex-col justify-center rounded-2xl bg-white p-5 shadow-sm">
          <Link href={summaryHref} className="font-semibold text-navy underline underline-offset-4">
            Printable summary
          </Link>
          <p className="mt-1 text-xs text-ink-faint">For school community service records.</p>
        </div>
      </div>

      <LogForm activities={activities} pairings={pairings} onLogged={load} />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy">Your hours</h2>
        {!entries.length ? (
          <p className="mt-2 text-sm text-ink-soft">Nothing logged yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {formatMinutes(entry.minutes)} · {entry.activity}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {new Date(`${entry.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {entry.description ? ` · ${entry.description}` : ''}
                  </p>
                  {entry.status !== 'pending' && entry.reviewNote ? (
                    <p className="mt-1 text-xs text-ink-soft">
                      {entry.reviewerName}: “{entry.reviewNote}”
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
                  {entry.status === 'pending' ? (
                    <Button size="sm" variant="ghost" onClick={() => remove(entry)}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LogForm({ activities, pairings, onLogged }: { activities: string[]; pairings: Pairing[]; onLogged: () => void }) {
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // A mentor's weekly lessons, ready to log in one tap.
  const weekly = pairings.filter((pairing) => pairing.side === 'mentor' && pairing.lesson);
  const weeklyMinutes = weekly.reduce((sum, pairing) => sum + (pairing.lesson?.durationMinutes ?? 0), 0);

  function fillLessons() {
    setHours(String(Math.floor(weeklyMinutes / 60)));
    setMinutes(String(weeklyMinutes % 60));
    setActivity('Teaching lessons');
    setDescription(`Weekly lessons with ${weekly.map((pairing) => pairing.student.name.replace(/\s*\(test\)$/, '').split(' ')[0]).join(', ')}`);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDone(false);
    const total = Number(hours || 0) * 60 + Number(minutes || 0);
    if (total < 15) return setError('Log at least 15 minutes.');
    if (!activity) return setError('Choose what you did.');
    setBusy(true);
    try {
      await api.post('/hours', { date, minutes: total, activity, description: description.trim() });
      setDescription('');
      setDone(true);
      onLogged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-navy">Log time</h2>
        {weeklyMinutes ? (
          <Button type="button" size="sm" variant="secondary" onClick={fillLessons}>
            Fill in this week&apos;s lessons ({formatMinutes(weeklyMinutes)})
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" required>
          {({ id }) => <TextInput id={id} type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />}
        </Field>
        <Field label="How long" required>
          {({ id }) => (
            <div className="flex gap-2">
              <Select id={id} aria-label="Hours" value={hours} onChange={(e) => setHours(e.target.value)}>
                {Array.from({ length: 13 }, (_, value) => (
                  <option key={value} value={value}>
                    {value} h
                  </option>
                ))}
              </Select>
              <Select aria-label="Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)}>
                {[0, 15, 30, 45].map((value) => (
                  <option key={value} value={value}>
                    {value} min
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Field>
        <Field label="What you did" required>
          {({ id }) => (
            <Select id={id} value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="">Choose…</option>
              {activities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field label="Details">
        {({ id }) => (
          <TextArea id={id} rows={2} maxLength={500} value={description} placeholder="e.g. Built the new FAQ page" onChange={(e) => setDescription(e.target.value)} />
        )}
      </Field>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Log hours'}
        </Button>
        {done ? <span className="text-sm text-ok">Logged. Staff will approve it soon.</span> : null}
      </div>
    </form>
  );
}

/** Approved hours as a page to print or save as PDF. */
export function HoursSummary({ backHref }: { backHref: string }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<HoursEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const name = user?.name ?? '';

  useEffect(() => {
    api
      .get<{ data: HoursEntry[] }>('/hours/mine')
      .then((mine) => {
        setEntries(mine.data.filter((entry) => entry.status === 'approved').sort((a, b) => a.date.localeCompare(b.date)));
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load your hours.'));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!entries) return <Spinner label="Loading your summary" />;

  const total = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const reviewers = [...new Set(entries.map((entry) => entry.reviewerName).filter(Boolean))];
  const range = entries.length ? `${entries[0].date} to ${entries[entries.length - 1].date}` : '';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap gap-3 print:hidden">
        <Button onClick={() => window.print()}>Print or save as PDF</Button>
        <Link href={backHref} className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-navy">
          Back to my hours
        </Link>
      </div>

      <article className="rounded-2xl bg-white p-8 shadow-sm print:p-0 print:shadow-none">
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-faint uppercase">Note by Note</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy">Volunteer hours summary</h1>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-faint">Volunteer</dt>
            <dd className="font-semibold text-ink">{name.replace(/\s*\(test\)$/, '') || '—'}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Approved hours</dt>
            <dd className="font-semibold text-ink">{formatMinutes(total)}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Period</dt>
            <dd className="font-semibold text-ink">{range || 'No approved hours yet'}</dd>
          </div>
        </dl>

        {entries.length ? (
          <table className="mt-8 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-faint">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Activity</th>
                <th className="py-2 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2 align-top whitespace-nowrap">{entry.date}</td>
                  <td className="py-2 pr-4 align-top">
                    {entry.activity}
                    {entry.description ? <span className="block text-xs text-ink-soft">{entry.description}</span> : null}
                  </td>
                  <td className="py-2 text-right align-top whitespace-nowrap">{formatMinutes(entry.minutes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy font-semibold">
                <td className="py-2" colSpan={2}>
                  Total
                </td>
                <td className="py-2 text-right">{formatMinutes(total)}</td>
              </tr>
            </tfoot>
          </table>
        ) : null}

        <p className="mt-8 text-xs leading-relaxed text-ink-soft">
          Each entry was logged by the volunteer and approved by Note by Note staff
          {reviewers.length ? ` (${reviewers.join(', ')})` : ''}. Generated {new Date().toLocaleDateString()}.
          If your school needs a signature or a contact to confirm these hours, ask a Note by Note staff member.
        </p>
      </article>
    </div>
  );
}
