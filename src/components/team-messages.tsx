'use client';

// Team messages: conversations between the mentors and the staff teams
// (Admin, Tech, Outreach, Marketing).
//
// A conversation has a subject and goes to the teams you pick. Staff write
// for their team or as themselves; mentors write as themselves, so a question
// to Tech isn't seen by every mentor. Anyone in a conversation can bring in
// another team. The list sits beside the open conversation on wide screens;
// on phones you see one or the other. Used in the staff area and on the
// mentor dashboard, which pass their own `base` path.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ApiError, api } from '@/lib/api';
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
import { useAuth } from './auth-provider';
import { ConductGate } from './conduct-acceptance';
import { dayLabel, shortTime } from './messages';
import { ReportConcernButton } from './report-concern';
import { Alert, Button, Spinner, cx } from './ui';
import { Field, TextInput } from './ui/fields';

const MAX_LENGTH = 4000;
const SUBJECT_MAX_LENGTH = 120;
const POLL_MS = 8000;
export const TEAM_MESSAGES_CHANGED = 'nbn:team-messages-changed';

const chip = (on: boolean) =>
  cx('rounded-full border px-3 py-1 text-sm', on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft');

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
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className={cx('flex flex-col gap-3', focused && 'hidden lg:flex')}>
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
  );
}

function ThreadLink({ thread, href, active, onOpen }: { thread: TeamThreadSummary; href: string; active: boolean; onOpen: () => void }) {
  const last = thread.lastMessage;
  const preview = !last
    ? ''
    : last.kind === 'teams-added'
      ? `${last.mine ? 'You' : last.senderName} added ${last.body}`
      : `${last.mine ? 'You' : last.senderName.split(' ')[0]}: ${last.body}`;
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
      const created = await api.post<{ data: { id: string } }>('/team-messages', { subject: subject.trim(), to, from, body: body.trim() });
      onCreated(created.data.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t send. Please try again.');
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
            className="w-full resize-y rounded-lg border border-line-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none"
          />
        )}
      </Field>

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
  const { user } = useAuth();
  const needsConduct = Boolean(user && !user.agreements?.conduct);
  const endRef = useRef<HTMLDivElement>(null);
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
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.post(`/team-messages/${id}`, { body: text });
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

  const addable = ALL_TEAMS.filter((team) => !thread.teams.includes(team) && (team !== 'mentors' || meta.canWriteToMentors));
  let lastDay = '';

  return (
    <section className="flex h-[min(78vh,760px)] flex-col overflow-hidden rounded-2xl bg-white shadow-sm" aria-label={thread.subject}>
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
        <ol className="flex flex-col gap-3">
          {messages.map((message, index) => {
            const day = dayLabel(message.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const previous = messages[index - 1];
            // Name and team once per run of messages from the same person.
            const showName = !message.mine && (showDay || previous?.kind !== 'message' || previous.senderName !== message.senderName);
            return (
              <li key={message.id} className="flex flex-col">
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
                    <p
                      className={cx(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                        message.mine ? 'rounded-br-md bg-navy text-cream' : 'rounded-bl-md bg-paper text-navy',
                      )}
                    >
                      {message.body}
                    </p>
                    <span className="text-[11px] text-ink-faint">
                      {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
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
          <div className="flex items-end gap-2">
            <label htmlFor={`team-compose-${id}`} className="sr-only">
              Reply to {thread.subject}
            </label>
            <textarea
              id={`team-compose-${id}`}
              rows={2}
              maxLength={MAX_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={thread.writingFor ? `Reply for ${TEAM_LABELS[thread.writingFor]}…` : 'Reply…'}
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
    </section>
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
