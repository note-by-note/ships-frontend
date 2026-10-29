'use client';

// The consent form at the end of the parent consent page. It only appears
// when the page is opened from the private link a student sends (or the site
// emails) to their parent: `/parent-consent?t=…`. No account is needed; the
// link is the key. Without one, the page explains how to get it.

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, api } from '@/lib/api';
import { Alert, Button, Spinner } from './ui';
import { Field, Select, TextInput } from './ui/fields';

interface ConsentLink {
  studentFirstName: string;
  status: 'pending' | 'given';
  givenAt: string | null;
  guardianName: string;
  guardianEmail: string;
}

const RELATIONSHIPS = ['Parent', 'Legal guardian', 'Other caregiver'];
const box = 'scroll-mt-24 rounded-2xl border border-navy/10 bg-cream/60 p-6 md:p-8';

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' }) : '';
}

export function ParentConsentForm() {
  const token = useSearchParams().get('t');
  const [link, setLink] = useState<ConsentLink | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<{ data: ConsentLink }>(`/consent/${encodeURIComponent(token)}`, { anonymous: true })
      .then((body) => setLink(body.data))
      .catch((err: unknown) => setProblem(err instanceof ApiError ? err.message : 'We couldn’t open this link. Please try again.'));
  }, [token]);

  if (!token) {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">How to give consent</h2>
        <p className="mt-2 leading-relaxed text-navy/80">
          Your child can send you a private link from their Note by Note dashboard, or we email it to the address on their
          application. Open that link and the consent form appears here. If you manage your child’s account yourself, the
          link is on their dashboard.
        </p>
      </section>
    );
  }

  if (problem) {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">This link doesn’t work</h2>
        <p className="mt-2 leading-relaxed text-navy/80">{problem}</p>
      </section>
    );
  }

  if (!link) return <Spinner label="Opening the consent form" />;

  if (link.status === 'given') {
    return (
      <section id="give-consent" className={box}>
        <h2 className="font-display text-2xl font-bold">Consent given</h2>
        <p className="mt-2 leading-relaxed text-navy/80">
          {link.guardianName ? `${link.guardianName} gave` : 'A parent or guardian gave'} consent for {link.studentFirstName}
          {link.givenAt ? ` on ${formatDate(link.givenAt)}` : ''}. Thank you.
        </p>
      </section>
    );
  }

  return <PendingForm token={token} link={link} onGiven={(givenAt, guardianName) => setLink({ ...link, status: 'given', givenAt, guardianName })} />;
}

function PendingForm({
  token,
  link,
  onGiven,
}: {
  token: string;
  link: ConsentLink;
  onGiven: (givenAt: string, guardianName: string) => void;
}) {
  const [guardianName, setGuardianName] = useState(link.guardianName);
  const [guardianEmail, setGuardianEmail] = useState(link.guardianEmail);
  const [relationship, setRelationship] = useState('');
  const [agree, setAgree] = useState({ guardian: false, lessons: false, policies: false });
  const [signedName, setSignedName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const student = link.studentFirstName || 'your child';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!agree.guardian || !agree.lessons || !agree.policies) return setError('Please tick each box to give consent.');
    setBusy(true);
    try {
      const body = await api.post<{ data: { givenAt: string } }>(
        `/consent/${encodeURIComponent(token)}`,
        { guardianName, guardianEmail, relationship, signedName, agree },
        { anonymous: true },
      );
      onGiven(body.data.givenAt, guardianName.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save. Please try again.');
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
      <h2 className="font-display text-2xl font-bold">Give consent for {student}</h2>
      <p className="mt-2 leading-relaxed text-navy/80">
        Please check your details, tick each box and type your name. We keep a record of what you agreed to and when.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your full name" required>
            {({ id }) => (
              <TextInput id={id} autoComplete="name" maxLength={120} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            )}
          </Field>
          <Field label="Your email" required>
            {({ id }) => (
              <TextInput id={id} type="email" autoComplete="email" maxLength={254} value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
            )}
          </Field>
        </div>
        <Field label={`Your relationship to ${student}`} required>
          {({ id }) => (
            <Select id={id} value={relationship} onChange={(e) => setRelationship(e.target.value)} className="max-w-xs">
              <option value="">Choose…</option>
              {RELATIONSHIPS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-ink">I confirm that</legend>
          {tick('guardian', `I am ${student}’s parent or legal guardian, or the caregiver responsible for them.`)}
          {tick('lessons', `${student} may take free online lessons with a volunteer mentor and use the Note by Note website as described above.`)}
          {tick('policies', 'I’ve read the Code of Conduct and Privacy Policy. For a child under 13, an adult will be nearby during lessons.')}
        </fieldset>

        <Field label="Type your full name to sign" required help="This counts as your signature.">
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
            {busy ? 'Saving…' : 'Give consent'}
          </Button>
        </div>
      </form>
    </section>
  );
}
