'use client';

// The account half of the application.
//
// It is a step in the wizard rather than a redirect to /login because an
// applicant who is bounced to a sign-in page mid-form has to trust that their
// answers will still be there when they come back. Keeping it inline means
// they never leave the page and can see that they will not lose their place.

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useAuth } from './auth-provider';
import { Alert, Button, cx } from './ui';
import { Field, TextInput } from './ui/fields';
import { SignUpAgreement } from './conduct-acceptance';

export function AccountStep({ onDone }: { onDone: () => void }) {
  const { register, signIn } = useAuth();
  const [mode, setMode] = useState<'register' | 'signin'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === 'register') await register({ name, email, password, role: 'student', acceptAgreements: agreed });
      else await signIn(email, password);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">
          {mode === 'register' ? 'Create your account' : 'Sign in to continue'}
        </h2>
        <p className="mt-1 text-ink-soft">
          An account lets you save your progress and come back to finish later, and it is how we send
          you the decision.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-line-strong bg-paper p-1" role="tablist">
        {(['register', 'signin'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={mode === option}
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            className={cx(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              mode === option ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
            )}
          >
            {option === 'register' ? 'New here' : 'I have an account'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="max-w-md space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        {mode === 'register' ? (
          <Field label="Your name" required>
            {({ id }) => (
              <TextInput
                id={id}
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>
        ) : null}

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

        <Field
          label="Password"
          required
          help={mode === 'register' ? 'At least 10 characters.' : undefined}
        >
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              type="password"
              aria-describedby={describedBy}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'register' ? 10 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>

        {mode === 'register' ? <SignUpAgreement checked={agreed} onChange={setAgreed} /> : null}

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? 'One moment…' : mode === 'register' ? 'Create account and continue' : 'Sign in and continue'}
        </Button>
      </form>
    </div>
  );
}
