'use client';

// Two dashboard cards about agreements:
//   - a reminder to accept the Code of Conduct (and Terms), for anyone who
//     hasn't accepted the current version
//   - for students under 18, getting a parent or guardian's consent: copy a
//     private link to send them, or have the site email the guardian on the
//     application

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import type { ConsentState } from '@/lib/types';
import { useAuth } from './auth-provider';
import { Button } from './ui';

export function AgreementReminder({ className }: { className?: string }) {
  const { user } = useAuth();
  const agreements = user?.agreements;
  if (!agreements || (agreements.conduct && agreements.terms)) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/60 bg-gold/15 p-5 ${className ?? ''}`}>
      <div className="max-w-xl">
        <p className="font-semibold text-navy">Please accept our Code of Conduct</p>
        <p className="mt-1 text-sm text-navy/75">
          It sets out how everyone at Note by Note keeps lessons safe and friendly. It takes a few minutes to read.
        </p>
      </div>
      <Link
        href="/code-of-conduct#accept"
        className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"
      >
        Read and accept
      </Link>
    </div>
  );
}

type MyConsent = ConsentState & { ageGroup: string | null; guardianOnFile: string | null; canEmailGuardian: boolean };

export function ParentConsentCard({ className }: { className?: string }) {
  const [consent, setConsent] = useState<MyConsent | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'link' | 'email' | null>(null);

  useEffect(() => {
    api
      .get<{ data: MyConsent }>('/me/consent')
      .then((body) => setConsent(body.data))
      .catch(() => setConsent(null));
  }, []);

  if (!consent || consent.state !== 'needed') return null;
  const guardian = consent.guardianOnFile ?? 'your parent or guardian';

  async function makeLink() {
    setBusy('link');
    setError(null);
    setNotice(null);
    try {
      const body = await api.post<{ data: { token: string } }>('/me/consent/link');
      const url = `${window.location.origin}/parent-consent?t=${body.data.token}`;
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
        setNotice('Link copied. Send it to them by text or email. Any link you made before no longer works.');
      } catch {
        setNotice('Here’s the link. Copy it and send it to them by text or email.');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We couldn’t make a link. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function emailIt() {
    setBusy('email');
    setError(null);
    setNotice(null);
    try {
      const body = await api.post<{ data: { sent: boolean } }>('/me/consent/email');
      setNotice(body.data.sent ? `Sent to ${guardian}. Ask them to check their inbox.` : 'We couldn’t send the email. Copy the link instead.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We couldn’t send the email. Copy the link instead.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`rounded-2xl border border-navy/10 bg-white p-5 shadow-sm ${className ?? ''}`}>
      <p className="font-semibold text-navy">A parent or guardian needs to give consent</p>
      <p className="mt-1 max-w-xl text-sm text-navy/75">
        Students under 18 need consent before lessons start. Send {guardian} a private link to{' '}
        <Link href="/parent-consent" className="underline underline-offset-2">
          our consent page
        </Link>
        . It takes them a few minutes.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {consent.canEmailGuardian ? (
          <Button size="sm" disabled={busy !== null} onClick={emailIt}>
            {busy === 'email' ? 'Sending…' : `Email ${consent.guardianOnFile ?? 'them'}`}
          </Button>
        ) : null}
        <Button size="sm" variant={consent.canEmailGuardian ? 'secondary' : 'primary'} disabled={busy !== null} onClick={makeLink}>
          {busy === 'link' ? 'Making a link…' : 'Copy a link to send'}
        </Button>
      </div>
      {link ? (
        <input
          readOnly
          value={link}
          aria-label="Consent link"
          onFocus={(e) => e.target.select()}
          className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink-soft"
        />
      ) : null}
      {notice ? <p className="mt-2 text-sm text-ok">{notice}</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
