'use client';

// Team messages: conversations between the mentors and the staff teams
// (Admin, Tech, Outreach, Marketing).
//
// A conversation has a subject and goes to the teams you pick. Staff write
// for their team or as themselves; mentors write as themselves, so a question
// to Tech isn't seen by every mentor. Anyone in a conversation can bring in
// another team, and messages can be images: chosen with the button or pasted
// into the box. The list sits beside the open conversation on wide screens,
// where it can be closed to give the chat more room; on phones you see one or
// the other. Used in the staff area and on the mentor dashboard, which pass
// their own `base` path.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import { fittedJpeg } from '@/lib/images';
import {
  ALL_TEAMS,
  TEAM_LABELS,
  teamListLabel,
  type Team,
  type TeamMessage,
  type TeamThread,
  type TeamThreadSummary,
  type TeamThreadsMeta,
} from '@/lib/types';
import { useAuth } from '../account/auth-provider';
import { ConductGate } from '../policies/conduct-acceptance';
import { ConversationListToggle, MESSAGE_ACTION_TAP, dayLabel, enterSends, shortTime, useConversationList } from './messages';
import { ReportConcernButton } from '../policies/report-concern';
import { Alert, Button, Spinner, cx } from '../ui';
import { Field, TextInput } from '../ui/fields';

const MAX_LENGTH = 4000;
const SUBJECT_MAX_LENGTH = 120;
const POLL_MS = 8000;
export const TEAM_MESSAGES_CHANGED = 'nbn:team-messages-changed';

/** What went wrong sending, in words. `fittedJpeg` fails with "unreadable" on images the browser can't open. */
function sendError(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  return err instanceof Error && err.message === 'unreadable' ? 'We can’t read that image. Try a JPEG or PNG.' : fallback;
}

const chip = (on: boolean) =>
  cx('rounded-full border px-3 py-1 text-sm pointer-coarse:py-2', on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft');

/**
 * Unread team messages for a sidebar badge. Checked on every page change and
 * once a minute while the tab is open.
 */
export function useTeamUnread(enabled: boolean, pathname: string): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const check = () =>
      api
        .get<{ meta: TeamThreadsMeta }>('/team-messages')
        .then((body) => !cancelled && setUnread(body.meta.unread))
        .catch(() => undefined);
    void check();
    const timer = setInterval(check, 60_000);
    window.addEventListener(TEAM_MESSAGES_CHANGED, check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(TEAM_MESSAGES_CHANGED, check);
    };
  }, [enabled, pathname]);

  return enabled ? unread : 0;
}

export function TeamSafetyNote({ className }: { className?: string }) {
  return (
    <p className={cx('rounded-xl bg-mist/60 px-4 py-3 text-xs leading-relaxed text-navy/75', className)}>
      Everyone on the teams in a conversation can read it, and Note by Note admins can read every team conversation.
      Messages are kept. Only share a student&apos;s personal details when the work needs them.
    </p>
  );
}

