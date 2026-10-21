'use client';

// One application, read against the snapshot of the form as it was answered.
//
// Reading from `formSnapshot` rather than the live form is the point: an admin
// who reworded or removed a question after this was submitted must not change
// what this reviewer sees the applicant was asked.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import type { ApplicationDetail } from '@/lib/types';
import { formatAnswer } from './application-wizard';
import { Alert, Button, Card, PageHeader, Spinner, StatusBadge, cx, humanize } from './ui';
import { TextArea } from './ui/fields';

const DECISIONS = [
  { value: 'under_review', label: 'Mark under review', tone: 'secondary' as const },
  { value: 'accepted', label: 'Accept', tone: 'primary' as const },
  { value: 'waitlisted', label: 'Waitlist', tone: 'secondary' as const },
  { value: 'rejected', label: 'Reject', tone: 'danger' as const },
];

export function ApplicationReview({ id }: { id: string }) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [mentorNotice, setMentorNotice] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: ApplicationDetail }>(`/applications/${id}`)
      .then((body) => {
        setApplication(body.data);
        setReason(body.data.decision.reason ?? '');
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : 'We could not load this application.'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function decide(status: string) {
    if (!application) return;
    setBusy(status);
    setError(null);

    try {
      const body = await api.patch<{
        data: ApplicationDetail;
        meta?: { mentorRequest?: { sent: boolean; reason?: string } };
      }>(`/applications/${application.id}/decision`, { status, reason });
      setApplication(body.data);
      const mentorRequest = body.meta?.mentorRequest;
      setMentorNotice(
        mentorRequest && !mentorRequest.sent
          ? `Accepted, but the request didn’t go to ${body.data.requestedMentor?.name ?? 'the mentor'}: ${mentorRequest.reason ?? 'unknown reason'}. Match them from the Mentors area instead.`
          : null,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not record that decision.');
    } finally {
      setBusy(null);
    }
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!application || !note.trim()) return;
    setBusy('note');

    try {
      const body = await api.post<{ data: ApplicationDetail }>(`/applications/${application.id}/notes`, {
        body: note.trim(),
      });
      setApplication(body.data);
      setNote('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not save that note.');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <Spinner label="Loading the application" />;
  if (!application) return <Alert>{error ?? 'Application not found.'}</Alert>;

  const snapshot = application.formSnapshot;
  const answers = new Map(application.answers.map((answer) => [answer.questionKey, answer.value]));

  return (
    <>
      <Link
        href="/admin/applications"
        className="mb-6 inline-block text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
      >
        ← Back to the queue
      </Link>

      <PageHeader
        title={application.applicantName || 'Application'}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={`mailto:${application.applicantEmail}`}
              className="text-accent underline underline-offset-2"
            >
              {application.applicantEmail}
            </a>
            <span aria-hidden className="text-ink-faint">·</span>
            <span>{humanize(application.formSlug.replace(/-/g, ' '))}</span>
            {application.submittedAt ? (
              <>
                <span aria-hidden className="text-ink-faint">·</span>
                <span>Sent {new Date(application.submittedAt).toLocaleDateString()}</span>
              </>
            ) : null}
          </span>
        }
        actions={<StatusBadge status={application.status} />}
      />

      {error ? (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {!snapshot ? (
            <Alert tone="warn">
              This application has no saved copy of the form. It was most likely never submitted.
            </Alert>
          ) : (
            snapshot.sections.map((section) => (
              <Card key={section.key} className="overflow-hidden">
                <header className="border-b border-line bg-paper px-5 py-3">
                  <h2 className="font-medium text-ink">{section.title}</h2>
                  {section.description ? (
                    <p className="mt-0.5 text-sm text-ink-soft">{section.description}</p>
                  ) : null}
                </header>

                <dl className="divide-y divide-line">
                  {section.questions
                    .filter((question) => question.type !== 'statement')
                    .map((question) => {
                      const value = answers.get(question.key) ?? null;
                      const formatted = formatAnswer(value, question.options);

                      return (
                        <div key={question.key} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_1.5fr] sm:gap-6">
                          <dt className="text-sm text-ink-soft">{question.label}</dt>
                          <dd
                            className={cx(
                              'text-sm whitespace-pre-wrap',
                              formatted ? 'text-ink' : 'text-ink-faint italic',
                            )}
                          >
                            {formatted || 'No answer'}
                          </dd>
                        </div>
                      );
                    })}
                </dl>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          {application.requestedMentor ? (
            <Card className="p-5">
              <h2 className="font-medium text-ink">Requested mentor</h2>
              <p className="mt-1 text-sm text-ink">{application.requestedMentor.name}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {application.mentorRequestSent
                  ? 'Sent to the mentor when this was accepted. They accept or decline from their dashboard.'
                  : 'Accepting this application sends the student’s request to this mentor: first name, age group, instrument, level, availability and goals. Their contact details are not shared until the mentor accepts.'}
              </p>
              {mentorNotice ? (
                <div className="mt-3">
                  <Alert tone="warn">{mentorNotice}</Alert>
                </div>
              ) : null}
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="font-medium text-ink">Decision</h2>

            {application.decision.decidedAt ? (
              <p className="mt-1 text-sm text-ink-soft">
                Last set {new Date(application.decision.decidedAt).toLocaleString()}.
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">No decision recorded yet.</p>
            )}

            <label htmlFor="decision-reason" className="mt-4 block text-sm font-medium text-ink">
              Rationale
            </label>
            <p className="mb-1.5 text-xs text-ink-faint">Internal. The applicant never sees this.</p>
            <TextArea
              id="decision-reason"
              rows={3}
              value={reason}
              maxLength={2000}
              onChange={(event) => setReason(event.target.value)}
            />

            <div className="mt-4 grid gap-2">
              {DECISIONS.map((decision) => (
                <Button
                  key={decision.value}
                  variant={decision.tone}
                  disabled={busy !== null || application.status === decision.value}
                  onClick={() => decide(decision.value)}
                >
                  {busy === decision.value
                    ? 'Saving…'
                    : application.status === decision.value
                      ? `Currently ${humanize(decision.value).toLowerCase()}`
                      : decision.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-medium text-ink">Notes</h2>
            <p className="mt-1 text-sm text-ink-soft">Visible to reviewers only.</p>

            <ul className="mt-4 space-y-3">
              {application.notes.length ? (
                application.notes.map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-line bg-paper px-3 py-2.5">
                    <p className="text-sm whitespace-pre-wrap text-ink">{entry.body}</p>
                    <p className="mt-1.5 text-xs text-ink-faint">
                      {entry.authorName} · {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-ink-faint">No notes yet.</li>
              )}
            </ul>

            <form onSubmit={addNote} className="mt-4 space-y-2">
              <label htmlFor="new-note" className="sr-only">
                Add a note
              </label>
              <TextArea
                id="new-note"
                rows={3}
                placeholder="Add a note…"
                value={note}
                maxLength={4000}
                onChange={(event) => setNote(event.target.value)}
              />
              <Button type="submit" variant="secondary" className="w-full" disabled={!note.trim() || busy === 'note'}>
                {busy === 'note' ? 'Saving…' : 'Add note'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
