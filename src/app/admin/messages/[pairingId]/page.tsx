'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading } from '@/components/dashboard-shell';
import { Alert, Button, Spinner, cx } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

interface ReviewThread {
  pairingId: string;
  mentor: string;
  student: string;
  instrument: string;
  status: string;
  messages: ChatMessage[];
}

export default function MessageReviewThreadPage({ params }: { params: Promise<{ pairingId: string }> }) {
  const { pairingId } = use(params);
  const [thread, setThread] = useState<ReviewThread | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: ReviewThread }>(`/messages/review/${pairingId}`)
      .then((body) => setThread(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load this conversation.'));
  }, [pairingId]);

  useEffect(load, [load]);

  async function resolve(message: ChatMessage) {
    try {
      await api.post(`/messages/review/${pairingId}/${message.id}/resolve`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
    }
  }

  return (
    <RequirePermission anyOf={['messages.review']}>
      <Link href="/admin/messages" className="mb-4 inline-block text-sm text-navy/70 hover:underline">
        ← All conversations
      </Link>
      {error ? <Alert>{error}</Alert> : null}
      {!thread ? (
        <Spinner />
      ) : (
        <>
          <DashboardHeading
            title={`${thread.mentor} and ${thread.student}`}
            description={`${thread.instrument} · read only. You can't write in this conversation.`}
          />
          <ol className="flex max-w-3xl flex-col gap-3">
            {thread.messages.map((message) => (
              <li
                key={message.id}
                className={cx(
                  'rounded-2xl bg-white p-4 shadow-sm',
                  message.report && !message.report.resolvedAt && 'ring-2 ring-danger',
                )}
              >
                <p className="text-xs font-semibold text-ink-faint">
                  {message.senderSide === 'mentor' ? thread.mentor : thread.student} ·{' '}
                  {new Date(message.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap text-ink">{message.body}</p>
                {message.report ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-danger-soft p-3 text-sm">
                    <span className="text-danger">
                      Reported {new Date(message.report.at).toLocaleString()}
                      {message.report.reason ? `: “${message.report.reason}”` : ''}
                      {message.report.resolvedAt ? ' · resolved' : ''}
                    </span>
                    {!message.report.resolvedAt ? (
                      <Button size="sm" variant="secondary" onClick={() => resolve(message)}>
                        Mark as handled
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </>
      )}
    </RequirePermission>
  );
}
