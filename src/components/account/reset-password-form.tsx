'use client';

// Step two of a password reset: the page the emailed link opens. It checks the
// link first, so nobody types a new password into a link that already expired.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { accountHome, useAuth } from './auth-provider';
import { Alert, Button, Card, Spinner } from '../ui';
import { Field, TextInput } from '../ui/fields';

type LinkState = { status: 'checking' } | { status: 'ok'; email: string } | { status: 'bad'; message: string };

const BAD_LINK = 'This reset link has expired or was already used. Ask for a new one.';
const LINK = 'font-medium text-accent underline underline-offset-2';

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read once: the address is cleaned up below, and the token has to outlive that.
  const [token] = useState(() => searchParams.get('t') ?? '');
  const [link, setLink] = useState<LinkState>(() =>
    token ? { status: 'checking' } : { status: 'bad', message: BAD_LINK },
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Keep the reset link out of the address bar and the browser's history.
    window.history.replaceState(window.history.state, '', window.location.pathname);
    let cancelled = false;
    api
      .post<{ data: { email: string } }>('/auth/reset-password/check', { token }, { anonymous: true })
      .then((body) => {
        if (!cancelled) setLink({ status: 'ok', email: body.data.email });
      })
      .catch((err) => {
        if (!cancelled) {
          setLink({ status: 'bad', message: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('The two passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      const account = await resetPassword(token, password);
      router.replace(accountHome(account));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'reset_invalid') {
        setLink({ status: 'bad', message: err.message });
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
      setBusy(false);
    }
  }

  if (link.status === 'checking') return <Spinner label="Checking your link" />;

  if (link.status === 'bad') {
    return (
      <Card className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">This link doesn’t work</h1>
        <p className="mt-3 text-ink-soft">{link.message}</p>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/forgot-password" className={LINK}>
            Send a new link
          </Link>
          <Link href="/login" className={LINK}>
            Back to sign in
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Choose a new password</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        For <strong className="break-all text-ink">{link.email}</strong>. Saving signs you out on every other device and
        signs you in here.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        {/* Tells password managers which account the new password belongs to. */}
        <input type="email" name="username" autoComplete="username" value={link.email} readOnly hidden />

        <Field label="New password" required help="At least 10 characters.">
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              type="password"
              aria-describedby={describedBy}
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>

        <Field label="Type it again" required>
          {({ id }) => (
            <TextInput
              id={id}
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Saving…' : 'Save and sign in'}
        </Button>
      </form>
    </Card>
  );
}
