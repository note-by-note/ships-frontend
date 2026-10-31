'use client';

// Messages between a mentor and their student.
//
// One conversation per pairing. The list sits beside the open conversation
// on wide screens; on phones you see one or the other. New messages are
// checked every few seconds while a conversation is open.
//
// Students are often minors, so the page says plainly that staff can read
// messages, and either side can report a message.

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import type { ChatMessage, Conversation, ConversationThread } from '@/lib/types';
import { Avatar } from './avatar';
import { Alert, Button, Spinner, cx } from './ui';
import { ReportConcernButton } from './report-concern';
import { ConductGate } from './conduct-acceptance';
import { useAuth } from './auth-provider';

const MAX_LENGTH = 2000;
export const MESSAGES_CHANGED = 'nbn:messages-changed';
const POLL_MS = 8000;

export function shortTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function SafetyNote({ className }: { className?: string }) {
  return (
    <p className={cx('rounded-xl bg-mist/60 px-4 py-3 text-xs leading-relaxed text-navy/75', className)}>
      Messages are kept, and Note by Note admins can read them to keep everyone safe. Keep it to lessons and music,
      and don&apos;t share phone numbers, home addresses or social media. If anything makes you uncomfortable, report
      the message or the conversation, or tell a parent or guardian.
    </p>
  );
}

