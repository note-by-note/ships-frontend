'use client';

// Matching: accepted students who still need a mentor, each with the mentors
// who fit best and why. "Match" sends that mentor a request marked as
// suggested by the team; tick "already agreed" to pair them straight away.

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { ApplicationTabs } from '@/components/staff-shell';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { MatchingBoard, MentorSuggestion } from '@/lib/types';

type Student = MatchingBoard['needsMentor'][number];

function plain(name: string) {
  return name.replace(/\s*\(test\)$/, '');
}

function since(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MatchingPage() {
  const [board, setBoard] = useState<MatchingBoard | null>(null);
  const [includeTest, setIncludeTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<{ student: Student; mentor: MentorSuggestion } | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: MatchingBoard }>(`/matching${includeTest ? '?includeTest=1' : ''}`)
      .then((body) => setBoard(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load matching.'));
  }, [includeTest]);

  useEffect(load, [load]);

  async function withdraw(requestId: string, mentor: string) {
    if (!window.confirm(`Withdraw the request to ${plain(mentor)}? You can then pick another mentor.`)) return;
    try {
      await api.post(`/matching/${requestId}/withdraw`);
      setNotice(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work.');
    }
  }

  return (
    <RequirePermission anyOf={['applications.review']}>
      <ApplicationTabs />
      <DashboardHeading
        title="Matching"
        description="Accepted students who still need a mentor, with the mentors who fit them best."
      />

      <div className="flex max-w-5xl flex-col gap-6">
        <label className="flex items-center gap-2 self-end text-sm text-ink-soft">
          <input type="checkbox" checked={includeTest} onChange={(event) => setIncludeTest(event.target.checked)} />
          Include test accounts
        </label>
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert tone="ok">{notice}</Alert> : null}

        {!board ? (
          <Spinner />
        ) : (
          <>
            <section aria-labelledby="needs-mentor">
              <h2 id="needs-mentor" className="mb-3 font-display text-xl font-bold text-navy">
                Needs a mentor {board.needsMentor.length ? <span className="text-navy/50">({board.needsMentor.length})</span> : null}
              </h2>
              {!board.needsMentor.length ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-ink-soft shadow-sm">
                  Every accepted student has a mentor or is waiting on one.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {board.needsMentor.map((student) => (
                    <StudentCard key={student.applicationId} student={student} onMatch={(mentor) => setChoosing({ student, mentor })} />
                  ))}
                </ul>
              )}
            </section>

            {board.waiting.length ? (
              <Panel title={`Waiting for a mentor's answer (${board.waiting.length})`}>
                <ul className="divide-y divide-line">
                  {board.waiting.map((entry) => (
                    <li key={entry.requestId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-navy">
                          {plain(entry.name)} <span className="font-normal text-ink-soft">· {entry.instrument}</span>
                          {entry.isTest ? <Badge tone="warn" className="ml-2">Test</Badge> : null}
                        </p>
                        <p className="text-sm text-ink-soft">
                          Asked {plain(entry.mentor)} on {since(entry.since)}
                          {entry.byStaff ? ' (suggested by staff)' : ' (the student asked)'}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => withdraw(entry.requestId, entry.mentor)}>
                        Pick someone else
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}
          </>
        )}
      </div>

      {choosing ? (
        <ConfirmMatch
          student={choosing.student}
          mentor={choosing.mentor}
          onClose={() => setChoosing(null)}
          onDone={(message) => {
            setChoosing(null);
            setNotice(message);
            load();
          }}
        />
      ) : null}
    </RequirePermission>
  );
}

function StudentCard({ student, onMatch }: { student: Student; onMatch: (mentor: MentorSuggestion) => void }) {
  const facts = [student.instrument, student.experienceLevel, student.ageGroup ? `ages ${student.ageGroup}` : null, student.school || null].filter(Boolean);

  return (
    <li className="grid gap-5 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-navy">
          {plain(student.name)}
          {student.isTest ? <Badge tone="warn">Test</Badge> : null}
        </p>
        <p className="text-sm text-ink-soft">{facts.join(' · ')}</p>
        {student.availability.length ? (
          <p className="mt-2 text-sm text-ink-soft">
            <span className="font-medium text-ink">Free:</span> {student.availability.join(', ')}
          </p>
        ) : null}
        {student.languages.length ? (
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">Languages:</span> {student.languages.join(', ')}
          </p>
        ) : null}
        {student.goals ? <p className="mt-2 line-clamp-3 text-sm text-navy/70">“{student.goals}”</p> : null}
        {student.declined.length ? (
          <p className="mt-2 text-xs text-ink-faint">Declined by {student.declined.map(plain).join(', ')}</p>
        ) : null}
        <Link href={`/admin/applications/${student.applicationId}`} className="mt-3 inline-block text-sm font-semibold text-navy underline underline-offset-4">
          Read the application
        </Link>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">Best fits</p>
        {!student.suggestions.length ? (
          <p className="rounded-xl bg-paper p-4 text-sm text-ink-soft">
            No mentor taking students teaches {student.instrument ?? 'this instrument'} right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {student.suggestions.map((mentor, index) => (
              <li key={mentor.mentorId} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <Link href={`/find-a-mentor/${mentor.slug}`} target="_blank" className="hover:underline">
                      {plain(mentor.name)}
                    </Link>
                    {index === 0 ? <Badge tone="ok">Best fit</Badge> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{mentor.reasons.join(' · ')}</p>
                </div>
                <Button size="sm" variant={index === 0 ? 'primary' : 'secondary'} onClick={() => onMatch(mentor)}>
                  Match
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function ConfirmMatch({
  student,
  mentor,
  onClose,
  onDone,
}: {
  student: Student;
  mentor: MentorSuggestion;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [confirmNow, setConfirmNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const studentName = plain(student.name).split(' ')[0];
  const mentorName = plain(mentor.name).split(' ')[0];

  async function match() {
    setBusy(true);
    setError(null);
    try {
      await api.post('/matching', { applicationId: student.applicationId, mentorId: mentor.mentorId, confirmNow });
      onDone(
        confirmNow
          ? `${studentName} and ${mentorName} are matched. They can now agree a lesson time.`
          : `Sent ${mentorName} a request to teach ${studentName}. It shows in their dashboard.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work.');
      setBusy(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="match-title" className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="match-title" className="font-display text-xl font-bold text-navy">
          Match {studentName} with {mentorName}?
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          {mentorName} gets a request to teach {studentName} ({student.instrument}), marked as suggested by the team.
          They accept or decline it from their dashboard.
        </p>
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-paper p-3 text-sm">
          <input type="checkbox" checked={confirmNow} onChange={(event) => setConfirmNow(event.target.checked)} className="mt-0.5 size-4 accent-navy" />
          <span>
            <span className="font-medium text-ink">{mentorName} has already agreed</span>
            <span className="block text-ink-soft">Match them now, without waiting for {mentorName} to accept.</span>
          </span>
        </label>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={match} disabled={busy}>
            {busy ? 'Matching…' : confirmNow ? 'Match now' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  );
}
