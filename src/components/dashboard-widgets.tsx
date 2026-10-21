'use client';

// The panels on the student and mentor dashboard home pages. Each loads its
// own data and links through to the full page it summarises.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatRange, upcomingDates, zoneLabel } from '@/lib/schedule';
import type { Conversation, LessonNote, MentorProfile, Pairing, ScheduleDay, SharedResource } from '@/lib/types';
import { Avatar } from './avatar';
import { Panel } from './dashboard-shell';
import { formatMinutes } from './hours-log';
import { Icon } from './marketing';
import { Spinner, cx } from './ui';

const plain = (name: string) => name.replace(/\s*\(test\)$/, '');

/** Lessons and messages are on every dashboard; load them once for all panels. */
export function useLessonsAndMessages() {
  const [pairings, setPairings] = useState<Pairing[] | null>(null);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  useEffect(() => {
    api.get<{ data: Pairing[] }>('/lessons').then((body) => setPairings(body.data)).catch(() => setPairings([]));
    api.get<{ data: Conversation[] }>('/messages').then((body) => setConversations(body.data)).catch(() => setConversations([]));
  }, []);

  return { pairings, conversations };
}

/** The date of the next weekly lesson, counting today. */
function nextLessonDate(pairing: Pairing): string | null {
  return pairing.lesson ? upcomingDates(pairing.lesson.day, 1)[0] ?? null : null;
}

