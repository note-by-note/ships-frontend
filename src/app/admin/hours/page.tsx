'use client';

// Staff approve the volunteer hours mentors and team members log.

import { useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading } from '@/components/dashboard-shell';
import { HoursTabs } from '@/components/staff-shell';
import { formatMinutes } from '@/components/hours-log';
import { Alert, Button, Spinner, cx } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { HoursEntry, HoursStatus } from '@/lib/types';

const TABS: { status: HoursStatus; label: string }[] = [
  { status: 'pending', label: 'To review' },
  { status: 'approved', label: 'Approved' },
  { status: 'declined', label: 'Not approved' },
];

export default function HoursReviewPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<HoursStatus>('pending');
  const [includeTest, setIncludeTest] = useState(false);
  const [entries, setEntries] = useState<HoursEntry[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: HoursEntry[]; meta: { counts: Record<string, number> } }>(
        `/hours/review?status=${status}${includeTest ? '&includeTest=1' : ''}`,
      )
      .then((body) => {
        setEntries(body.data);
        setCounts(body.meta.counts);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load hours.'));
  }, [status, includeTest]);

  useEffect(load, [load]);

  return (
    <RequirePermission anyOf={['hours.approve']}>
      <HoursTabs />
      <DashboardHeading
        title="Hours to approve"
        description="Time mentors and team members logged. Approved hours appear on the summary they print for school."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-full bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={status === tab.status}
              onClick={() => setStatus(tab.status)}
              className={cx(
                'rounded-full px-4 py-2 text-sm font-semibold',
                status === tab.status ? 'bg-navy text-cream' : 'text-navy/70 hover:text-navy',
              )}
            >
              {tab.label}
              {counts[tab.status] ? ` (${counts[tab.status]})` : ''}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={includeTest} onChange={(event) => setIncludeTest(event.target.checked)} />
          Include test accounts
        </label>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {!entries ? (
        <Spinner />
      ) : !entries.length ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-sm">Nothing here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <HoursRow key={entry.id} entry={entry} own={entry.userName === user?.name} onDone={load} />
          ))}
        </ul>
      )}
    </RequirePermission>
  );
}

function HoursRow({ entry, own, onDone }: { entry: HoursEntry; own: boolean; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(status: 'approved' | 'declined') {
    setBusy(status);
    setError(null);
    try {
      await api.post(`/hours/${entry.id}/review`, { status, note: note.trim() });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
      setBusy(null);
    }
  }

  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-navy">
            {entry.userName} · {formatMinutes(entry.minutes)}
          </p>
          <p className="text-sm text-ink-soft">
            {entry.activity} on {new Date(`${entry.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {entry.description ? <p className="mt-1 text-sm text-ink">“{entry.description}”</p> : null}
          {entry.status !== 'pending' ? (
            <p className="mt-1 text-xs text-ink-faint">
              {entry.status === 'approved' ? 'Approved' : 'Not approved'} by {entry.reviewerName}
              {entry.reviewNote ? `: “${entry.reviewNote}”` : ''}
            </p>
          ) : null}
        </div>
      </div>
      {entry.status === 'pending' ? (
        own ? (
          <p className="mt-3 text-xs text-ink-faint">These are your own hours, so someone else needs to approve them.</p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              aria-label={`Note for ${entry.userName}`}
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Note (optional, they'll see it)"
              className="min-w-0 flex-1 rounded-lg border border-line-strong px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={() => review('approved')} disabled={busy !== null}>
              {busy === 'approved' ? 'Saving…' : 'Approve'}
            </Button>
            <Button size="sm" variant="danger" onClick={() => review('declined')} disabled={busy !== null}>
              {busy === 'declined' ? 'Saving…' : 'Decline'}
            </Button>
          </div>
        )
      ) : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </li>
  );
}
