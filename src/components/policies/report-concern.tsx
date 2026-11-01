'use client';

// "Report a concern": a small button wherever someone might need one (a mentor
// page, a lesson pairing, a conversation, a shared file), and the same form on
// its own page for anything else. Reports go to Note by Note admins only; the
// person reported is never told who raised it. Single messages keep their own
// Report link in the conversation.

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import { useAuth } from './auth-provider';
import { Alert, Button, cx } from './ui';
import { Field, TextArea } from './ui/fields';

export type ReportKind = 'mentor' | 'pairing' | 'resource' | 'team-thread' | 'general';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'safety', label: 'I’m worried about someone’s safety' },
  { value: 'inappropriate', label: 'Something inappropriate was said or shared' },
  { value: 'harassment', label: 'Bullying or harassment' },
  { value: 'privacy', label: 'Someone asked for or shared personal information' },
  { value: 'spam', label: 'Spam, a scam or a request for money' },
  { value: 'other', label: 'Something else' },
];

/** The form itself, shared by the dialog and the report page. */
export function ReportConcernForm({
  kind,
  targetId,
  about,
  onDone,
  onCancel,
}: {
  kind: ReportKind;
  targetId?: string;
  /** Shown above the form, e.g. "About: Tess Teacher’s page". */
  about?: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!user) {
    return (
      <p className="text-sm leading-relaxed text-navy/80">
        <Link href="/login" className="font-medium underline underline-offset-2">Sign in</Link> to report a concern, or write to us
        through the <Link href="/contact" className="font-medium underline underline-offset-2">contact page</Link>. If someone is in
        danger, contact your local emergency services first.
      </p>
    );
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-navy">Thank you for telling us</p>
        <p className="text-sm leading-relaxed text-navy/80">
          An admin will look into it. The person you reported isn’t told who reported them. If someone is in danger,
          contact your local emergency services.
        </p>
        {onDone ? (
          <div>
            <Button size="sm" variant="secondary" onClick={onDone}>Close</Button>
          </div>
        ) : null}
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!category) return setError('Choose what kind of concern it is.');
    if (details.trim().length < 10) return setError('Tell us a little more about what happened.');
    setBusy(true);
    try {
      await api.post('/reports', { kind, targetId, category, details: details.trim() });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t send. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {about ? <p className="text-sm text-navy/70">About: {about}</p> : null}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-ink">What’s the concern?</legend>
        {CATEGORIES.map((option) => (
          <label key={option.value} className="flex items-start gap-3 text-sm text-navy/90">
            <input
              type="radio"
              name="report-category"
              value={option.value}
              checked={category === option.value}
              onChange={() => setCategory(option.value)}
              className="mt-0.5 size-4 shrink-0 accent-navy"
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <Field label="What happened?" required help="Only Note by Note admins read this. Include dates if you can.">
        {({ id, describedBy }) => (
          <TextArea id={id} aria-describedby={describedBy} rows={4} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} />
        )}
      </Field>
      <p className="text-xs text-ink-faint">If someone is in danger, contact your local emergency services first.</p>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        ) : null}
      </div>
    </form>
  );
}

/** A quiet "Report" link that opens the form in a dialog. */
export function ReportConcernButton({
  kind,
  targetId,
  about,
  label = 'Report a concern',
  className,
}: {
  kind: ReportKind;
  targetId?: string;
  about?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx('inline-flex items-center gap-1.5 text-sm text-navy/60 underline-offset-2 hover:text-danger hover:underline', className)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
          <path d="M4 22V4M4 4h12l-2 4 2 4H4" />
        </svg>
        {label}
      </button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="report-title" className="mb-4 font-display text-xl font-bold text-navy">Report a concern</h2>
            <ReportConcernForm kind={kind} targetId={targetId} about={about} onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