export function TeamMessagesHome({ base, selected }: { base: string; selected?: string }) {
  const router = useRouter();
  const [threads, setThreads] = useState<TeamThreadSummary[] | null>(null);
  const [meta, setMeta] = useState<TeamThreadsMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [composing, setComposing] = useState(false);
  const { listOpen, toggleList } = useConversationList();

  const load = useCallback(() => {
    api
      .get<{ data: TeamThreadSummary[]; meta: TeamThreadsMeta }>(`/team-messages${showAll ? '?all=1' : ''}`)
      .then((body) => {
        setThreads(body.data);
        setMeta(body.meta);
        // Lets the sidebar's unread badge catch up straight away.
        window.dispatchEvent(new Event(TEAM_MESSAGES_CHANGED));
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load team messages.'));
  }, [showAll]);

  useEffect(load, [load]);

  if (error) return <Alert>{error}</Alert>;
  if (!threads || !meta) return <Spinner label="Loading team messages" />;
  if (!meta.myTeams.length && !meta.canReviewAll) {
    return <Alert tone="neutral">Team messages are for mentors and the Note by Note teams.</Alert>;
  }

  // With nothing chosen, wide screens open the most recent conversation.
  const open = selected ?? threads[0]?.id;
  const focused = Boolean(selected) || composing;

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden items-center justify-between gap-3 lg:flex">
        <ConversationListToggle open={listOpen} unread={meta.unread} onToggle={toggleList} />
        {/* New conversation lives in the list, so it's here while the list is closed. */}
        {!listOpen && !composing && open ? (
          <Button type="button" size="sm" onClick={() => setComposing(true)}>
            New conversation
          </Button>
        ) : null}
      </div>
      <div className={cx('grid gap-6', listOpen ? 'lg:grid-cols-[320px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]')}>
        <div className={cx('flex-col gap-3', focused ? 'hidden' : 'flex', listOpen ? 'lg:flex' : 'lg:hidden')}>
          <Button type="button" onClick={() => setComposing(true)}>
            New conversation
          </Button>
          {meta.canReviewAll ? (
            <div className="flex gap-2" role="group" aria-label="Which conversations">
              <button type="button" aria-pressed={!showAll} onClick={() => setShowAll(false)} className={chip(!showAll)}>
                Mine
              </button>
              <button type="button" aria-pressed={showAll} onClick={() => setShowAll(true)} className={chip(showAll)}>
                Every team&apos;s
              </button>
            </div>
          ) : null}
          {threads.length ? (
            <nav aria-label="Team conversations">
              <ul className="flex flex-col gap-2">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <ThreadLink thread={thread} href={`${base}/${thread.id}`} active={!composing && thread.id === open} onOpen={() => setComposing(false)} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="rounded-2xl bg-white/60 p-4 text-sm text-ink-soft">
              {showAll ? 'No team conversations yet.' : 'No conversations yet. Start one to ask another team something or share an update.'}
            </p>
          )}
        </div>

        <div className={cx(!focused && 'hidden lg:block')}>
          {composing || !open ? (
            <NewConversation
              meta={meta}
              onCancel={threads.length ? () => setComposing(false) : undefined}
              onCreated={(id) => {
                setComposing(false);
                load();
                router.push(`${base}/${id}`);
              }}
            />
          ) : (
            <Thread key={open} id={open} base={base} meta={meta} onActivity={load} />
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadLink({ thread, href, active, onOpen }: { thread: TeamThreadSummary; href: string; active: boolean; onOpen: () => void }) {
  const last = thread.lastMessage;
  const preview = !last
    ? ''
    : last.kind === 'teams-added'
      ? `${last.mine ? 'You' : last.senderName} added ${last.body}`
      : `${last.mine ? 'You' : last.senderName.split(' ')[0]}: ${last.body || 'Sent an image'}`;
  return (
    <Link
      href={href}
      onClick={onOpen}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'block rounded-2xl p-3 transition-colors',
        active ? 'bg-white shadow-sm lg:ring-2 lg:ring-navy' : 'bg-white/60 hover:bg-white',
      )}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className={cx('truncate text-navy', thread.unread ? 'font-bold' : 'font-semibold')}>{thread.subject}</span>
        <span className="shrink-0 text-xs text-ink-faint">{shortTime(thread.lastMessageAt)}</span>
      </span>
      <span className="mt-0.5 block truncate text-xs font-medium text-navy/60">{teamListLabel(thread.teams, thread.people)}</span>
      <span className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm text-ink-soft">{preview}</span>
        {thread.unread ? (
          <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
            {thread.unread}
            <span className="sr-only"> unread</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function NewConversation({
  meta,
  onCreated,
  onCancel,
}: {
  meta: TeamThreadsMeta;
  onCreated: (id: string) => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState<Team[]>([]);
  const [from, setFrom] = useState<Team | 'me'>(meta.fromChoices[0] ?? 'me');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toChoices = ALL_TEAMS.filter((team) => team !== 'mentors' || meta.canWriteToMentors);
  const included = [...new Set([...to, ...(from === 'me' ? [] : [from])])];

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!subject.trim()) return setError('Add a subject.');
    if (!to.length) return setError('Choose at least one team to send this to.');
    if (!body.trim()) return setError('Write a message first.');
    setBusy(true);
    setError(null);
    try {
      // Ready before the conversation is made, so an unreadable image stops here.
      const jpeg = image ? await fittedJpeg(image) : null;
      const created = await api.post<{ data: { id: string } }>('/team-messages', { subject: subject.trim(), to, from, body: body.trim() });
      if (jpeg) {
        try {
          await api.upload(`/team-messages/${created.data.id}/images`, jpeg);
        } catch {
          window.alert('Your conversation started, but the image didn’t send. You can add it again in the conversation.');
        }
      }
      onCreated(created.data.id);
    } catch (err) {
      setError(sendError(err, 'That didn’t send. Please try again.'));
      setBusy(false);
    }
  }

  if (user && !user.agreements?.conduct) {
    return <ConductGate action="message other teams" />;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm md:p-6" aria-labelledby="new-team-conversation">
      <h2 id="new-team-conversation" className="font-display text-2xl font-bold text-navy">
        New conversation
      </h2>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">To</legend>
        <div className="flex flex-wrap gap-2">
          {toChoices.map((team) => {
            const on = to.includes(team);
            return (
              <button
                key={team}
                type="button"
                aria-pressed={on}
                onClick={() => setTo(on ? to.filter((entry) => entry !== team) : [...to, team])}
                className={chip(on)}
              >
                {TEAM_LABELS[team]}
              </button>
            );
          })}
        </div>
        {meta.canWriteToMentors ? (
          <p className="mt-2 text-xs text-ink-faint">Mentors reaches every mentor.</p>
        ) : null}
      </fieldset>

      {meta.fromChoices.length ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">From</legend>
          <div className="flex flex-wrap gap-2">
            {meta.fromChoices.map((team) => (
              <button key={team} type="button" aria-pressed={from === team} onClick={() => setFrom(team)} className={chip(from === team)}>
                {TEAM_LABELS[team]} team
              </button>
            ))}
            <button type="button" aria-pressed={from === 'me'} onClick={() => setFrom('me')} className={chip(from === 'me')}>
              Just me
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            {from === 'me'
              ? 'Only you, not your whole team, will be in the conversation.'
              : `Everyone on ${TEAM_LABELS[from]} will be in the conversation.`}
          </p>
        </fieldset>
      ) : null}

      <Field label="Subject" required>
        {({ id }) => (
          <TextInput
            id={id}
            value={subject}
            maxLength={SUBJECT_MAX_LENGTH}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Help with the application form"
          />
        )}
      </Field>

      <Field label="Message" required>
        {({ id }) => (
          <textarea
            id={id}
            rows={5}
            maxLength={MAX_LENGTH}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onPaste={(event) => pasteImage(event, setImage)}
            className="w-full resize-y rounded-lg border border-line-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none"
          />
        )}
      </Field>

      {image ? <ImagePreview file={image} onRemove={() => setImage(null)} /> : <AttachImage onPick={setImage} withLabel />}

      {included.length ? (
        <p className="text-sm text-ink-soft">
          Seen by <span className="font-medium text-ink">{teamListLabel(included, from === 'me' ? ['you'] : [])}</span>
          {included.includes('admin') ? '.' : ', and admins can read it too.'}
        </p>
      ) : null}
      <TeamSafetyNote />
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </form>
  );
}

function Thread({ id, base, meta, onActivity }: { id: string; base: string; meta: TeamThreadsMeta; onActivity: () => void }) {
  const [thread, setThread] = useState<TeamThread | null>(null);
  const [older, setOlder] = useState<TeamMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TeamMessage | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const { user } = useAuth();
  const needsConduct = Boolean(user && !user.agreements?.conduct);
  const canReply = Boolean(thread?.member) && !needsConduct;
  const endRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const lastCount = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const body = await api.get<{ data: TeamThread }>(`/team-messages/${id}`);
      setThread(body.data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We couldn’t load this conversation.');
    }
  }, [id]);

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
    const body = await api.get<{ data: TeamThread }>(`/team-messages/${id}?before=${first.id}`);
    setOlder((current) => [...body.data.messages, ...current]);
    setThread((current) => (current ? { ...current, hasMore: body.data.hasMore } : current));
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if ((!text && !image) || sending) return;
    setSending(true);
    setError(null);
    try {
      // An image goes first, as its own message, with any words as a message after it.
      let replyId = replyingTo?.id;
      if (image) {
        await api.upload(`/team-messages/${id}/images${replyId ? `?replyTo=${replyId}` : ''}`, await fittedJpeg(image));
        setImage(null);
        setReplyingTo(null);
        replyId = undefined;
      }
      if (text) await api.post(`/team-messages/${id}`, { body: text, ...(replyId ? { replyTo: replyId } : {}) });
      setDraft('');
      setReplyingTo(null);
      await refresh();
      onActivity();
    } catch (err) {
      setError(sendError(err, 'That message didn’t send. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter starts a new line; Escape stops replying to a message.
    if (enterSends(event)) {
      event.preventDefault();
      void send();
    } else if (event.key === 'Escape' && replyingTo) {
      setReplyingTo(null);
    }
  }

  function replyTo(message: TeamMessage) {
    setReplyingTo(message);
    composeRef.current?.focus();
  }

  /** Jump to the message a reply quotes, if it's loaded, and highlight it for a moment. */
  function showOriginal(messageId: string) {
    const element = document.getElementById(`team-message-${messageId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-gold');
    setTimeout(() => element.classList.remove('ring-2', 'ring-gold'), 1500);
  }

  if (!thread) return error ? <Alert>{error}</Alert> : <Spinner label="Loading the conversation" />;

  const addable = ALL_TEAMS.filter((team) => !thread.teams.includes(team) && (team !== 'mentors' || meta.canWriteToMentors));
  let lastDay = '';

  return (
    <section className="flex h-[min(78dvh,760px)] flex-col overflow-hidden rounded-2xl bg-white shadow-sm" aria-label={thread.subject}>
      <header className="border-b border-line px-4 py-3">
        <div className="flex items-start gap-3">
          <Link href={base} className="rounded-full p-1 text-navy/60 hover:bg-paper lg:hidden" aria-label="All team conversations">
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-navy">{thread.subject}</h2>
            <p className="text-xs text-ink-faint">Between {teamListLabel(thread.teams, thread.people)}</p>
          </div>
          {thread.member ? (
            <div className="flex shrink-0 items-center gap-3">
              {addable.length ? (
                <button type="button" onClick={() => setAdding((value) => !value)} aria-expanded={adding} className="text-sm font-semibold text-navy underline-offset-2 hover:underline">
                  Add a team
                </button>
              ) : null}
              <ReportConcernButton kind="team-thread" targetId={thread.id} about={`Team conversation: ${thread.subject}`} label="Report" />
            </div>
          ) : null}
        </div>
        {adding ? (
          <AddTeams
            id={thread.id}
            choices={addable}
            onDone={() => {
              setAdding(false);
              void refresh().then(onActivity);
            }}
          />
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        <TeamSafetyNote className="mb-4" />
        {thread.hasMore ? (
          <div className="mb-4 text-center">
            <button type="button" onClick={loadOlder} className="text-sm font-semibold text-navy underline underline-offset-4">
              Show older messages
            </button>
          </div>
        ) : null}
        <ol className="flex flex-col">
          {messages.map((message, index) => {
            const day = dayLabel(message.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const previous = messages[index - 1];
            // Name and team once per run of messages from the same person.
            const showName = !message.mine && (showDay || previous?.kind !== 'message' || previous.senderName !== message.senderName);
            return (
              // The whole row, with no gaps between rows, so Reply shows when you're near a message too.
              <li key={message.id} className="group flex flex-col py-1.5">
                {showDay ? <p className="my-3 text-center text-xs font-semibold text-ink-faint">{day}</p> : null}
                {message.kind === 'teams-added' ? (
                  <p className="self-center rounded-full bg-paper px-3 py-1 text-xs text-ink-soft">
                    {message.mine ? 'You' : message.senderName} added {message.body}
                  </p>
                ) : (
                  <div className={cx('flex max-w-[85%] flex-col gap-1', message.mine ? 'items-end self-end' : 'items-start self-start')}>
                    {showName ? (
                      <p className="text-xs text-ink-soft">
                        <span className="font-semibold text-navy">{message.senderName}</span>
                        {message.senderTeam ? ` · ${TEAM_LABELS[message.senderTeam]}` : null}
                      </p>
                    ) : null}
                    {message.replyTo ? (
                      <button
                        type="button"
                        onClick={() => showOriginal(message.replyTo!.id)}
                        className="max-w-full rounded-lg border-l-4 border-gold bg-paper/70 px-3 py-1.5 text-left text-xs text-ink-soft hover:bg-paper"
                      >
                        <span className="block font-semibold text-navy">
                          {message.replyTo.mine ? 'You' : message.replyTo.senderName}
                        </span>
                        <span className="line-clamp-2">{message.replyTo.body}</span>
                      </button>
                    ) : null}
                    {message.hasImage ? (
                      <TeamImage threadId={id} messageId={message.id} alt={`Image from ${message.mine ? 'you' : message.senderName}`} />
                    ) : (
                      <p
                        id={`team-message-${message.id}`}
                        className={cx(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap transition-shadow',
                          message.mine ? 'rounded-br-md bg-navy text-cream' : 'rounded-bl-md bg-paper text-navy',
                        )}
                      >
                        {message.body}
                      </p>
                    )}
                    <span className="flex items-center gap-2 text-[11px] text-ink-faint">
                      {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      {canReply ? (
                        <button
                          type="button"
                          onClick={() => replyTo(message)}
                          aria-label={`Reply to ${message.mine ? 'your message' : message.senderName}`}
                          // Only hidden where there's a mouse to bring it back: phones always show it, and so does tabbing to it.
                          className={cx(
                            'font-semibold text-navy/70 underline-offset-2 transition-opacity group-hover:opacity-100 hover:text-navy hover:underline focus-visible:opacity-100 [@media(hover:hover)]:opacity-0',
                            MESSAGE_ACTION_TAP,
                          )}
                        >
                          Reply
                        </button>
                      ) : null}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <div ref={endRef} />
      </div>

      {!thread.member ? (
        <p className="border-t border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          You&apos;re reading this as an admin. Only the teams in this conversation can reply.
        </p>
      ) : needsConduct ? (
        <div className="border-t border-line p-3">
          <ConductGate action="send messages" />
        </div>
      ) : (
        <form onSubmit={send} className="border-t border-line p-3">
          {error ? <p role="alert" className="mb-2 text-sm text-danger">{error}</p> : null}
          {replyingTo ? (
            <div className="mb-2 flex items-start gap-3 rounded-lg border-l-4 border-gold bg-paper px-3 py-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">Replying to {replyingTo.mine ? 'yourself' : replyingTo.senderName}</p>
                <p className="truncate text-ink-soft">{replyingTo.body || 'Image'}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                aria-label="Stop replying to this message"
                className="rounded-full px-1.5 text-base leading-none text-navy/60 hover:bg-white hover:text-navy"
              >
                ×
              </button>
            </div>
          ) : null}
          {image ? <ImagePreview file={image} onRemove={() => setImage(null)} className="mb-2" /> : null}
          <div className="flex items-end gap-2">
            <AttachImage onPick={setImage} />
            <label htmlFor={`team-compose-${id}`} className="sr-only">
              {replyingTo ? `Reply to ${replyingTo.senderName}` : `Reply to ${thread.subject}`}
            </label>
            <textarea
              ref={composeRef}
              id={`team-compose-${id}`}
              rows={2}
              maxLength={MAX_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              onPaste={(event) => pasteImage(event, setImage)}
              placeholder={thread.writingFor ? `Reply for ${TEAM_LABELS[thread.writingFor]}…` : 'Reply…'}
              className="min-h-11 flex-1 resize-none rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none"
            />
            <Button type="submit" disabled={sending || (!draft.trim() && !image)}>
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
    </section>
  );
}

/** Use an image pasted into the message box, like a screenshot. */
function pasteImage(event: ClipboardEvent, onPick: (file: File) => void) {
  const pasted = [...event.clipboardData.files].find((file) => file.type.startsWith('image/'));
  if (!pasted) return;
  event.preventDefault();
  onPick(pasted);
}

function AttachImage({ onPick, withLabel = false }: { onPick: (file: File) => void; withLabel?: boolean }) {
  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Cleared so choosing the same image again still counts as a change.
    event.target.value = '';
    if (file) onPick(file);
  }
  return (
    <label
      title="Add an image"
      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl border border-line-strong px-3 text-sm font-medium text-navy hover:bg-paper focus-within:ring-2 focus-within:ring-navy"
    >
      <input type="file" accept="image/*" onChange={choose} aria-label="Add an image" className="sr-only" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      {withLabel ? 'Add an image' : null}
    </label>
  );
}

/** The image waiting to be sent. */
function ImagePreview({ file, onRemove, className }: { file: File; onRemove: () => void; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const next = URL.createObjectURL(file);
    // Made here, not during render, so it can be released when the image changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return (
    <div className={cx('flex items-center gap-3 rounded-lg bg-paper p-2 text-sm', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a local preview */}
      {url ? <img src={url} alt="" className="size-14 rounded-md object-cover" /> : <span className="size-14" />}
      <span className="min-w-0 flex-1 truncate text-ink-soft">{file.name || 'Pasted image'}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove this image"
        className="rounded-full px-1.5 text-base leading-none text-navy/60 hover:bg-white hover:text-navy"
      >
        ×
      </button>
    </div>
  );
}

/**
 * An image in a conversation. Fetched while signed in, since only people who
 * can read the conversation may see it. The box has a set size so messages
 * don't jump as images load. Clicking opens it full size.
 */
function TeamImage({ threadId, messageId, alt }: { threadId: string; messageId: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let made: string | null = null;
    api
      .blob(`/team-messages/${threadId}/images/${messageId}`)
      .then((blob) => {
        if (cancelled) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [threadId, messageId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const box = 'block h-52 w-64 max-w-full rounded-2xl bg-paper transition-shadow';
  if (failed) {
    return (
      <p id={`team-message-${messageId}`} className="rounded-2xl bg-paper px-4 py-2.5 text-sm text-ink-soft">
        This image didn’t load.
      </p>
    );
  }
  if (!url) return <div id={`team-message-${messageId}`} className={box} aria-label="Loading image" role="img" />;

  return (
    <>
      <button id={`team-message-${messageId}`} type="button" onClick={() => setOpen(true)} className={cx(box, 'overflow-hidden')} aria-label={`${alt}. Open full size`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a private image, fetched while signed in */}
        <img src={url} alt={alt} className="size-full object-contain" />
      </button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-navy/80 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- a private image, fetched while signed in */}
          <img src={url} alt={alt} onClick={(event) => event.stopPropagation()} className="max-h-[85dvh] max-w-full rounded-lg object-contain" />
          <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
            <a href={url} download="team-image.jpg" className="rounded-full bg-cream px-4 py-1.5 text-sm font-semibold text-navy">
              Save
            </a>
            <button type="button" autoFocus onClick={() => setOpen(false)} className="rounded-full border border-cream/60 px-4 py-1.5 text-sm font-semibold text-cream">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Bring more teams into a conversation. They see everything said so far. */
function AddTeams({ id, choices, onDone }: { id: string; choices: Team[]; onDone: () => void }) {
  const [picked, setPicked] = useState<Team[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/team-messages/${id}/teams`, { teams: picked });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-paper p-3">
      <p className="text-sm text-ink">Which teams should join? They&apos;ll see everything said so far.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {choices.map((team) => {
          const on = picked.includes(team);
          return (
            <button
              key={team}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(on ? picked.filter((entry) => entry !== team) : [...picked, team])}
              className={chip(on)}
            >
              {TEAM_LABELS[team]}
            </button>
          );
        })}
        <Button type="button" onClick={add} disabled={busy || !picked.length} className="ml-auto">
          {busy ? 'Adding…' : 'Add'}
        </Button>
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
