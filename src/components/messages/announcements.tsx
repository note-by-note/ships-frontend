'use client';

// Announcements and important dates from the Note by Note team.
//
// Everyone sees the ones meant for them: on their dashboard (the latest few
// and what's coming up) and on the Announcements page, which also clears the
// "new" badge. Staff with `announcements.manage` post them and pick who each
// one is for: students, mentors, and any of the volunteer teams.
//
// Days are "YYYY-MM-DD" and mean that day wherever the reader is, so they're
// compared with the reader's own today here.

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, api } from '@/lib/api';
import {
  AUDIENCE_LABELS,
  type Announcement,
  type AnnouncementFeed,
  type AnnouncementFeedMeta,
  type Audience,
} from '@/lib/types';
import { useAuth } from '../account/auth-provider';
import { PageTabs, Panel } from '../layout/dashboard-shell';
import { Alert, Button, EmptyState, Spinner, cx } from '../ui';
import { Field, TextArea, TextInput } from '../ui/fields';

export const ANNOUNCEMENTS_CHANGED = 'nbn:announcements-changed';

const STAFF_TEAMS: Audience[] = ['admin', 'tech', 'outreach', 'marketing'];
const ALL_AUDIENCES: Audience[] = ['students', 'mentors', ...STAFF_TEAMS];

// --- Days -------------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0');

/** Today where the reader is, as "YYYY-MM-DD". */
function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Noon on that day, so no time zone can move it to the day before. */
const asDate = (day: string) => new Date(`${day}T12:00:00`);

function formatDay(day: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return asDate(day).toLocaleDateString(undefined, options);
}

/** "Sat, Nov 14", or "Mon, Dec 21 to Sat, Jan 2" for a range. */
function dayRange(item: Announcement): string {
  if (!item.date) return '';
  return item.endDate ? `${formatDay(item.date)} to ${formatDay(item.endDate)}` : formatDay(item.date);
}

/** Who it's for, in words that follow "for": "everyone", "Students, all volunteers", "Mentors, Tech". */
export function audienceLabel(audience: Audience[]): string {
  if (ALL_AUDIENCES.every((entry) => audience.includes(entry))) return 'everyone';
  const allVolunteers = STAFF_TEAMS.every((team) => audience.includes(team));
  const parts = [
    ...(['students', 'mentors'] as Audience[]).filter((entry) => audience.includes(entry)).map((entry) => AUDIENCE_LABELS[entry]),
    ...(allVolunteers ? ['all volunteers'] : STAFF_TEAMS.filter((team) => audience.includes(team)).map((team) => AUDIENCE_LABELS[team])),
  ];
  return parts.join(', ');
}

/** Only what's still current where the reader is. */
function stillCurrent(feed: AnnouncementFeed): AnnouncementFeed {
  const now = today();
  return {
    announcements: feed.announcements.filter((item) => !item.showUntil || item.showUntil >= now),
    dates: feed.dates.filter((item) => (item.endDate ?? item.date ?? '') >= now),
  };
}

// --- Loading ------------------------------------------------------------------------------

export function useAnnouncements() {
  const [feed, setFeed] = useState<AnnouncementFeed | null>(null);
  const [meta, setMeta] = useState<AnnouncementFeedMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api
      .get<{ data: AnnouncementFeed; meta: AnnouncementFeedMeta }>('/announcements')
      .then((body) => {
        setFeed(stillCurrent(body.data));
        setMeta(body.meta);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load announcements.'));
  }, []);

  useEffect(reload, [reload]);
  return { feed, meta, error, reload };
}

/**
 * New announcements for a sidebar badge. Checked on every page change and
 * every few minutes while the tab is open.
 */
export function useAnnouncementsUnseen(enabled: boolean, pathname: string): number {
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const check = () =>
      api
        .get<{ meta: AnnouncementFeedMeta }>('/announcements')
        .then((body) => !cancelled && setUnseen(body.meta.unseen))
        .catch(() => undefined);
    void check();
    const timer = setInterval(check, 5 * 60_000);
    window.addEventListener(ANNOUNCEMENTS_CHANGED, check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener(ANNOUNCEMENTS_CHANGED, check);
    };
  }, [enabled, pathname]);

  return enabled ? unseen : 0;
}

