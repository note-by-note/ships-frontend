'use client';

// The consent form at the end of the parent consent page. It only appears
// when the page is opened from the private link a student sends (or the site
// emails) to their parent: `/parent-consent?t=…`. No account is needed; the
// link is the key. Without one, the page explains how to get it. The words
// follow the page's language; the answers sent are the same in every language.

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { CONSENT_FORM, type ConsentFormText } from '@/content/policies/forms';
import { ApiError, api } from '@/lib/api';
import { policyLocale, type PolicyLanguage } from '@/lib/policy-languages';
import { Alert, Button, Spinner } from './ui';
import { Field, Select, TextInput } from './ui/fields';

interface ConsentLink {
  studentFirstName: string;
  status: 'pending' | 'given';
  givenAt: string | null;
  guardianName: string;
  guardianEmail: string;
}

const RELATIONSHIPS = ['Parent', 'Legal guardian', 'Other caregiver'] as const;
const box = 'scroll-mt-24 rounded-2xl border border-navy/10 bg-cream/60 p-6 md:p-8';

function formatDate(iso: string | null, lang: PolicyLanguage) {
  return iso ? new Date(iso).toLocaleDateString(policyLocale(lang), { dateStyle: 'long' }) : '';
}

export function ParentConsentForm({ lang = 'en' }: { lang?: PolicyLanguage }) {
  const t = CONSENT_FORM[lang];
  const token = useSearchParams().get('t');
  const [link, setLink] = useState<ConsentLink | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<{ data: ConsentLink }>(`/consent/${encodeURIComponent(token)}`, { anonymous: true })
      .then((body) => setLink(body.data))
      .catch((err: unknown) => setProblem(err instanceof ApiError ? err.message : t.openFailed));
  }, [token, t]);

  if (!token) {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">{t.howTitle}</h2>
        <p className="mt-2 leading-relaxed text-navy/80">{t.howBody}</p>
      </section>
    );
  }

  if (problem) {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">{t.invalidTitle}</h2>
        <p className="mt-2 leading-relaxed text-navy/80">{problem}</p>
      </section>
    );
  }

  if (!link) return <Spinner label={t.opening} />;

  if (link.status === 'given') {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">{t.givenTitle}</h2>
        <p className="mt-2 leading-relaxed text-navy/80">
          {t.givenBody(link.guardianName, link.studentFirstName || t.yourChild, formatDate(link.givenAt, lang))}
        </p>
      </section>
    );
  }

  return <PendingForm token={token} link={link} lang={lang} t={t} onGiven={(givenAt, guardianName) => setLink({ ...link, status: 'given', givenAt, guardianName })} />;
}

function PendingForm({
  token,
  link,
  lang,
  t,
  onGiven,
}: {
  token: string;
  link: ConsentLink;
  lang: PolicyLanguage;
  t: ConsentFormText;
  onGiven: (givenAt: string, guardianName: string) => void;
}) {
  const [guardianName, setGuardianName] = useState(link.guardianName);
  const [guardianEmail, setGuardianEmail] = useState(link.guardianEmail);
  const [relationship, setRelationship] = useState('');
  const [agree, setAgree] = useState({ guardian: false, lessons: false, policies: false });
  const [signedName, setSignedName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const student = link.studentFirstName || t.yourChild;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!agree.guardian || !agree.lessons || !agree.policies) return setError(t.tickAll);
    setBusy(true);
    try {
      const body = await api.post<{ data: { givenAt: string } }>(
        `/consent/${encodeURIComponent(token)}`,
        // The language they read it in goes on the record with their answers.
        { guardianName, guardianEmail, relationship, signedName, agree, language: lang },
        { anonymous: true },
      );
      onGiven(body.data.givenAt, guardianName.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.notSaved);
      setBusy(false);
    }
  }

  const tick = (key: keyof typeof agree, label: string) => (
    <label className="flex items-start gap-3 text-navy/90">
      <input
        type="checkbox"
        checked={agree[key]}
        onChange={(e) => setAgree({ ...agree, [key]: e.target.checked })}
        className="mt-1 size-4 shrink-0 accent-navy"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <section id="give-consent" className={box}>
      <h2 className="font-display text-2xl font-bold">{t.formTitle(student)}</h2>
      <p className="mt-2 leading-relaxed text-navy/80">{t.formIntro}</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.fullName} required>
            {({ id }) => (
              <TextInput id={id} autoComplete="name" maxLength={120} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            )}
          </Field>
          <Field label={t.email} required>
            {({ id }) => (
              <TextInput id={id} type="email" autoComplete="email" maxLength={254} value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
            )}
          </Field>
        </div>
        <Field label={t.relationship(student)} required>
          {({ id }) => (
            <Select id={id} value={relationship} onChange={(e) => setRelationship(e.target.value)} className="max-w-xs">
              <option value="">{t.choose}</option>
              {RELATIONSHIPS.map((option) => (
                <option key={option} value={option}>
                  {t.relationships[option]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-ink">{t.confirmLegend}</legend>
          {tick('guardian', t.tickGuardian(student))}
          {tick('lessons', t.tickLessons(student))}
          {tick('policies', t.tickPolicies)}
        </fieldset>

        <Field label={t.signLabel} required help={t.signHelp}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              maxLength={120}
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="max-w-sm"
            />
          )}
        </Field>

        {error ? <Alert>{error}</Alert> : null}
        <div>
          <Button type="submit" disabled={busy}>
            {busy ? t.saving : t.submit}
          </Button>
        </div>
      </form>
    </section>
  );
}