export function MessagesHome({ selected }: { selected?: string }) {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: Conversation[] }>('/messages')
      .then((body) => {
        setConversations(body.data);
        // Lets the sidebar's unread badge catch up straight away.
        window.dispatchEvent(new Event(MESSAGES_CHANGED));
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load your messages.'));
  }, []);

  useEffect(load, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!conversations) return <Spinner label="Loading messages" />;

  if (!conversations.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="font-display text-xl font-bold text-navy">No conversations yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Once you&apos;re matched with a mentor or student, you can message each other here.
        </p>
      </div>
    );
  }

  // With nothing chosen, wide screens open the most recent conversation.
  const open = selected ?? conversations[0].pairingId;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <nav aria-label="Conversations" className={cx(selected && 'hidden lg:block')}>
        <ul className="flex flex-col gap-2">
          {conversations.map((conversation) => {
            const active = conversation.pairingId === open;
            return (
              <li key={conversation.pairingId}>
                <Link
                  href={`/dashboard/messages/${conversation.pairingId}`}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'flex items-center gap-3 rounded-2xl p-3 transition-colors',
                    active ? 'bg-white shadow-sm lg:ring-2 lg:ring-navy' : 'bg-white/60 hover:bg-white',
                  )}
                >
                  <Avatar name={conversation.with} photoPath={conversation.withPhotoPath} className="size-11 text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold text-navy">{conversation.with}</span>
                      {conversation.lastMessage ? (
                        <span className="shrink-0 text-xs text-ink-faint">{shortTime(conversation.lastMessage.createdAt)}</span>
                      ) : null}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-ink-soft">
                        {conversation.lastMessage
                          ? `${conversation.lastMessage.mine ? 'You: ' : ''}${conversation.lastMessage.body}`
                          : `${conversation.instrument} · Say hello`}
                      </span>
                      {conversation.unread ? (
                        <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cx(!selected && 'hidden lg:block')}>
        <Thread key={open} pairingId={open} onActivity={load} />
      </div>
    </div>
  );
}

function Thread({ pairingId, onActivity }: { pairingId: string; onActivity: () => void }) {
  const [thread, setThread] = useState<ConversationThread | null>(null);
  const [older, setOlder] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState<ChatMessage | null>(null);
  const { user } = useAuth();
  // Sending messages needs the current Code of Conduct accepted first.
  const needsConduct = Boolean(user && !user.agreements?.conduct);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const body = await api.get<{ data: ConversationThread }>(`/messages/${pairingId}`);
      setThread(body.data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We couldn’t load this conversation.');
    }
  }, [pairingId]);

  useEffect(() => {
    // The first load and the polling both only set state once a request comes back.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh().then(onActivity);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh, onActivity]);

  const messages = [...older, ...(thread?.messages ?? [])];

  // Scroll to the newest message when one arrives, not when older ones load.
  useEffect(() => {
    const count = thread?.messages.length ?? 0;
    if (count !== lastCount.current) endRef.current?.scrollIntoView({ block: 'end' });
    lastCount.current = count;
  }, [thread?.messages.length]);

  async function loadOlder() {
    const first = messages[0];
    if (!first) return;
    const body = await api.get<{ data: ConversationThread }>(`/messages/${pairingId}?before=${first.id}`);
    setOlder((current) => [...body.data.messages, ...current]);
    setThread((current) => (current ? { ...current, hasMore: body.data.hasMore } : current));
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.post(`/messages/${pairingId}`, { body: text });
      setDraft('');
      await refresh();
      onActivity();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That message didn’t send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter starts a new line.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  if (!thread) return error ? <Alert>{error}</Alert> : <Spinner label="Loading the conversation" />;

  let lastDay = '';

  return (
    <section className="flex h-[min(75vh,720px)] flex-col overflow-hidden rounded-2xl bg-white shadow-sm" aria-label={`Conversation with ${thread.with}`}>
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link href="/dashboard/messages" className="rounded-full p-1 text-navy/60 hover:bg-paper lg:hidden" aria-label="All conversations">
          ←
        </Link>
        <Avatar name={thread.with} photoPath={thread.withPhotoPath} className="size-10 text-sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{thread.with}</p>
          <p className="text-xs text-ink-faint">{thread.side === 'mentor' ? 'Your student' : 'Your mentor'}</p>
        </div>
        <ReportConcernButton kind="pairing" targetId={thread.pairingId} about={`Lessons with ${thread.with}`} label="Report" className="ml-auto shrink-0" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        <SafetyNote className="mb-4" />
        {thread.hasMore ? (
          <div className="mb-4 text-center">
            <button type="button" onClick={loadOlder} className="text-sm font-semibold text-navy underline underline-offset-4">
              Show older messages
            </button>
          </div>
        ) : null}
        {!messages.length ? (
          <p className="py-10 text-center text-sm text-ink-soft">No messages yet. Say hello!</p>
        ) : null}
        <ol className="flex flex-col gap-2">
          {messages.map((message) => {
            const day = dayLabel(message.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <li key={message.id} className="flex flex-col">
                {showDay ? <p className="my-3 text-center text-xs font-semibold text-ink-faint">{day}</p> : null}
                <div className={cx('group flex max-w-[85%] flex-col gap-1', message.mine ? 'items-end self-end' : 'items-start self-start')}>
                  <p
                    className={cx(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                      message.mine ? 'rounded-br-md bg-navy text-cream' : 'rounded-bl-md bg-paper text-navy',
                    )}
                  >
                    {message.body}
                  </p>
                  <span className="flex items-center gap-2 text-[11px] text-ink-faint">
                    {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    {message.mine && message.readAt ? <span>· Seen</span> : null}
                    {!message.mine ? (
                      message.reported ? (
                        <span className="text-warn">· Reported</span>
                      ) : (
                        <button type="button" onClick={() => setReporting(message)} className="underline-offset-2 hover:text-danger hover:underline">
                          Report
                        </button>
                      )
                    ) : null}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={endRef} />
      </div>

      {needsConduct ? (
        <div className="border-t border-line p-3">
          <ConductGate action="send messages" />
        </div>
      ) : (
      <form onSubmit={send} className="border-t border-line p-3">
        {error ? <p role="alert" className="mb-2 text-sm text-danger">{error}</p> : null}
        <div className="flex items-end gap-2">
          <label htmlFor={`compose-${pairingId}`} className="sr-only">
            Message {thread.with}
          </label>
          <textarea
            id={`compose-${pairingId}`}
            rows={2}
            maxLength={MAX_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message ${thread.with.split(' ')[0]}…`}
            className="min-h-11 flex-1 resize-none rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none"
          />
          <Button type="submit" disabled={sending || !draft.trim()}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
        {draft.length > MAX_LENGTH * 0.9 ? (
          <p className="mt-1 text-right text-xs text-warn">
            {draft.length} / {MAX_LENGTH}
          </p>
        ) : null}
      </form>
      )}

      {reporting ? (
        <ReportDialog
          pairingId={pairingId}
          message={reporting}
          onClose={() => setReporting(null)}
          onDone={() => {
            setReporting(null);
            void refresh();
          }}
        />
      ) : null}
    </section>
  );
}

function ReportDialog({
  pairingId,
  message,
  onClose,
  onDone,
}: {
  pairingId: string;
  message: ChatMessage;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post(`/messages/${pairingId}/${message.id}/report`, { reason: reason.trim() });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t go through. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="report-title" className="font-display text-xl font-bold text-navy">
          Report this message
        </h2>
        <p className="mt-2 rounded-lg bg-paper p-3 text-sm text-ink-soft">&ldquo;{message.body.slice(0, 200)}&rdquo;</p>
        <label htmlFor="report-reason" className="mt-4 block text-sm font-medium text-ink">
          What&apos;s wrong? (optional)
        </label>
        <textarea
          id="report-reason"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line-strong p-2.5 text-sm"
        />
        <p className="mt-2 text-xs text-ink-faint">
          Staff will look at it. The other person isn&apos;t notified. If you feel unsafe, tell a parent,
          guardian or another adult you trust too.
        </p>
        {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={busy}>
            {busy ? 'Sending…' : 'Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