// --- Showing them -------------------------------------------------------------------------

/** Text with any web addresses in it made into links. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return part;
        // A full stop or bracket at the end of a sentence isn't part of the address.
        const url = part.replace(/[.,;:!?)\]]+$/, '');
        return (
          <span key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-navy underline underline-offset-2 break-all">
              {url}
            </a>
            {part.slice(url.length)}
          </span>
        );
      })}
    </>
  );
}

function LinkButton({ link }: { link: NonNullable<Announcement['link']> }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-cream hover:bg-navy/90"
    >
      {link.label || 'Open link'}
      <span aria-hidden>↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Tag({ tone, children }: { tone: 'gold' | 'navy'; children: ReactNode }) {
  return (
    <span className={cx('rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase', tone === 'gold' ? 'bg-gold text-navy' : 'bg-navy/10 text-navy')}>
      {children}
    </span>
  );
}

function AnnouncementItem({ item, isNew, compact = false }: { item: Announcement; isNew: boolean; compact?: boolean }) {
  return (
    <article className={cx('flex flex-col gap-2', !compact && 'rounded-2xl bg-white p-5 shadow-sm')}>
      <div className="flex flex-wrap items-center gap-2">
        {item.pinned ? <Tag tone="navy">Pinned</Tag> : null}
        {isNew ? <Tag tone="gold">New</Tag> : null}
        <span className="text-xs text-ink-faint">{formatDay(item.createdAt.slice(0, 10), { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <h3 className="font-display text-lg font-bold text-navy">{item.title}</h3>
      <p className={cx('text-sm leading-relaxed whitespace-pre-line text-ink-soft', compact && 'line-clamp-3')}>
        <Linkified text={item.body} />
      </p>
      {item.link ? (
        <div>
          <LinkButton link={item.link} />
        </div>
      ) : null}
    </article>
  );
}

/** A day as a small calendar leaf beside the event. */
function DayLeaf({ day }: { day: string }) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-line bg-paper py-1.5 text-navy" aria-hidden>
      <span className="text-[11px] font-bold tracking-wide uppercase">{formatDay(day, { month: 'short' })}</span>
      <span className="font-display text-2xl leading-none font-bold">{asDate(day).getDate()}</span>
    </div>
  );
}

