'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from './auth-provider';
import { Alert, Button, Card } from './ui';
import { Field, TextInput } from './ui/fields';

export function SignInForm() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only ever a path on this site: an attacker-supplied absolute URL here would
  // turn the sign-in page into an open redirect.
  const raw = searchParams.get('next') ?? '/';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const account = await signIn(email, password);
      router.replace(account.role === 'admin' && next === '/' ? '/admin/applications' : next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        New here?{' '}
        <Link href="/register" className="font-medium text-accent underline underline-offset-2">
          Create an account
        </Link>
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

        <Field label="Password" required>
          {({ id }) => (
            <TextInput
              id={id}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}
