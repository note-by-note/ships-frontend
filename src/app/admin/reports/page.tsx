'use client';

// Concerns people reported about a mentor page, their lessons, a shared file,
// or in general. Open ones first. Reported messages are on the Conversations
// tab, inside each conversation. Admins only.

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading } from '@/components/dashboard-shell';
import { MessageTabs } from '@/components/staff-shell';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { TextArea } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';

interface ConcernReport {
  id: string;
  kind: 'mentor' | 'pairing' | 'resource' | 'team-thread' | 'general';
  about: string;
  category: string;
  details: string;
  reporterName: string;
  reporterEmail: string | null;
  pairingId: string | null;
  mentorId: string | null;
  teamThreadId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string;
  isTest: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  safety: 'Safety',
  inappropriate: 'Inappropriate',
  harassment: 'Bullying or harassment',
  privacy: 'Personal information',
  spam: 'Spam, scam or money',
  other: 'Other',
};

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ConcernReport[] | null>(null);
  const [reportedMessages, setReportedMessages] = useState(0);
  const [includeTest, setIncludeTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: ConcernReport[]; meta: { reportedMessages: number } }>(`/reports/review${includeTest ? '?includeTest=1' : ''}`)
      .then((body) => {
        setReports(body.data);
        setReportedMessages(body.meta.reportedMessages);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load reports.'));
  }, [includeTest]);

  useEffect(load, [load]);

  const open = (reports ?? []).filter((report) => !report.resolvedAt);
  const closed = (reports ?? []).filter((report) => report.resolvedAt);

  return (
    <RequirePermission anyOf={['messages.review']}>
      <MessageTabs />
      <DashboardHeading
        title="Reports"
        description="Concerns people raised about a mentor page, their lessons, a shared file, or anything else. The person reported is never told who raised it."
      />
      <label className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={includeTest} onChange={(event) => setIncludeTest(event.target.checked)} />
        Include test accounts
      </label>
      {error ? <Alert>{error}</Alert> : null}
      {reportedMessages ? (
        <div className="mb-6">
          <Alert tone="warn">
            {reportedMessages} reported message{reportedMessages === 1 ? ' is' : 's are'} waiting too.{' '}
            <Link href="/admin/messages" className="font-semibold underline underline-offset-2">See conversations</Link>
          </Alert>
        </div>
      ) : null}
      {!reports ? (
        <Spinner />
      ) : (
        <div className="flex max-w-3xl flex-col gap-8">
          <section aria-labelledby="open-reports">
            <h2 id="open-reports" className="mb-3 font-display text-xl font-bold text-navy">
              Open {open.length ? <span className="text-navy/50">({open.length})</span> : null}
            </h2>
            {open.length ? (
              <ul className="flex flex-col gap-3">
                {open.map((report) => (
                  <ReportItem key={report.id} report={report} onResolved={load} />
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-white p-5 text-sm text-ink-soft shadow-sm">No open reports.</p>
            )}
          </section>
          {closed.length ? (
            <section aria-labelledby="closed-reports">
              <h2 id="closed-reports" className="mb-3 font-display text-xl font-bold text-navy">Handled</h2>
              <ul className="flex flex-col gap-3">
                {closed.map((report) => (
                  <ReportItem key={report.id} report={report} onResolved={load} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </RequirePermission>
  );
}

function ReportItem({ report, onResolved }: { report: ConcernReport; onResolved: () => void }) {
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolve() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/reports/${report.id}/resolve`, { resolution: note.trim() });
      onResolved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
      setBusy(false);
    }
  }

  return (
    <li className={`rounded-2xl bg-white p-5 shadow-sm ${report.resolvedAt ? 'opacity-75' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
            {report.about}
            <Badge tone={report.category === 'safety' ? 'danger' : 'warn'}>{CATEGORY_LABELS[report.category] ?? report.category}</Badge>
            {report.isTest ? <Badge tone="neutral">Test</Badge> : null}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            From {report.reporterName}
            {report.reporterEmail ? ` (${report.reporterEmail})` : ''} · {when(report.createdAt)}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          {report.pairingId ? (
            <Link href={`/admin/messages/${report.pairingId}`} className="font-semibold text-navy underline underline-offset-2">
              Read their messages
            </Link>
          ) : null}
          {report.teamThreadId ? (
            <Link href={`/admin/team-messages/${report.teamThreadId}`} className="font-semibold text-navy underline underline-offset-2">
              Read the conversation
            </Link>
          ) : null}
          {report.mentorId ? (
            <Link href={`/admin/mentors/${report.mentorId}`} className="font-semibold text-navy underline underline-offset-2">
              Open the mentor page
            </Link>
          ) : null}
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line rounded-xl bg-paper p-3 text-sm text-ink">{report.details}</p>

      {report.resolvedAt ? (
        <p className="mt-3 text-sm text-ink-soft">
          Handled {when(report.resolvedAt)}
          {report.resolution ? `: ${report.resolution}` : '.'}
        </p>
      ) : resolving ? (
        <div className="mt-3 flex flex-col gap-2">
          <TextArea rows={2} maxLength={1000} placeholder="What was done (for the team’s record)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="What was done" />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={resolve}>{busy ? 'Saving…' : 'Mark as handled'}</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setResolving(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={() => setResolving(true)}>Mark as handled</Button>
        </div>
      )}
    </li>
  );
}