function DateItem({ item, compact = false }: { item: Announcement; compact?: boolean }) {
  return (
    <article className="flex gap-4">
      <DayLeaf day={item.date!} />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-navy">{item.title}</h3>
        <p className="text-sm text-ink-soft">
          {dayRange(item)}
          {item.time ? ` · ${item.time}` : ''}
        </p>
        {item.body ? (
          <p className={cx('mt-1 text-sm leading-relaxed whitespace-pre-line text-ink-soft', compact && 'line-clamp-2')}>
            <Linkified text={item.body} />
          </p>
        ) : null}
        {item.link ? (
          <div className="mt-2">
            <LinkButton link={item.link} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

const isNewTo = (meta: AnnouncementFeedMeta | null) => (item: Announcement) => !meta?.seenAt || item.createdAt > meta.seenAt;

type Loaded = ReturnType<typeof useAnnouncements>;

/** The latest announcements, for a dashboard. Hidden when there are none. */
export function AnnouncementsPanel({ loaded, href }: { loaded: Loaded; href: string }) {
  const { feed, meta } = loaded;
  if (!feed?.announcements.length) return null;
  const isNew = isNewTo(meta);
  return (
    <Panel title="Announcements" action={<Link href={href} className="text-sm font-semibold text-coral">See all</Link>}>
      <ul className="flex flex-col divide-y divide-line">
        {feed.announcements.slice(0, 3).map((item) => (
          <li key={item.id} className="py-4 first:pt-0 last:pb-0">
            <AnnouncementItem item={item} isNew={isNew(item)} compact />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** What's coming up, for a dashboard. Hidden when there's nothing. */
export function ImportantDatesPanel({ loaded, href }: { loaded: Loaded; href: string }) {
  const { feed } = loaded;
  if (!feed?.dates.length) return null;
  return (
    <Panel title="Important dates" action={<Link href={`${href}#dates`} className="text-sm font-semibold text-coral">See all</Link>}>
      <ul className="flex flex-col gap-4">
        {feed.dates.slice(0, 4).map((item) => (
          <li key={item.id}>
            <DateItem item={item} compact />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** The full announcements page. Opening it marks everything as seen. */
export function AnnouncementsPage() {
  const { feed, meta, error } = useAnnouncements();
  const loadedOnce = Boolean(meta);

  // Marked seen only after loading, so what was new stays marked "New" while they read.
  useEffect(() => {
    if (!loadedOnce) return;
    api
      .post('/announcements/seen')
      .then(() => window.dispatchEvent(new Event(ANNOUNCEMENTS_CHANGED)))
      .catch(() => undefined);
  }, [loadedOnce]);

  if (error) return <Alert>{error}</Alert>;
  if (!feed || !meta) return <Spinner label="Loading announcements" />;
  const isNew = isNewTo(meta);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-labelledby="announcements-title" className="flex flex-col gap-4">
        <h2 id="announcements-title" className="font-display text-2xl font-bold text-navy">
          Announcements
        </h2>
        {feed.announcements.length ? (
          feed.announcements.map((item) => <AnnouncementItem key={item.id} item={item} isNew={isNew(item)} />)
        ) : (
          <p className="rounded-2xl bg-white/60 p-5 text-sm text-ink-soft">No announcements right now.</p>
        )}
      </section>

      <section id="dates" aria-labelledby="dates-title" className="scroll-mt-24">
        <h2 id="dates-title" className="mb-4 font-display text-2xl font-bold text-navy">
          Important dates
        </h2>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          {feed.dates.length ? (
            <ul className="flex flex-col gap-5">
              {feed.dates.map((item) => (
                <li key={item.id}>
                  <DateItem item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Nothing coming up.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function AnnouncementTabs() {
  const { can } = useAuth();
  return (
    <PageTabs
      tabs={[
        { href: '/admin/announcements', label: 'For you' },
        ...(can('announcements.manage') ? [{ href: '/admin/announcements/manage', label: 'Post and manage' }] : []),
      ]}
    />
  );
}

// --- Posting and managing -----------------------------------------------------------------

const chip = (on: boolean) =>
  cx('rounded-full border px-3 py-1 text-sm', on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft');

function AudiencePicker({
  value,
  onChange,
}: {
  value: Audience[];
  /** Given a change to make to the current list, so quick clicks in a row all count. */
  onChange: (change: (current: Audience[]) => Audience[]) => void;
}) {
  const toggle = (entry: Audience) =>
    onChange((current) => (current.includes(entry) ? current.filter((item) => item !== entry) : [...current, entry]));
  const everyone = ALL_AUDIENCES.every((entry) => value.includes(entry));
  const allVolunteers = STAFF_TEAMS.every((team) => value.includes(team));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        Who sees it <span className="text-danger" aria-hidden>*</span>
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={everyone} onClick={() => onChange(() => (everyone ? [] : ALL_AUDIENCES))} className={chip(everyone)}>
          Everyone
        </button>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        {(['students', 'mentors'] as Audience[]).map((entry) => (
          <button key={entry} type="button" aria-pressed={value.includes(entry)} onClick={() => toggle(entry)} className={chip(value.includes(entry))}>
            {AUDIENCE_LABELS[entry]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-ink-faint uppercase">Volunteers</span>
        <button
          type="button"
          aria-pressed={allVolunteers}
          onClick={() =>
            onChange((current) =>
              allVolunteers ? current.filter((entry) => !STAFF_TEAMS.includes(entry)) : [...new Set([...current, ...STAFF_TEAMS])],
            )
          }
          className={chip(allVolunteers)}
        >
          All volunteers
        </button>
        {STAFF_TEAMS.map((team) => (
          <button key={team} type="button" aria-pressed={value.includes(team)} onClick={() => toggle(team)} className={chip(value.includes(team))}>
            {AUDIENCE_LABELS[team]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

interface Draft {
  kind: Announcement['kind'];
  title: string;
  body: string;
  audience: Audience[];
  linkUrl: string;
  linkLabel: string;
  pinned: boolean;
  showUntil: string;
  date: string;
  endDate: string;
  time: string;
}

function draftFrom(item?: Announcement, kind: Announcement['kind'] = 'announcement'): Draft {
  return {
    kind: item?.kind ?? kind,
    title: item?.title ?? '',
    body: item?.body ?? '',
    audience: item?.audience ?? [],
    linkUrl: item?.link?.url ?? '',
    linkLabel: item?.link?.label ?? '',
    pinned: item?.pinned ?? false,
    showUntil: item?.showUntil ?? '',
    date: item?.date ?? '',
    endDate: item?.endDate ?? '',
    time: item?.time ?? '',
  };
}

function Editor({ item, onSaved, onCancel }: { item?: Announcement; onSaved: () => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(item));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const isDate = draft.kind === 'date';

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return setError('Add a title.');
    if (!isDate && !draft.body.trim()) return setError('Write the message.');
    if (isDate && !draft.date) return setError('Choose the date.');
    if (!draft.audience.length) return setError('Choose who sees it.');
    setBusy(true);
    setError(null);
    const body = {
      kind: draft.kind,
      title: draft.title.trim(),
      body: draft.body.trim(),
      audience: draft.audience,
      link: draft.linkUrl.trim() ? { url: draft.linkUrl.trim(), label: draft.linkLabel.trim() } : null,
      pinned: draft.pinned,
      showUntil: draft.showUntil || null,
      date: draft.date || null,
      endDate: draft.endDate || null,
      time: draft.time.trim(),
    };
    try {
      if (item) await api.patch(`/announcements/${item.id}`, body);
      else await api.post('/announcements', body);
      window.dispatchEvent(new Event(ANNOUNCEMENTS_CHANGED));
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-navy">
          {item ? `Edit ${isDate ? 'date' : 'announcement'}` : isDate ? 'Add an important date' : 'Post an announcement'}
        </h2>
        {!item ? (
          <div className="flex gap-2" role="group" aria-label="What are you adding?">
            <button type="button" aria-pressed={!isDate} onClick={() => set('kind', 'announcement')} className={chip(!isDate)}>
              Announcement
            </button>
            <button type="button" aria-pressed={isDate} onClick={() => set('kind', 'date')} className={chip(isDate)}>
              Important date
            </button>
          </div>
        ) : null}
      </div>

      <AudiencePicker value={draft.audience} onChange={(change) => setDraft((current) => ({ ...current, audience: change(current.audience) }))} />

      <Field label="Title" required>
        {({ id }) => (
          <TextInput
            id={id}
            value={draft.title}
            maxLength={120}
            onChange={(event) => set('title', event.target.value)}
            placeholder={isDate ? 'e.g. Winter recital' : 'e.g. New practice guides are up'}
          />
        )}
      </Field>

      {isDate ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" required>
            {({ id }) => <TextInput id={id} type="date" value={draft.date} onChange={(event) => set('date', event.target.value)} />}
          </Field>
          <Field label="Ends" help="For something over several days.">
            {({ id, describedBy }) => (
              <TextInput id={id} aria-describedby={describedBy} type="date" min={draft.date || undefined} value={draft.endDate} onChange={(event) => set('endDate', event.target.value)} />
            )}
          </Field>
          <Field label="Time" help="Say the time zone.">
            {({ id, describedBy }) => (
              <TextInput id={id} aria-describedby={describedBy} value={draft.time} maxLength={60} onChange={(event) => set('time', event.target.value)} placeholder="7 to 8 pm ET" />
            )}
          </Field>
        </div>
      ) : null}

      <Field label={isDate ? 'Details' : 'Message'} required={!isDate} help="Web addresses become links.">
        {({ id, describedBy }) => (
          <TextArea id={id} aria-describedby={describedBy} rows={isDate ? 3 : 6} maxLength={4000} value={draft.body} onChange={(event) => set('body', event.target.value)} />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Field label="Link" help="Shown as a button, e.g. a sign-up form.">
          {({ id, describedBy }) => (
            <TextInput id={id} aria-describedby={describedBy} type="url" value={draft.linkUrl} maxLength={500} onChange={(event) => set('linkUrl', event.target.value)} placeholder="https://" />
          )}
        </Field>
        <Field label="Button text">
          {({ id }) => (
            <TextInput id={id} value={draft.linkLabel} maxLength={60} onChange={(event) => set('linkLabel', event.target.value)} placeholder="Open link" disabled={!draft.linkUrl.trim()} />
          )}
        </Field>
      </div>

      {!isDate ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm">
            <input type="checkbox" checked={draft.pinned} onChange={(event) => set('pinned', event.target.checked)} className="mt-0.5 size-4" />
            <span>
              <span className="block font-medium text-ink">Pin to the top</span>
              <span className="text-ink-soft">Stays above newer announcements.</span>
            </span>
          </label>
          <Field label="Show until" help="Leave empty to keep it up.">
            {({ id, describedBy }) => (
              <TextInput id={id} aria-describedby={describedBy} type="date" value={draft.showUntil} onChange={(event) => set('showUntil', event.target.value)} />
            )}
          </Field>
        </div>
      ) : null}

      {draft.audience.length ? (
        <p className="text-sm text-ink-soft">
          Shown to <span className="font-medium text-ink">{audienceLabel(draft.audience)}</span> on their dashboard and Announcements page.
        </p>
      ) : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : item ? 'Save changes' : isDate ? 'Add date' : 'Post'}
        </Button>
      </div>
    </form>
  );
}

/** Whether it's showing to people now, in words. */
function statusOf(item: Announcement): { label: string; live: boolean } {
  const now = today();
  if (item.kind === 'date') {
    const last = item.endDate ?? item.date ?? '';
    return last < now ? { label: 'Past', live: false } : { label: 'Upcoming', live: true };
  }
  if (item.showUntil && item.showUntil < now) return { label: `Ended ${formatDay(item.showUntil)}`, live: false };
  return { label: item.showUntil ? `Showing until ${formatDay(item.showUntil)}` : 'Showing', live: true };
}

export function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Announcement | 'new' | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: Announcement[] }>('/announcements/manage')
      .then((body) => setItems(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load announcements.'));
  }, []);
  useEffect(load, [load]);

  async function remove(item: Announcement) {
    try {
      await api.delete(`/announcements/${item.id}`);
      setConfirming(null);
      window.dispatchEvent(new Event(ANNOUNCEMENTS_CHANGED));
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t delete. Please try again.');
    }
  }

  if (error) return <Alert>{error}</Alert>;
  if (!items) return <Spinner label="Loading announcements" />;

  if (editing) {
    return (
      <Editor
        item={editing === 'new' ? undefined : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  const groups = [
    { title: 'Announcements', items: items.filter((item) => item.kind === 'announcement') },
    // Upcoming dates soonest first, then past ones.
    {
      title: 'Important dates',
      items: items
        .filter((item) => item.kind === 'date')
        .sort((a, b) => Number(statusOf(b).live) - Number(statusOf(a).live) || (a.date ?? '').localeCompare(b.date ?? '')),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button type="button" onClick={() => setEditing('new')}>
          Post an announcement or date
        </Button>
      </div>
      {!items.length ? (
        <EmptyState title="Nothing posted yet" description="Announcements and important dates you post show on people’s dashboards." />
      ) : (
        groups.map((group) =>
          group.items.length ? (
            <Panel key={group.title} title={group.title}>
              <ul className="divide-y divide-line">
                {group.items.map((item) => {
                  const status = statusOf(item);
                  return (
                    <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div className={cx('min-w-0 flex-1', !status.live && 'opacity-60')}>
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                          {item.title}
                          {item.pinned ? <Tag tone="navy">Pinned</Tag> : null}
                        </p>
                        <p className="text-sm text-ink-soft">
                          {item.kind === 'date' ? `${dayRange(item)}${item.time ? ` · ${item.time}` : ''} · ` : ''}
                          For {audienceLabel(item.audience)}
                        </p>
                        <p className="text-xs text-ink-faint">
                          {status.label} · Posted by {item.authorName} on {formatDay(item.createdAt.slice(0, 10), { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {confirming === item.id ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-ink-soft">Delete it for everyone?</span>
                          <Button size="sm" variant="danger" onClick={() => remove(item)}>
                            Delete
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setConfirming(null)}>
                            Keep
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditing(item)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setConfirming(item.id)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ) : null,
        )
      )}
    </div>
  );
}