export function NextLessons({ pairings }: { pairings: Pairing[] | null }) {
  if (!pairings) return <Panel title="Your lessons"><Spinner /></Panel>;
  if (!pairings.length) return null;

  return (
    <Panel title="Your lessons" action={<Link href="/dashboard/lessons" className="text-sm font-semibold text-coral">Manage</Link>}>
      <ul className="flex flex-col gap-3">
        {pairings.map((pairing) => {
          const other = plain((pairing.side === 'mentor' ? pairing.student : pairing.mentor).name);
          const date = nextLessonDate(pairing);
          const cancelled = date ? pairing.absences.find((absence) => absence.date === date) : undefined;
          const notices = pairing.absences.filter((absence) => absence.reporterSide !== pairing.side && !absence.acknowledgedAt);
          const toAnswer = pairing.proposal && pairing.proposal.proposedBy !== pairing.side;

          return (
            <li key={pairing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {other} · <span className="font-normal text-ink-soft">{pairing.instrument}</span>
                </p>
                {pairing.lesson && date ? (
                  <p className={cx('text-sm', cancelled ? 'text-coral' : 'text-ink-soft')}>
                    {cancelled ? 'Off this week: ' : 'Next: '}
                    {formatDate(date)}, {formatRange(pairing.lesson.start, pairing.lesson.durationMinutes)} ({zoneLabel(pairing.timeZone)})
                  </p>
                ) : (
                  <p className="text-sm text-ink-soft">No weekly time agreed yet.</p>
                )}
                {toAnswer ? <p className="mt-1 text-sm font-semibold text-warn">{other} proposed a new time.</p> : null}
                {notices
                  .filter((notice) => notice.date !== date)
                  .map((notice) => (
                    <p key={notice.id} className="mt-1 text-sm font-semibold text-coral">
                      {other} can’t make {formatDate(notice.date)}
                    </p>
                  ))}
              </div>
              <div className="flex gap-2">
                {pairing.meetingUrl && pairing.lesson && !cancelled ? (
                  <a
                    href={pairing.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"
                  >
                    Join lesson
                  </a>
                ) : null}
                <Link
                  href={`/dashboard/messages/${pairing.id}`}
                  className="rounded-lg border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
                >
                  Message
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {pairings.some((pairing) => pairing.side === 'mentor' && !pairing.meetingUrl) ? (
        <p className="mt-3 text-xs text-ink-faint">
          Add a video call link for each student on the <Link href="/dashboard/lessons" className="underline">Lessons</Link> page.
        </p>
      ) : null}
    </Panel>
  );
}

/** A student's latest practice list from each mentor, ready to tick off. */
export function PracticeThisWeek({ pairings }: { pairings: Pairing[] | null }) {
  const [latest, setLatest] = useState<{ pairing: Pairing; note: LessonNote }[] | null>(null);

  useEffect(() => {
    if (!pairings) return;
    Promise.all(
      pairings.map((pairing) =>
        api
          .get<{ data: LessonNote[] }>(`/lessons/${pairing.id}/notes`)
          .then((body) => (body.data[0] ? { pairing, note: body.data[0] } : null))
          .catch(() => null),
      ),
    ).then((rows) => setLatest(rows.filter((row): row is { pairing: Pairing; note: LessonNote } => Boolean(row))));
  }, [pairings]);

  if (!pairings?.length || !latest?.length) return null;

  async function tick(pairingId: string, note: LessonNote, itemId: string, done: boolean) {
    setLatest((rows) =>
      rows?.map((row) =>
        row.note.id === note.id
          ? { ...row, note: { ...row.note, practice: row.note.practice.map((item) => (item.id === itemId ? { ...item, done } : item)) } }
          : row,
      ) ?? null,
    );
    await api.patch(`/lessons/${pairingId}/notes/${note.id}`, { practice: [{ id: itemId, done }] }).catch(() => undefined);
  }

  return (
    <Panel title="This week’s practice" action={<Link href="/dashboard/lessons" className="text-sm font-semibold text-coral">All notes</Link>}>
      <div className="flex flex-col gap-5">
        {latest.map(({ pairing, note }) => (
          <div key={note.id}>
            <p className="text-xs font-semibold tracking-wider text-ink-faint uppercase">
              From {plain(pairing.mentor.name).split(' ')[0]}, {formatDate(note.date)}
            </p>
            {note.summary ? <p className="mt-1 text-sm text-ink-soft">{note.summary}</p> : null}
            {note.practice.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {note.practice.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-paper px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(event) => tick(pairing.id, note, item.id, event.target.checked)}
                        className="mt-0.5 size-4 accent-navy"
                      />
                      <span className={cx(item.done && 'text-ink-faint line-through')}>{item.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function MessagesPanel({ conversations }: { conversations: Conversation[] | null }) {
  if (!conversations) return <Panel title="Messages"><Spinner /></Panel>;
  if (!conversations.length) return null;
  const unread = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          Messages
          {unread ? <span className="rounded-full bg-gold px-2 py-0.5 font-sans text-xs font-bold text-navy">{unread} new</span> : null}
        </span>
      }
      action={<Link href="/dashboard/messages" className="text-sm font-semibold text-coral">Open</Link>}
    >
      <ul className="flex flex-col gap-2">
        {conversations.slice(0, 4).map((conversation) => (
          <li key={conversation.pairingId}>
            <Link href={`/dashboard/messages/${conversation.pairingId}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper">
              <Avatar name={conversation.with} photoPath={conversation.withPhotoPath} className="size-9 text-xs" />
              <span className="min-w-0 flex-1">
                <span className={cx('block truncate text-sm', conversation.unread ? 'font-bold text-navy' : 'font-medium text-ink')}>
                  {plain(conversation.with)}
                </span>
                <span className="block truncate text-xs text-ink-soft">
                  {conversation.lastMessage
                    ? `${conversation.lastMessage.mine ? 'You: ' : ''}${conversation.lastMessage.body}`
                    : 'No messages yet. Say hello!'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ResourcesPanel({ scope, title }: { scope: 'shared' | 'team'; title: string }) {
  const [items, setItems] = useState<SharedResource[] | null>(null);

  useEffect(() => {
    api
      .get<{ data: SharedResource[] }>(scope === 'team' ? '/resources?scope=team' : '/resources')
      .then((body) => setItems(body.data.filter((item) => (scope === 'team' ? item.scope === 'team' : item.scope === 'pairing' && !item.mine))))
      .catch(() => setItems([]));
  }, [scope]);

  if (!items?.length) return null;

  return (
    <Panel title={title} action={<Link href="/dashboard/resources" className="text-sm font-semibold text-coral">All</Link>}>
      <ul className="flex flex-col gap-2">
        {items.slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <Icon name={item.kind === 'link' ? 'arrow' : item.file?.contentType.startsWith('audio/') ? 'music' : 'file'} className="size-4 shrink-0 text-coral" />
            <span className="min-w-0 flex-1 truncate text-ink">{item.title}</span>
            <span className="shrink-0 text-xs text-ink-faint">{new Date(item.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function HoursPanel() {
  const [totals, setTotals] = useState<{ approvedMinutes: number; pendingMinutes: number } | null>(null);

  useEffect(() => {
    api
      .get<{ meta: { approvedMinutes: number; pendingMinutes: number } }>('/hours/mine')
      .then((body) => setTotals(body.meta))
      .catch(() => setTotals(null));
  }, []);

  return (
    <Panel title="Volunteer hours" action={<Link href="/dashboard/hours" className="text-sm font-semibold text-coral">Log time</Link>}>
      {!totals ? (
        <Spinner />
      ) : (
        <>
          <p className="font-display text-3xl font-bold text-navy">{formatMinutes(totals.approvedMinutes)}</p>
          <p className="text-sm text-ink-soft">
            approved{totals.pendingMinutes ? `, plus ${formatMinutes(totals.pendingMinutes)} waiting` : ''}
          </p>
        </>
      )}
    </Panel>
  );
}

/** How finished a mentor's page is, with the next thing to add. */
export function PageChecklist({ profile }: { profile: MentorProfile & { schedule?: ScheduleDay[] } }) {
  const items = [
    { done: Boolean(profile.photoPath || profile.pendingPhoto), label: profile.pendingPhoto && !profile.photoPath ? 'Photo (waiting for approval)' : 'A photo' },
    { done: Boolean(profile.experienceHeadline), label: 'A one-line headline' },
    { done: Boolean(profile.about || profile.shortBio), label: 'About you' },
    { done: Boolean(profile.teachingPhilosophy), label: 'How you teach' },
    { done: Boolean(profile.whatToExpect?.length), label: 'Your first lesson' },
    { done: Boolean(profile.schedule?.some((day) => day.slots.length)), label: 'Your free times', href: '/dashboard/availability' },
  ];
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);

  return (
    <Panel title="Your page" action={<Link href="/dashboard/profile" className="text-sm font-semibold text-coral">Edit</Link>}>
      <div className="flex items-center gap-3">
        <Avatar name={profile.name} photoPath={profile.photoPath} className="size-14 text-lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{plain(profile.name)}</p>
          <p className="text-xs text-ink-faint">
            {profile.published || profile.isTest ? 'Live on Find a Mentor' : 'Hidden until staff publish it'}
            {' · '}
            {profile.acceptingStudents ? 'Taking students' : 'Not taking students'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold text-ink-soft">
          <span>{percent === 100 ? 'Your page is complete' : 'Finish your page'}</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Page complete">
          <div className="h-full rounded-full bg-sage" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        {items.map((item) => (
          <li key={item.label} className={cx('flex items-center gap-2', item.done ? 'text-ink-faint' : 'text-ink')}>
            <span className={cx('flex size-4 items-center justify-center rounded-full text-[10px]', item.done ? 'bg-sage text-white' : 'border border-line-strong')}>
              {item.done ? '✓' : ''}
            </span>
            {item.done ? item.label : <Link href={item.href ?? '/dashboard/profile'} className="underline-offset-2 hover:underline">{item.label}</Link>}
          </li>
        ))}
      </ul>

      <Link href={`/find-a-mentor/${profile.slug}`} className="mt-4 inline-block text-sm font-semibold text-navy underline underline-offset-4">
        View my page
      </Link>
    </Panel>
  );
}

export function HelpPanel() {
  return (
    <section className="rounded-2xl bg-navy p-6 text-cream">
      <h2 className="font-display text-lg font-bold text-cream">Need help?</h2>
      <p className="mt-1 text-sm text-cream/75">Questions about lessons, or something not right?</p>
      <div className="mt-4 flex gap-3 text-sm font-semibold">
        <Link href="/faq" className="rounded-full bg-gold px-4 py-2 text-navy">FAQ</Link>
        <Link href="/contact" className="rounded-full border border-cream/40 px-4 py-2">Contact</Link>
      </div>
    </section>
  );
}

