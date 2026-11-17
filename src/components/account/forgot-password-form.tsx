'use client';

// Step one of a password reset: ask for the account's email. The API answers
// the same way whether or not an account exists, so this page does too.

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import { SITE } from '@/lib/site';
import { Alert, Button, Card } from '../ui';
import { Field, TextInput } from '../ui/fields';

const LINK = 'font-medium text-accent underline underline-offset-2';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ emailEnabled: boolean } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const body = await api.post<{ data: { emailEnabled: boolean } }>(
        '/auth/forgot-password',
        { email: email.trim() },
        { anonymous: true },
      );
      setSent(body.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Card className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {sent.emailEnabled ? 'Check your email' : 'We can’t email you yet'}
        </h1>
        {sent.emailEnabled ? (
          <>
            <p className="mt-3 text-ink-soft">
              If there’s an account for <strong className="break-all text-ink">{email.trim()}</strong>, we’ve sent it a
              link to choose a new password. The link works for one hour.
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              Nothing after a few minutes? Check your spam folder, or{' '}
              <button type="button" onClick={() => setSent(null)} className={LINK}>
                try again
              </button>
              .
            </p>
          </>
        ) : (
          <p className="mt-3 text-ink-soft">
            The site isn’t set up to send email yet, so no reset link went out.{' '}
            {SITE.contactEmail ? (
              <>
                Email us at{' '}
                <a href={`mailto:${SITE.contactEmail}`} className={LINK}>
                  {SITE.contactEmail}
                </a>{' '}
                from the address you signed up with and we’ll help you get back in.
              </>
            ) : (
              <>Contact the Note by Note team and we’ll help you get back in.</>
            )}
          </p>
        )}
        <p className="mt-6 text-sm">
          <Link href="/login" className={LINK}>
            Back to sign in
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Enter the email you signed up with and we’ll send you a link to choose a new one.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        <Field label="Email address" required>
          {({ id }) => (
            <TextInput
              id={id}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Remembered it?{' '}
        <Link href="/login" className={LINK}>
          Sign in
        </Link>
      </p>
    </Card>
  );
}
