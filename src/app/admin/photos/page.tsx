'use client';

// Mentor photos waiting for approval. A photo only appears on the public
// site once someone here approves it.

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading } from '@/components/dashboard-shell';
import { MentorTabs } from '@/components/staff-shell';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { PendingPhoto } from '@/lib/types';

export default function PhotoQueuePage() {
  const [queue, setQueue] = useState<PendingPhoto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: PendingPhoto[] }>('/staff/photos')
      .then((body) => setQueue(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load the queue.'));
  }, []);

  useEffect(load, [load]);

  return (
    <RequirePermission anyOf={['mentors.manage']}>
      <MentorTabs />
      <DashboardHeading
        title="Mentor photos"
        description="Check each photo before it goes on a public page: a clear photo of the mentor, on their own, and nothing a family wouldn't expect to see."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!queue ? (
        <Spinner />
      ) : !queue.length ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-sm">No photos waiting.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {queue.map((item) => (
            <PhotoCard key={item.mentorId} item={item} onDone={load} />
          ))}
        </ul>
      )}
    </RequirePermission>
  );
}

function PhotoCard({ item, onDone }: { item: PendingPhoto; onDone: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The waiting photo isn't public, so it's fetched with the staff session.
  useEffect(() => {
    let url: string | null = null;
    api
      .blob(`/mentors/${item.mentorId}/pending-photo`)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => setError('The photo didn’t load.'));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [item.mentorId]);

  async function decide(action: 'approve' | 'decline') {
    setBusy(action);
    setError(null);
    try {
      await api.post(`/staff/photos/${item.mentorId}/${action}`, action === 'decline' ? { reason: reason.trim() } : undefined);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="aspect-square bg-paper">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- a private blob URL
          <img src={src} alt={`Photo uploaded by ${item.name}`} className="size-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/find-a-mentor/${item.slug}`} className="font-semibold text-navy hover:underline">
            {item.name}
          </Link>
          {item.isTest ? <Badge tone="warn">Test</Badge> : null}
          {item.replacesPhoto ? <Badge>Replaces current photo</Badge> : null}
        </div>
        {item.uploadedAt ? <p className="text-xs text-ink-faint">Uploaded {new Date(item.uploadedAt).toLocaleString()}</p> : null}
        <input
          aria-label="Reason if declining"
          value={reason}
          maxLength={300}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason if declining (the mentor sees it)"
          className="rounded-lg border border-line-strong px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="mt-auto flex gap-2">
          <Button size="sm" onClick={() => decide('approve')} disabled={busy !== null || !src}>
            {busy === 'approve' ? 'Saving…' : 'Approve'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => decide('decline')} disabled={busy !== null}>
            {busy === 'decline' ? 'Saving…' : 'Decline'}
          </Button>
        </div>
      </div>
    </li>
  );
}
