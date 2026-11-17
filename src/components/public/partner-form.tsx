'use client';

// The Partners page's sign-up form, for schools, music programs, music
// teachers and community organizations. Like the contact form, it goes to
// Formspree, which forwards it to the team's inbox; nothing is stored by our
// API. It only appears once SITE.formspreeFormId is set.

import { useState, type FormEvent } from 'react';
import { SITE } from '@/lib/site';
import { Button } from '../ui';
import { ChoiceGroup, Field, Select, TextArea, TextInput } from '../ui/fields';

const KINDS = ['School', 'Music program or organization', 'Music teacher or studio', 'Community organization', 'Something else'];
const WAYS = [
  'Tell students and families about free lessons',
  'Find students who could mentor',
  'Add our school to the student application',
  'Help students with volunteer hours',
  'Co-host an information session',
  'Share teaching resources with mentors',
];
const MAX_MESSAGE = 2000;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function PartnerForm() {
  const [kind, setKind] = useState('');
  const [organization, setOrganization] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [place, setPlace] = useState('');
  const [ways, setWays] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!SITE.formspreeFormId) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const response = await fetch(`https://formspree.io/f/${SITE.formspreeFormId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Schools and partners',
          kind,
          organization: organization.trim(),
          name: name.trim(),
          role: role.trim(),
          email: email.trim(),
          place: place.trim(),
          ways: ways.join('; ') || 'Not sure yet',
          message: message.trim(),
          _subject: `Note by Note partner sign-up: ${organization.trim()} (${kind})`,
          // Formspree's spam trap: people never see or fill this field.
          _gotcha: trap,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { errors?: { message: string }[] } | null;
        throw new Error(body?.errors?.map((entry) => entry.message).join(' ') || 'That didn’t send.');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'That didn’t send.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-navy/5" role="status">
        <p className="font-display text-2xl font-bold text-navy">Thanks for reaching out!</p>
        <p className="mt-2 text-navy/70">
          Someone from the team will reply to {email.trim() || 'your email'} to set up a call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Become a partner</h2>
        <p className="mt-1 text-sm text-navy/70">Tell us a little about you. We’ll reply by email to set up a call.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="You are a…" required>
          {({ id }) => (
            <Select id={id} required value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">Choose one…</option>
              {KINDS.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={kind === 'Music teacher or studio' ? 'Studio or school name' : 'Name of your school or organization'} required>
          {({ id }) => (
            <TextInput id={id} required maxLength={160} autoComplete="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          )}
        </Field>
        <Field label="Your name" required>
          {({ id }) => <TextInput id={id} required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Your role">
          {({ id }) => (
            <TextInput id={id} maxLength={120} placeholder="e.g. music teacher" value={role} onChange={(e) => setRole(e.target.value)} />
          )}
        </Field>
        <Field label="Your email" required>
          {({ id }) => (
            <TextInput id={id} type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Field>
        <Field label="City or area">
          {({ id }) => <TextInput id={id} maxLength={120} placeholder="e.g. Toronto" value={place} onChange={(e) => setPlace(e.target.value)} />}
        </Field>
      </div>

      <ChoiceGroup label="How would you like to work together?" help="Pick any that interest you. Not sure yet is fine too.">
        <div className="grid gap-2 sm:grid-cols-2">
          {WAYS.map((way) => (
            <label key={way} className="flex items-start gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={ways.includes(way)}
                onChange={(e) => setWays(e.target.checked ? [...ways, way] : ways.filter((entry) => entry !== way))}
                className="mt-0.5 size-4 shrink-0 accent-navy"
              />
              {way}
            </label>
          ))}
        </div>
      </ChoiceGroup>

      <Field label="Anything else we should know?">
        {({ id }) => (
          <>
            <TextArea id={id} rows={4} maxLength={MAX_MESSAGE} value={message} onChange={(e) => setMessage(e.target.value)} />
            {message.length > MAX_MESSAGE * 0.9 ? (
              <p className="text-right text-xs text-warn">
                {message.length} / {MAX_MESSAGE}
              </p>
            ) : null}
          </>
        )}
      </Field>

      {/* Hidden from people; bots that fill every field get filtered out. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
      />

      {status === 'error' ? (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error} Please try again in a moment.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send'}
        </Button>
        <p className="text-xs text-navy/60">Sent through Formspree to the Note by Note team.</p>
      </div>
    </form>
  );
}
