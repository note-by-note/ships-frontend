'use client';

// Lessons, for both sides of each pairing (an accepted match request):
//   - the agreed weekly lesson time, if there is one
//   - a proposal waiting for an answer — accept/decline it, or withdraw yours
//   - "propose a time": only starts that fit the mentor's availability and
//     don't clash with their other lessons are offered
//   - "I can't make it": a notice for one specific upcoming lesson, which the
//     other side sees and can mark as seen

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Icon } from '@/components/marketing';
import { Alert, Badge, Button, EmptyState, Spinner } from '@/components/ui';
import { Field, Select, TextArea } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import {
  DAY_NAMES,
  WEEKDAYS,
  formatDate,
  formatRange,
  upcomingDates,
  validStarts,
  formatTime,
  zoneLabel,
} from '@/lib/schedule';
import type { LessonRules, Pairing, Weekday } from '@/lib/types';

export default function LessonsPage() {
  const [pairings, setPairings] = useState<Pairing[] | null>(null);
  const [rules, setRules] = useState<LessonRules | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([api.get<{ data: Pairing[] }>('/lessons'), api.get<{ data: LessonRules }>('/lessons/rules')])
      .then(([pairingBody, rulesBody]) => {
        setPairings(pairingBody.data);
        setRules(rulesBody.data);
      })
      .catch(() => setError('We could not load your lessons.'));
  }, []);

  useEffect(load, [load]);

  return (
    <>
      <DashboardHeading
        title="Lessons"
        description="Agree a weekly lesson time, and let each other know if you can’t make one."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!pairings && !error ? <Spinner /> : null}
      {pairings && rules ? (
        pairings.length ? (
          <div className="flex flex-col gap-8">
            {pairings.map((pairing) => (
              <PairingCard key={pairing.id} pairing={pairing} rules={rules} onChange={load} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lessons yet"
            description="Once a mentor and student are matched, you’ll arrange your weekly lesson time here."
          />
        )
      ) : null}
    </>
  );
}

function PairingCard({ pairing, rules, onChange }: { pairing: Pairing; rules: LessonRules; onChange: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const other = pairing.side === 'mentor' ? pairing.student : pairing.mentor;
  const otherLabel = pairing.side === 'mentor' ? 'your student' : 'your mentor';
  const zone = zoneLabel(pairing.timeZone);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work.');
    } finally {
      setBusy(false);
    }
  }

  const proposal = pairing.proposal;
  const theirProposal = proposal && proposal.proposedBy !== pairing.side;

  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-2">
          {other.name.replace(/\s*\(test\)$/, '')}
          <Badge>{pairing.instrument}</Badge>
        </span>
      }
      action={
        pairing.studentContact?.email ? (
          <a href={`mailto:${pairing.studentContact.email}`} className="text-sm font-semibold text-coral">
            {pairing.studentContact.email}
          </a>
        ) : null
      }
    >
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-sky/30 p-5">
            <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">Weekly lesson</p>
            {pairing.lesson ? (
              <>
                <p className="mt-1 font-display text-2xl font-bold text-navy">
                  {DAY_NAMES[pairing.lesson.day]}s
                </p>
                <p className="text-navy/80">
                  {formatRange(pairing.lesson.start, pairing.lesson.durationMinutes)} · {pairing.lesson.durationMinutes} min ·{' '}
                  {zone}
                </p>
              </>
            ) : (
              <p className="mt-1 text-navy/75">Not agreed yet. Propose a time below, or answer {otherLabel}’s proposal.</p>
            )}
          </div>

          {proposal ? (
            <div className="rounded-xl border border-gold bg-gold/15 p-5">
              <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">
                {theirProposal ? `${other.name.split(' ')[0]} proposed` : 'You proposed'}
              </p>
              <p className="mt-1 font-semibold text-navy">
                {DAY_NAMES[proposal.day]}s, {formatRange(proposal.start, proposal.durationMinutes)} ({proposal.durationMinutes} min)
              </p>
              {proposal.note ? <p className="mt-2 text-sm text-ink-soft">“{proposal.note}”</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {theirProposal ? (
                  <>
                    <Button size="sm" disabled={busy} onClick={() => run(() => api.post(`/lessons/${pairing.id}/proposals/${proposal.id}/respond`, { accept: true }))}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => api.post(`/lessons/${pairing.id}/proposals/${proposal.id}/respond`, { accept: false }))}>
                      Decline
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="self-center text-sm text-ink-soft">Waiting for {otherLabel} to answer.</span>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => api.post(`/lessons/${pairing.id}/proposals/${proposal.id}/withdraw`))}>
                      Withdraw
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : null}

          <ProposeForm pairing={pairing} rules={rules} busy={busy} onSubmit={(values) => run(() => api.post(`/lessons/${pairing.id}/proposals`, values))} />
        </div>

        <Absences pairing={pairing} busy={busy} otherLabel={otherLabel} run={run} />
      </div>
    </Panel>
  );
}

