'use client';

// Lessons, for both sides of each pairing (an accepted match request):
//   - the agreed weekly time, the next few lessons, and how attendance is going
//   - a proposal waiting for an answer: accept/decline it, or withdraw yours
//   - "change the time": tap a length and a start; only starts that fit the
//     mentor's availability and miss their other lessons are offered
//   - "I can't make it": a notice for one upcoming lesson, which the other
//     side sees and can mark as seen
//   - the video call link, and lesson notes with a practice checklist
// The calendar page shows every lesson by month and is where attendance is marked.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardHeading, Panel } from '@/components/layout/dashboard-shell';
import { ParentConsentCard } from '@/components/policies/agreement-cards';
import { LessonNotes, MeetingLink } from '@/components/dashboard/lesson-notes';
import { ReportConcernButton } from '@/components/policies/report-concern';
import { Icon } from '@/components/public/marketing';
import { Alert, Badge, Button, EmptyState, Spinner, cx } from '@/components/ui';
import { Field, Select, TextArea } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import {
  STATUS_LABEL,
  STATUS_TONE,
  clockRange,
  firstName,
  lessonDay,
  longDay,
  todayKey,
  yourTime,
} from '@/lib/calendar';
import { DAY_NAMES, WEEKDAYS, formatDate, formatRange, formatTime, upcomingDates, validStarts, zoneLabel } from '@/lib/schedule';
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
        description="Your weekly lesson time, what’s coming up, and how to let each other know if you can’t make one."
        actions={
          <Link
            href="/dashboard/calendar"
            className="flex items-center gap-2 rounded-lg border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
          >
            <Icon name="calendar" className="size-4" />
            Open calendar
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <ParentConsentCard className="mb-6" />
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
  const otherName = other.name.replace(/\s*\(test\)$/, '');
  const first = firstName(other.name);
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
  const lesson = pairing.lesson;
  const local = lesson ? yourTime(lesson.day, lesson.start, lesson.durationMinutes, lesson.timeZone) : null;

  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-2">
          {otherName}
          <Badge>{pairing.instrument}</Badge>
        </span>
      }
      action={
        pairing.studentContact?.email ? (
          <a href={`mailto:${pairing.studentContact.email}`} className="text-sm font-semibold break-all text-coral">
            {pairing.studentContact.email}
          </a>
        ) : null
      }
    >
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {/* The weekly time */}
          <div className="rounded-xl bg-sky/30 p-5">
            <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">Weekly lesson</p>
            {lesson ? (
              <>
                <p className="mt-1 font-display text-2xl font-bold text-navy">{DAY_NAMES[lesson.day]}s</p>
                <p className="text-navy/80">
                  {formatRange(lesson.start, lesson.durationMinutes)} · {lesson.durationMinutes} min · {zone}
                </p>
                {local ? <p className="mt-1 text-sm text-navy/70">That’s {local} where you are.</p> : null}
              </>
            ) : (
              <p className="mt-1 text-navy/75">
                {proposal ? 'Not agreed yet. See the proposal below.' : `Not agreed yet. Pick a time below and ${first} can accept it.`}
              </p>
            )}
            {pairing.waitingForConsent ? (
              <p className="mt-3 border-t border-navy/10 pt-3 text-sm text-navy/80">
                {pairing.side === 'student'
                  ? 'Lessons start once your parent or guardian gives consent. Send them the link from the top of this page.'
                  : `Lessons start once ${first}’s parent or guardian gives consent. You can suggest a time now; it’s confirmed after that.`}
              </p>
            ) : null}
          </div>

          {proposal ? (
            <div className="rounded-xl border border-gold bg-gold/15 p-5">
              <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">
                {theirProposal ? `${first} suggested a new time` : 'You suggested a new time'}
              </p>
              <p className="mt-1 font-semibold text-navy">
                {DAY_NAMES[proposal.day]}s, {formatRange(proposal.start, proposal.durationMinutes)} ({proposal.durationMinutes} min)
              </p>
              {yourTime(proposal.day, proposal.start, proposal.durationMinutes, proposal.timeZone) ? (
                <p className="text-sm text-navy/70">
                  {zoneLabel(proposal.timeZone)}. That’s {yourTime(proposal.day, proposal.start, proposal.durationMinutes, proposal.timeZone)} for
                  you.
                </p>
              ) : null}
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

          <UpcomingLessons pairing={pairing} />

          <MeetingLink pairing={pairing} onSaved={onChange} />

          <TimePicker
            pairing={pairing}
            rules={rules}
            busy={busy}
            onSubmit={(values) => run(() => api.post(`/lessons/${pairing.id}/proposals`, values))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <AttendanceSummary pairing={pairing} />
          <Absences pairing={pairing} busy={busy} otherLabel={otherLabel} run={run} />
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/messages/${pairing.id}`}
              className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
            >
              Message {first}
            </Link>
            <Link href="/dashboard/resources" className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-navy hover:bg-paper">
              Shared resources
            </Link>
          </div>
          <ReportConcernButton kind="pairing" targetId={pairing.id} about={`Lessons with ${first}`} className="self-start" />
        </div>
      </div>

      <LessonNotes pairing={pairing} />
    </Panel>
  );
}

/** The next few lessons, on the viewer's clock, with any "can't make it" notices. */
function UpcomingLessons({ pairing }: { pairing: Pairing }) {
  if (!pairing.lesson || !pairing.upcoming.length) return null;
  const today = todayKey();
  const [next, ...later] = pairing.upcoming;
  const nextDay = lessonDay(next);
  const nextNotice = next.notices.length > 0;

  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs font-semibold tracking-widest text-navy/60 uppercase">Next lesson</p>
      <p className={cx('mt-1 font-semibold text-navy', nextNotice && 'line-through decoration-coral')}>
        {nextDay === today ? 'Today' : longDay(nextDay)}, {clockRange(next)}
      </p>
      {nextNotice ? (
        <p className="text-sm text-coral">
          {next.notices.map((notice) => (notice.side === pairing.side ? 'You' : firstName(next.withName))).join(' and ')} can’t make this one.
        </p>
      ) : null}
      {pairing.meetingUrl && !nextNotice ? (
        <a
          href={pairing.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90"
        >
          Join the call
        </a>
      ) : null}
      {later.length ? (
        <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-sm">
          {later.slice(0, 4).map((lesson) => (
            <li key={lesson.id} className="flex flex-wrap justify-between gap-x-3 text-ink-soft">
              <span className={cx(lesson.notices.length > 0 && 'line-through')}>{formatDate(lessonDay(lesson))}</span>
              <span>{lesson.notices.length ? 'Someone can’t make it' : clockRange(lesson)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** How the last 12 weeks went, and lessons waiting to be marked. */
function AttendanceSummary({ pairing }: { pairing: Pairing }) {
  const counts = pairing.attendance;
  const total = counts.held + counts.student_missed + counts.mentor_missed + counts.cancelled + counts.unmarked;
  if (!total) return null;

  const parts = (
    [
      ['held', counts.held],
      ['student_missed', counts.student_missed],
      ['mentor_missed', counts.mentor_missed],
      ['cancelled', counts.cancelled],
    ] as const
  ).filter(([, value]) => value > 0);

  return (
    <div className="rounded-xl bg-paper p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-navy">Attendance</h3>
        <span className="text-xs text-ink-faint">Last 12 weeks</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {parts.map(([status, value]) => (
          <Badge key={status} tone={STATUS_TONE[status]}>
            {STATUS_LABEL[status]}: {value}
          </Badge>
        ))}
        {counts.unmarked ? <Badge>Not marked: {counts.unmarked}</Badge> : null}
      </div>
      {counts.unmarked && pairing.side === 'mentor' ? (
        <p className="mt-3 text-sm text-navy">
          {counts.unmarked === 1 ? 'One lesson needs' : `${counts.unmarked} lessons need`} marking.{' '}
          <Link href="/dashboard/calendar" className="font-semibold text-coral underline">
            Mark it on the calendar
          </Link>
        </p>
      ) : null}
      {pairing.recent.length ? (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {pairing.recent.slice(0, 4).map((lesson) => (
            <li key={lesson.id} className="flex justify-between gap-3 text-ink-soft">
              <span>{formatDate(lesson.date)}</span>
              <span className="text-navy">{lesson.status ? STATUS_LABEL[lesson.status] : 'Not marked'}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Pick a weekly time: a length, then one of the open start times, grouped by
 * day. Only times inside the mentor's availability that miss their other
 * lessons are offered.
 */
function TimePicker({
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
  const [duration, setDuration] = useState(pairing.lesson?.durationMinutes ?? (rules.durations.includes(60) ? 60 : rules.durations[0]));
  const [choice, setChoice] = useState<{ day: Weekday; start: string } | null>(null);
  const [note, setNote] = useState('');

  const options = useMemo(
    () =>
      WEEKDAYS.map((day) => ({
        day,
        starts: validStarts(pairing.schedule, pairing.busy, day, duration, rules.blockMinutes),
      })).filter((entry) => entry.starts.length),
    [pairing.schedule, pairing.busy, duration, rules.blockMinutes],
  );

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-max items-center gap-2 text-sm font-semibold text-coral">
        <Icon name="calendar" className="size-4" />
        {pairing.lesson ? 'Suggest a different weekly time' : 'Suggest a weekly time'}
      </button>
    );
  }

  if (!pairing.schedule.length) {
    return (
      <p className="rounded-xl bg-paper p-4 text-sm text-ink-soft">
        {pairing.side === 'mentor' ? (
          <>Set your <Link href="/dashboard/availability" className="font-semibold underline">availability</Link> first, then suggest a time.</>
        ) : (
          'Your mentor hasn’t set their availability yet. You’ll be able to suggest a time once they do.'
        )}
      </p>
    );
  }

  const isCurrent = (day: Weekday, start: string) =>
    pairing.lesson?.day === day && pairing.lesson.start === start && pairing.lesson.durationMinutes === duration;
  const local = choice ? yourTime(choice.day, choice.start, duration, pairing.timeZone) : null;

  return (
    <form
      className="@container flex flex-col gap-4 rounded-xl border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (choice) onSubmit({ ...choice, durationMinutes: duration, note });
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-navy">{pairing.lesson ? 'Suggest a different weekly time' : 'Suggest a weekly time'}</p>
        {pairing.lesson || pairing.proposal ? (
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-soft hover:text-navy">
            Close
          </button>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold text-ink-soft">How long?</legend>
        <div className="inline-flex rounded-lg border border-line-strong bg-paper p-1">
          {rules.durations.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={duration === value}
              onClick={() => {
                setDuration(value);
                setChoice(null);
              }}
              className={cx(
                'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                duration === value ? 'bg-white text-navy shadow-sm' : 'text-ink-soft hover:text-navy',
              )}
            >
              {value} min
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold text-ink-soft">Pick a start time ({zoneLabel(pairing.timeZone)})</legend>
        {options.length ? (
          <div className="flex flex-col gap-3">
            {options.map(({ day, starts }) => (
              <div key={day} className="grid gap-1.5 @md:grid-cols-[6.5rem_1fr] @md:items-start">
                <p className="text-sm font-semibold text-navy @md:pt-1.5">{DAY_NAMES[day]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {starts.map((start) => {
                    const picked = choice?.day === day && choice.start === start;
                    const current = isCurrent(day, start);
                    return (
                      <button
                        key={start}
                        type="button"
                        disabled={current}
                        aria-pressed={picked}
                        onClick={() => setChoice({ day, start })}
                        title={current ? 'Your current lesson time' : undefined}
                        className={cx(
                          'rounded-lg border px-2.5 py-1.5 text-sm font-semibold transition-colors pointer-coarse:px-3 pointer-coarse:py-2',
                          picked
                            ? 'border-navy bg-navy text-white'
                            : current
                              ? 'border-dashed border-line-strong bg-paper text-ink-faint'
                              : 'border-line-strong bg-white text-navy hover:border-navy',
                        )}
                      >
                        {formatTime(start)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-warn">No {duration}-minute time fits the mentor’s availability. Try a shorter lesson.</p>
        )}
      </fieldset>

      {choice ? (
        <div className="rounded-lg bg-sky/30 px-3 py-2 text-sm text-navy">
          <strong>
            {DAY_NAMES[choice.day]}s, {formatRange(choice.start, duration)}
          </strong>{' '}
          {zoneLabel(pairing.timeZone)}
          {local ? <span className="block text-navy/70">That’s {local} where you are.</span> : null}
        </div>
      ) : null}

      <Field label="Note (optional)">
        {({ id }) => (
          <TextArea id={id} rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. starting next week works best" />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={busy || !choice}>
          Send to {pairing.side === 'mentor' ? 'your student' : 'your mentor'}
        </Button>
        <p className="text-xs text-ink-faint">They accept it, then it becomes your weekly time.</p>
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
      <h3 className="font-display text-lg font-bold text-navy">Can’t make a lesson?</h3>

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
      ) : null}

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
