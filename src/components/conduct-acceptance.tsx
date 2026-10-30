'use client';

// The end of the Code of Conduct page: signed-in people accept it here by
// ticking the box and typing their full name. New accounts accept it when they
// sign up, so this is mostly for people who joined before it existed, or after
// it changed.

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { CONDUCT_FORM } from '@/content/policies/forms';
import { ApiError, api } from '@/lib/api';
import { POLICY_LANGUAGES, policyHref, type PolicyLanguage } from '@/lib/policy-languages';
import type { AccountUser } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Alert, Button } from './ui';
import { Field, TextInput } from './ui/fields';

export function ConductAcceptance({ lang = 'en' }: { lang?: PolicyLanguage }) {
  const { user, loading } = useAuth();
  const t = CONDUCT_FORM[lang];

  if (loading) return null;

  const box = 'scroll-mt-24 rounded-2xl border border-navy/10 bg-cream/60 p-6 md:p-8';

  if (!user) {
    return (
      <section id="accept" className={box}>
        <h2 className="font-display text-2xl font-bold">{t.signedOutTitle}</h2>
        <p className="mt-2 leading-relaxed text-navy/80">
          {t.signedOutBefore}{' '}
          <Link
            href={`/login?next=${encodeURIComponent(`${policyHref('/code-of-conduct', lang)}#accept`)}`}
            className="font-medium underline underline-offset-2"
          >
            {t.signIn}
          </Link>{' '}
          {t.signedOutAfter}
        </p>
      </section>
    );
  }

  if (hasAccepted(user)) {
    const when = user.agreements?.conductAcceptedAt
      ? new Date(user.agreements.conductAcceptedAt).toLocaleDateString(localeOf(lang), { dateStyle: 'long' })
      : null;
    return (
      <section id="accept" className={box}>
        <h2 className="font-display text-2xl font-bold">{t.acceptedTitle}</h2>
        <p className="mt-2 leading-relaxed text-navy/80">
          {when ? t.acceptedOn(when) : ''}
          {t.thanks}
        </p>
      </section>
    );
  }

  return (
    <section id="accept" className={box}>
      <h2 className="font-display text-2xl font-bold">{t.acceptTitle}</h2>
      <p className="mt-2 leading-relaxed text-navy/80">{t.acceptIntro}</p>
      <ConductForm className="mt-6" lang={lang} />
    </section>
  );
}

function localeOf(lang: PolicyLanguage) {
  return POLICY_LANGUAGES.find((language) => language.code === lang)?.locale;
}

/** Whether the current Code of Conduct and Terms are both accepted. (Either one changing asks again.) */
export function hasAccepted(user: AccountUser | null): boolean {
  return Boolean(user?.agreements?.conduct && user.agreements.terms);
}

/**
 * Tick, type your name, accept. On the Code of Conduct page, and inline
 * wherever something needs it first (sending an application, asking a mentor).
 */
export function ConductForm({
  className,
  compact = false,
  lang = 'en',
}: {
  className?: string;
  compact?: boolean;
  lang?: PolicyLanguage;
}) {
  const { user, refreshUser } = useAuth();
  const t = CONDUCT_FORM[lang];
  const [agreed, setAgreed] = useState(false);
  const [terms, setTerms] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsTerms = !user?.agreements?.terms;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!agreed) return setError(t.tickConduct);
    if (needsTerms && !terms) return setError(t.tickTerms);
    if (name.trim().length < 2) return setError(t.typeName);
    setBusy(true);
    try {
      await api.post('/me/agreements', { conduct: true, terms, signedName: name.trim() });
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.notSaved);
      setBusy(false);
    }
  }

  const target = compact ? '_blank' : undefined;
  const text = compact ? 'text-sm text-navy/90' : 'text-navy/90';
  return (
    <form onSubmit={submit} className={`flex flex-col gap-4 ${className ?? ''}`}>
      <label className={`flex items-start gap-3 ${text}`}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-4 shrink-0 accent-navy" />
        <span>
          {t.conductTick[0]}
          <Link href={policyHref('/code-of-conduct', lang)} target={target} className="underline underline-offset-2">
            {t.conductTick[1]}
          </Link>
          {t.conductTick[2]}
        </span>
      </label>
      {needsTerms ? (
        <label className={`flex items-start gap-3 ${text}`}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 size-4 shrink-0 accent-navy" />
          <span>
            {t.termsTick[0]}
            <Link href={policyHref('/terms', lang)} target={target} className="underline underline-offset-2">
              {t.termsTick[1]}
            </Link>
            {t.termsTick[2]}
            <Link href={policyHref('/privacy', lang)} target={target} className="underline underline-offset-2">
              {t.termsTick[3]}
            </Link>
            {t.termsTick[4]}
          </span>
        </label>
      ) : null}
      <Field label={t.nameLabel} required help={t.nameHelp}>
        {({ id, describedBy }) => (
          <TextInput
            id={id}
            aria-describedby={describedBy}
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-sm"
          />
        )}
      </Field>
      {error ? <Alert>{error}</Alert> : null}
      <div>
        <Button type="submit" size={compact ? 'sm' : undefined} disabled={busy}>
          {busy ? t.saving : t.accept}
        </Button>
      </div>
    </form>
  );
}

/**
 * Shown in place of an action that needs the Code of Conduct first, so the
 * person can sign right there and carry on.
 */
export function ConductGate({ action, className }: { action: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-gold/60 bg-gold/10 p-4 ${className ?? ''}`}>
      <p className="font-semibold text-navy">Before you {action}, please accept our Code of Conduct</p>
      <p className="mt-1 text-sm text-navy/75">It explains how everyone keeps lessons safe and friendly.</p>
      <ConductForm compact className="mt-4" />
    </div>
  );
}

/** The box every sign-up form asks people to tick. Their account name is the signature. */
export function SignUpAgreement({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink-soft">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-navy"
      />
      <span>
        I agree to the{' '}
        <Link href="/terms" target="_blank" className="font-medium text-ink underline underline-offset-2">
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link href="/code-of-conduct" target="_blank" className="font-medium text-ink underline underline-offset-2">
          Code of Conduct
        </Link>
        , and I’ve read the{' '}
        <Link href="/privacy" target="_blank" className="font-medium text-ink underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
