'use client';

// The parts of a pairing that happen around the lesson itself:
//   - MeetingLink: the video call link the mentor sets and both join from
//   - LessonNotes: the mentor's write-up after each lesson, with a practice
//     list the student ticks off during the week

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import type { LessonNote, Pairing } from '@/lib/types';
import { Alert, Button, Spinner, cx } from './ui';
import { TextArea, TextInput } from './ui/fields';

const MAX_PRACTICE = 10;

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function longDate(iso: string): string {
  return new Date(`${iso}T12:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function MeetingLink({ pairing, onSaved }: { pairing: Pairing; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(pairing.meetingUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isMentor = pairing.side === 'mentor';

  async function save(event: FormEvent) {
    event.preventDefault();
    const url = value.trim();
    if (url && !/^https:\/\/\S+$/.test(url)) return setError('The link needs to start with https://');
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/lessons/${pairing.id}/meeting`, { meetingUrl: url });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="flex flex-col gap-2 rounded-xl border border-line p-4">
        <label htmlFor={`meet-${pairing.id}`} className="text-sm font-medium text-ink">
          Video call link
        </label>
        <p className="text-xs text-ink-soft">
          A Google Meet, Zoom or Teams link. Use the same one every week so your student always knows where to go.
        </p>
        <TextInput
          id={`meet-${pairing.id}`}
          type="url"
          inputMode="url"
          placeholder="https://meet.google.com/…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Saving…' : 'Save link'}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
      <div>
        <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">Video call</p>
        <p className="text-sm text-ink-soft">
          {pairing.meetingUrl
            ? 'Join from here at lesson time.'
            : isMentor
              ? 'Add the link you and your student will join each week.'
              : 'Your mentor will add the link for your lessons.'}
        </p>
      </div>
      <div className="flex gap-2">
        {pairing.meetingUrl ? (
          <a
            href={pairing.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"
          >
            Join lesson
          </a>
        ) : null}
        {isMentor ? (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            {pairing.meetingUrl ? 'Change link' : 'Add link'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LessonNotes({ pairing }: { pairing: Pairing }) {
  const [notes, setNotes] = useState<LessonNote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [writing, setWriting] = useState<LessonNote | 'new' | null>(null);
  const [showAll, setShowAll] = useState(false);
  const isMentor = pairing.side === 'mentor';

  const load = useCallback(() => {
    api
      .get<{ data: LessonNote[] }>(`/lessons/${pairing.id}/notes`)
      .then((body) => setNotes(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load lesson notes.'));
  }, [pairing.id]);

  useEffect(load, [load]);

  async function tick(note: LessonNote, itemId: string, done: boolean) {
    // Show the tick straight away; put it back if the save fails.
    setNotes((current) =>
      current?.map((entry) =>
        entry.id === note.id
          ? { ...entry, practice: entry.practice.map((item) => (item.id === itemId ? { ...item, done } : item)) }
          : entry,
      ) ?? null,
    );
    try {
      await api.patch(`/lessons/${pairing.id}/notes/${note.id}`, { practice: [{ id: itemId, done }] });
    } catch {
      load();
    }
  }

  async function remove(note: LessonNote) {
    if (!window.confirm(`Remove your notes from ${longDate(note.date)}?`)) return;
    try {
      await api.delete(`/lessons/${pairing.id}/notes/${note.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work.');
    }
  }

  const shown = showAll ? notes ?? [] : (notes ?? []).slice(0, 3);

  return (
    <section className="mt-6 border-t border-line pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-navy">Lesson notes and practice</h3>
          <p className="text-sm text-ink-soft">
            {isMentor
              ? 'After each lesson, jot down what you covered and what to practise. Your student ticks things off.'
              : 'What you covered, and what to practise this week. Tick things off as you go.'}
          </p>
        </div>
        {isMentor && !writing ? (
          <Button size="sm" onClick={() => setWriting('new')}>
            Write up a lesson
          </Button>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {writing ? (
        <NoteForm
          pairingId={pairing.id}
          note={writing === 'new' ? null : writing}
          onCancel={() => setWriting(null)}
          onSaved={() => {
            setWriting(null);
            load();
          }}
        />
      ) : null}

      {!notes ? (
        <Spinner />
      ) : !notes.length ? (
        <p className="text-sm text-ink-soft">{isMentor ? 'No notes yet.' : 'Your mentor hasn’t written any notes yet.'}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {shown.map((note) => {
            const done = note.practice.filter((item) => item.done).length;
            return (
              <li key={note.id} className="rounded-xl bg-paper p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-navy">{longDate(note.date)}</p>
                  {note.practice.length ? (
                    <p className={cx('text-xs font-semibold', done === note.practice.length ? 'text-ok' : 'text-ink-faint')}>
                      {done} of {note.practice.length} practised
                    </p>
                  ) : null}
                </div>
                {note.summary ? <p className="mt-2 text-sm whitespace-pre-line text-ink">{note.summary}</p> : null}
                {note.practice.length ? (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {note.practice.map((item) => (
                      <li key={item.id}>
                        <label className={cx('flex items-start gap-2.5 text-sm', isMentor ? 'cursor-default' : 'cursor-pointer')}>
                          <input
                            type="checkbox"
                            checked={item.done}
                            disabled={isMentor}
                            onChange={(event) => tick(note, item.id, event.target.checked)}
                            className="mt-0.5 size-4 accent-navy"
                          />
                          <span className={cx(item.done && 'text-ink-faint line-through')}>{item.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {isMentor ? (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setWriting(note)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(note)}>
                      Remove
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
      {notes && notes.length > 3 ? (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-sm font-semibold text-navy underline underline-offset-4">
          {showAll ? 'Show fewer' : `Show all ${notes.length}`}
        </button>
      ) : null}
    </section>
  );
}

function NoteForm({
  pairingId,
  note,
  onCancel,
  onSaved,
}: {
  pairingId: string;
  note: LessonNote | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(note?.date ?? todayIso());
  const [summary, setSummary] = useState(note?.summary ?? '');
  const [items, setItems] = useState<{ text: string; done: boolean }[]>(
    note?.practice.length ? note.practice.map(({ text, done }) => ({ text, done })) : [{ text: '', done: false }],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const practice = items.filter((item) => item.text.trim()).map((item) => ({ ...item, text: item.text.trim() }));
    if (!summary.trim() && !practice.length) return setError('Write a note or add something to practise.');
    setBusy(true);
    setError(null);
    try {
      const body = { date, summary: summary.trim(), practice };
      if (note) await api.patch(`/lessons/${pairingId}/notes/${note.id}`, body);
      else await api.post(`/lessons/${pairingId}/notes`, body);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Lesson date
          <TextInput type="date" max={todayIso()} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          What you covered
          <TextArea
            rows={3}
            maxLength={2000}
            value={summary}
            placeholder="e.g. Worked on hand position and the first line of Für Elise. Great progress on rhythm!"
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">To practise this week</legend>
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <TextInput
                aria-label={`Practice item ${index + 1}`}
                maxLength={200}
                value={item.text}
                placeholder={['C major scale, hands separately, 5 times', 'Bars 1 to 8, slowly'][index] ?? ''}
                onChange={(event) => setItems(items.map((entry, i) => (i === index ? { ...entry, text: event.target.value } : entry)))}
              />
              <button
                type="button"
                aria-label={`Remove practice item ${index + 1}`}
                onClick={() => setItems(items.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg px-2 py-2 text-sm text-ink-faint hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
        {items.length < MAX_PRACTICE ? (
          <button
            type="button"
            onClick={() => setItems([...items, { text: '', done: false }])}
            className="mt-2 rounded-full border border-dashed border-navy/40 px-4 py-1.5 text-sm font-semibold text-navy"
          >
            + Add an item
          </button>
        ) : null}
      </fieldset>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : note ? 'Save changes' : 'Share with my student'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
