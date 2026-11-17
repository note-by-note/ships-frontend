'use client';

// Attendance across the program: which pairings are meeting, which keep
// missing lessons, and where nobody has marked the lessons yet. Counts and
// statuses only; lesson notes and messages stay private to each pairing.

import { useEffect, useState } from 'react';
import { RequirePermission } from '@/components/layout/admin-guard';
import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { Alert, Badge, EmptyState, Spinner, cx } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { STATUS_DOT, STATUS_LABEL } from '@/lib/calendar';
import { DAY_NAMES, formatDate, formatRange, zoneLabel } from '@/lib/schedule';
import type { AttendanceCounts, AttendanceOverview } from '@/lib/types';

const WEEKS = [4, 8, 12, 26];
type Filter = 'all' | 'attention' | 'unmarked';

/** Worth a look: missed more than once, or nothing held in a month of lessons. */
function needsAttention(counts: AttendanceCounts, recent: AttendanceOverview['pairings'][number]['recent']) {
  const missed = counts.student_missed + counts.mentor_missed;
  const lastFour = recent.slice(-4);
  return missed >= 2 || (lastFour.length === 4 && !lastFour.some((lesson) => lesson.status === 'held'));
}

function rate(counts: AttendanceCounts): string {
  const marked = counts.held + counts.student_missed + counts.mentor_missed;
  return marked ? `${Math.round((counts.held / marked) * 100)}%` : '–';
}

export default function AttendancePage() {
  const [weeks, setWeeks] = useState(8);
  const [includeTest, setIncludeTest] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [data, setData] = useState<AttendanceOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: AttendanceOverview }>(`/attendance?weeks=${weeks}${includeTest ? '&includeTest=1' : ''}`)
      .then((body) => {
        if (!cancelled) setData(body.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'We couldn’t load attendance.');
      });
    return () => {
      cancelled = true;
    };
  }, [weeks, includeTest]);

  const rows = (data?.pairings ?? []).filter((row) =>
    filter === 'attention' ? needsAttention(row.counts, row.recent) : filter === 'unmarked' ? row.counts.unmarked > 0 : true,
  );

  return (
    <RequirePermission anyOf={['applications.review']}>
      <DashboardHeading
        title="Attendance"
        description="How each pairing’s lessons are going. Mentors mark each lesson after it starts; a lesson someone said they couldn’t make counts as cancelled."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-navy">
          Show the last
          <select
            value={weeks}
            onChange={(event) => {
              setData(null);
              setWeeks(Number(event.target.value));
            }}
            className="rounded-lg border border-line-strong bg-white px-2 py-1.5 text-sm"
          >
            {WEEKS.map((value) => (
              <option key={value} value={value}>
                {value} weeks
              </option>
            ))}
          </select>
        </label>
        <div role="tablist" className="inline-flex rounded-full bg-white p-1 shadow-sm">
          {(
            [
              ['all', 'All pairings'],
              ['attention', 'Needs a look'],
              ['unmarked', 'Not marked'],
            ] as [Filter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={cx(
                'rounded-full px-3 py-1.5 text-sm font-semibold',
                filter === value ? 'bg-navy text-cream' : 'text-navy/70 hover:text-navy',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(event) => {
              setData(null);
              setIncludeTest(event.target.checked);
            }}
          />
          Include test accounts
        </label>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {!data && !error ? <Spinner /> : null}

      {data ? (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                ['Happened', data.totals.held, 'text-ok'],
                ['Student missed', data.totals.student_missed, 'text-warn'],
                ['Mentor missed', data.totals.mentor_missed, 'text-danger'],
                ['Cancelled', data.totals.cancelled, 'text-ink-soft'],
                ['Not marked', data.totals.unmarked, 'text-navy'],
              ] as [string, number, string][]
            ).map(([label, value, tone]) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                <dt className="text-xs font-semibold text-ink-soft">{label}</dt>
                <dd className={cx('font-display text-3xl font-bold', tone)}>{value}</dd>
              </div>
            ))}
          </dl>

          {!rows.length ? (
            <EmptyState
              title={data.pairings.length ? 'No pairings match' : 'No pairings yet'}
              description={
                data.pairings.length ? 'Try another filter.' : 'Once students and mentors are matched and agree a weekly time, their lessons show here.'
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="border-b border-line text-xs text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Pairing</th>
                    <th className="px-4 py-3 font-semibold">Weekly lesson</th>
                    <th className="px-4 py-3 font-semibold">Recent lessons</th>
                    <th className="px-4 py-3 font-semibold">Happened</th>
                    <th className="px-4 py-3 font-semibold">Missed</th>
                    <th className="px-4 py-3 font-semibold">Not marked</th>
                    <th className="px-4 py-3 font-semibold">Last happened</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy">
                          {row.student.name} <span className="font-normal text-ink-soft">with</span> {row.mentor.name}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {row.instrument}
                          {row.isTest ? (
                            <Badge className="ml-2" tone="accent">
                              Test
                            </Badge>
                          ) : null}
                          {needsAttention(row.counts, row.recent) ? (
                            <Badge className="ml-2" tone="warn">
                              Needs a look
                            </Badge>
                          ) : null}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {row.lesson ? (
                          <>
                            {DAY_NAMES[row.lesson.day]}s, {formatRange(row.lesson.start, row.lesson.durationMinutes)}
                            <span className="block text-xs">{zoneLabel(row.lesson.timeZone)}</span>
                          </>
                        ) : (
                          'Not agreed yet'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.recent.length ? (
                          <span className="flex gap-1">
                            {row.recent.map((lesson) => (
                              <span
                                key={lesson.date}
                                title={`${formatDate(lesson.date)}: ${lesson.status ? STATUS_LABEL[lesson.status] : 'Not marked'}`}
                                className={cx('size-3 rounded-full', STATUS_DOT[lesson.status ?? 'unmarked'])}
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="text-ink-faint">None yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-navy">
                        {row.counts.held} <span className="text-xs text-ink-soft">({rate(row.counts)})</span>
                      </td>
                      <td className="px-4 py-3 text-navy">
                        {row.counts.student_missed + row.counts.mentor_missed}
                        {row.counts.mentor_missed ? (
                          <span className="block text-xs text-ink-soft">{row.counts.mentor_missed} by mentor</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-navy">{row.counts.unmarked}</td>
                      <td className="px-4 py-3 text-ink-soft">{row.lastHeld ? formatDate(row.lastHeld) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-ink-faint">
            Dots, oldest to newest: green happened, amber student missed, red mentor missed, grey cancelled, white not marked.
            “Happened” percentage leaves out cancelled lessons.
          </p>
        </>
      ) : null}
    </RequirePermission>
  );
}
