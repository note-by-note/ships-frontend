'use client';

// Every mentor/student conversation, for safety. Reported messages first.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading } from '@/components/dashboard-shell';
import { Alert, Badge, Spinner } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { ReviewedConversation } from '@/lib/types';

export default function MessageReviewPage() {
  const [rows, setRows] = useState<ReviewedConversation[] | null>(null);
  const [includeTest, setIncludeTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: ReviewedConversation[] }>(`/messages/review${includeTest ? '?includeTest=1' : ''}`)
      .then((body) => setRows(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load conversations.'));
  }, [includeTest]);

  return (
    <RequirePermission anyOf={['messages.review']}>
      <DashboardHeading
        title="Messages"
        description="Read-only access to mentor and student conversations, so staff can act on reports and check on students. Mentors and students are told staff can see their messages."
      />
      <label className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={includeTest} onChange={(event) => setIncludeTest(event.target.checked)} />
        Include test accounts
      </label>
      {error ? <Alert>{error}</Alert> : null}
      {!rows ? (
        <Spinner />
      ) : !rows.length ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-sm">No conversations yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.pairingId}>
              <Link
                href={`/admin/messages/${row.pairingId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-navy/20"
              >
                <span>
                  <span className="block font-semibold text-navy">
                    {row.mentor} and {row.student}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {row.instrument} · {row.messages} message{row.messages === 1 ? '' : 's'} · last{' '}
                    {new Date(row.lastMessageAt).toLocaleDateString()}
                  </span>
                </span>
                {row.openReports ? <Badge tone="danger">{row.openReports} reported</Badge> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RequirePermission>
  );
}