function ProposeForm({
  pairing,
  rules,
  busy,
  onSubmit,
}: {
  pairing: Pairing;
  rules: LessonRules;
  busy: boolean;
  onSubmit: (values: { day: Weekday; start: string; durationMinutes: number; note: string }) => void;
}) {
  const [open, setOpen] = useState(!pairing.lesson && !pairing.proposal);
  const [duration, setDuration] = useState(rules.durations.includes(60) ? 60 : rules.durations[0]);
  const [day, setDay] = useState<Weekday | ''>('');
  const [start, setStart] = useState('');
  const [note, setNote] = useState('');

  // Days where at least one lesson of this length fits.
  const days = useMemo(
    () => WEEKDAYS.filter((entry) => validStarts(pairing.schedule, pairing.busy, entry, duration, rules.blockMinutes).length),
    [pairing.schedule, pairing.busy, duration, rules.blockMinutes],
  );
  const starts = day ? validStarts(pairing.schedule, pairing.busy, day, duration, rules.blockMinutes) : [];

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-max items-center gap-2 text-sm font-semibold text-coral">
        <Icon name="calendar" className="size-4" />
        {pairing.lesson ? 'Propose a different time' : 'Propose a time'}
      </button>
    );
  }

  if (!pairing.schedule.length) {
    return (
      <p className="rounded-xl bg-paper p-4 text-sm text-ink-soft">
        {pairing.side === 'mentor' ? (
          <>Set your <Link href="/dashboard/availability" className="font-semibold underline">availability</Link> first, then propose a time.</>
        ) : (
          'Your mentor hasn’t set their availability yet. You’ll be able to propose a time once they do.'
        )}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (day && start) onSubmit({ day, start, durationMinutes: duration, note });
      }}
    >
      <p className="text-sm font-semibold text-navy">Propose a weekly time</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Length" required>
          {({ id }) => (
            <Select id={id} value={duration} onChange={(e) => { setDuration(Number(e.target.value)); setStart(''); }}>
              {rules.durations.map((value) => <option key={value} value={value}>{value} min</option>)}
            </Select>
          )}
        </Field>
        <Field label="Day" required>
          {({ id }) => (
            <Select id={id} value={day} onChange={(e) => { setDay(e.target.value as Weekday); setStart(''); }} required>
              <option value="">Choose…</option>
              {days.map((value) => <option key={value} value={value}>{DAY_NAMES[value]}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Start" required>
          {({ id }) => (
            <Select id={id} value={start} onChange={(e) => setStart(e.target.value)} disabled={!day} required>
              <option value="">Choose…</option>
              {starts.map((value) => <option key={value} value={value}>{formatTime(value)}</option>)}
            </Select>
          )}
        </Field>
      </div>
      {!days.length ? (
        <p className="text-sm text-warn">No {duration}-minute slot fits the mentor’s availability. Try a shorter lesson.</p>
      ) : null}
      <Field label="Note (optional)">
        {({ id }) => <TextArea id={id} rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />}
      </Field>
      <p className="text-xs text-ink-faint">Times are {zoneLabel(pairing.timeZone)}. Only times inside the mentor’s availability are shown.</p>
      <div>
        <Button type="submit" size="sm" disabled={busy || !day || !start}>Send proposal</Button>
      </div>
    </form>
  );
}

function Absences({
  pairing,
  busy,
  otherLabel,
  run,
}: {
  pairing: Pairing;
  busy: boolean;
  otherLabel: string;
  run: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const lesson = pairing.lesson;

  const taken = new Set(pairing.absences.filter((absence) => absence.reporterSide === pairing.side).map((absence) => absence.date));
  const dates = lesson ? upcomingDates(lesson.day, 10).filter((value) => !taken.has(value)) : [];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-bold text-navy">Missed lessons</h3>

      {pairing.absences.length ? (
        <ul className="flex flex-col gap-3">
          {pairing.absences.map((absence) => {
            const mine = absence.reporterSide === pairing.side;
            return (
              <li key={absence.id} className={`rounded-xl p-4 ${mine ? 'bg-paper' : 'bg-coral/15'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy">
                    {mine ? 'You' : pairing.side === 'mentor' ? 'Your student' : 'Your mentor'} can’t make {formatDate(absence.date)}
                  </p>
                  {absence.acknowledgedAt ? <Badge tone="ok">Seen</Badge> : mine ? <Badge>Not seen yet</Badge> : <Badge tone="warn">New</Badge>}
                </div>
                {absence.message ? <p className="mt-1 text-sm text-ink-soft">“{absence.message}”</p> : null}
                <div className="mt-2 flex gap-2">
                  {!mine && !absence.acknowledgedAt ? (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => api.post(`/lessons/${pairing.id}/absences/${absence.id}/acknowledge`))}>
                      Mark as seen
                    </Button>
                  ) : null}
                  {mine ? (
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => api.post(`/lessons/${pairing.id}/absences/${absence.id}/withdraw`))}>
                      I can make it after all
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">No upcoming lessons are being missed.</p>
      )}

      {lesson ? (
        <form
          className="flex flex-col gap-3 rounded-xl border border-line p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!date) return;
            void run(() => api.post(`/lessons/${pairing.id}/absences`, { date, message })).then(() => {
              setDate('');
              setMessage('');
            });
          }}
        >
          <p className="text-sm font-semibold text-navy">Can’t make a lesson?</p>
          <Field label="Which lesson" required>
            {({ id }) => (
              <Select id={id} value={date} onChange={(e) => setDate(e.target.value)} required>
                <option value="">Choose a date…</option>
                {dates.map((value) => (
                  <option key={value} value={value}>
                    {formatDate(value)} · {formatTime(lesson.start)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Message (optional)" help={`Let ${otherLabel} know why (for example, a school trip), or suggest a makeup time.`}>
            {({ id }) => <TextArea id={id} rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />}
          </Field>
          <div>
            <Button type="submit" size="sm" variant="secondary" disabled={busy || !date}>
              Let {otherLabel} know
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-ink-faint">Once you’ve agreed a weekly time, you can tell {otherLabel} here if you’ll miss a lesson.</p>
      )}
    </div>
  );
}
