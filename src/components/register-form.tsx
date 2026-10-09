'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from './auth-provider';
import { Alert, Button, Card } from './ui';
import { Field, TextInput } from './ui/fields';

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await register({ name, email, password, role: 'student' });
      router.replace('/apply');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create an account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Already have one?{' '}
        <Link href="/login" className="font-medium text-accent underline underline-offset-2">
          Sign in
        </Link>
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        <Field label="Your name" required>
          {({ id }) => (
            <TextInput id={id} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          )}
        </Field>

        <Field label="Email address" required>
          {({ id }) => (
            <TextInput
              id={id}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>

        <Field label="Password" required help="At least 10 characters.">
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              type="password"
              autoComplete="new-password"
              aria-describedby={describedBy}
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}
