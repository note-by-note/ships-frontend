'use client';

// The contact page's message form. Messages go to Formspree, which forwards
// them to the team's inbox; nothing is stored by our API. It only appears once
// SITE.formspreeFormId is set, so the page never shows a form that goes nowhere.

import { useState, type FormEvent } from 'react';
import { SITE } from '@/lib/site';
import { Button } from './ui';
import { Field, Select, TextArea, TextInput } from './ui/fields';

const TOPICS = ['Lessons', 'Mentoring', 'Volunteering', 'Schools and partners', 'My application', 'Something else'];
const MAX_MESSAGE = 2000;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
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
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
          _subject: `Note by Note contact form: ${topic || 'General'}`,
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
        <p className="font-display text-2xl font-bold text-navy">Message sent. Thank you!</p>
        <p className="mt-2 text-navy/70">Someone from the team will reply to {email.trim() || 'your email'}.</p>
        <button
          type="button"
          onClick={() => {
            setMessage('');
            setStatus('idle');
          }}
          className="mt-6 text-sm font-semibold text-navy underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Send us a message</h2>
        <p className="mt-1 text-sm text-navy/70">We’ll reply to the email you give here.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          {({ id }) => <TextInput id={id} required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Your email" required>
          {({ id }) => (
            <TextInput id={id} type="email" required maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Field>
      </div>

      <Field label="What it’s about">
        {({ id }) => (
          <Select id={id} value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Choose one…</option>
            {TOPICS.map((entry) => (
              <option key={entry}>{entry}</option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Message" required>
        {({ id }) => (
          <>
            <TextArea id={id} required rows={6} maxLength={MAX_MESSAGE} value={message} onChange={(e) => setMessage(e.target.value)} />
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
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-xs text-navy/60">Sent through Formspree to the Note by Note team.</p>
      </div>
    </form>
  );
}
