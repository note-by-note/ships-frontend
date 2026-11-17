'use client';

// "Sync with your calendar": a private feed address that Google Calendar,
// Outlook, Apple Calendar and Notion Calendar subscribe to. The address is
// made the first time this opens; making a new one stops the old one working.

import { useState } from 'react';
import { ApiError, api } from '@/lib/api';
import { feedUrl, googleSubscribeUrl, webcalUrl } from '@/lib/calendar';
import { Alert, Button } from '../ui';

const STEPS: { app: string; steps: string[] }[] = [
  {
    app: 'Google Calendar',
    steps: [
      'Press “Add to Google Calendar” above, then “Add”.',
      'Or on a computer: open Google Calendar, press + next to “Other calendars”, choose “From URL” and paste the address.',
    ],
  },
  {
    app: 'Outlook',
    steps: [
      'Outlook on the web: Calendar → Add calendar → Subscribe from web, paste the address and press Import.',
      'Outlook on Windows or Mac: press “Open in my calendar app” above.',
    ],
  },
  {
    app: 'Apple Calendar (iPhone, iPad, Mac)',
    steps: [
      'Press “Open in my calendar app” above and choose Subscribe.',
      'Or on iPhone: Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar, and paste the address.',
    ],
  },
  {
    app: 'Notion Calendar',
    steps: [
      'Notion Calendar shows the calendars from the Google account you connected to it. Add the address to that Google Calendar first (see above).',
      'Then in Notion Calendar, turn on “Note by Note” in the calendar list on the left.',
    ],
  },
];

export function CalendarSync() {
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load(reset = false) {
    setBusy(true);
    setError(null);
    try {
      const body = reset
        ? await api.post<{ data: { token: string } }>('/calendar/link/reset')
        : await api.get<{ data: { token: string } }>('/calendar/link');
      setToken(body.data.token);
      setCopied(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We couldn’t make your calendar address. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(feedUrl(token));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 sm:p-6" aria-labelledby="calendar-sync">
      <h2 id="calendar-sync" className="font-display text-xl font-bold text-navy">
        Sync with your calendar app
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        See your lessons and important dates in Google Calendar, Outlook, Apple Calendar or Notion Calendar. New lessons,
        time changes and cancellations show up there by themselves. Calendar apps check for changes every few hours, so
        it can take a while.
      </p>

      {error ? <div className="mt-3"><Alert>{error}</Alert></div> : null}

      {!token ? (
        <Button
          className="mt-4"
          disabled={busy}
          onClick={() => {
            setOpen(true);
            void load();
          }}
        >
          {busy ? 'One moment…' : 'Set up calendar sync'}
        </Button>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <a
              href={googleSubscribeUrl(token)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
            >
              Add to Google Calendar
            </a>
            <a href={webcalUrl(token)} className="rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-navy hover:bg-paper">
              Open in my calendar app
            </a>
          </div>

          <div>
            <label htmlFor="calendar-address" className="text-sm font-semibold text-navy">
              Your calendar address
            </label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <input
                id="calendar-address"
                readOnly
                value={feedUrl(token)}
                onFocus={(event) => event.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-line-strong bg-paper px-3 py-2 font-mono text-xs text-ink"
              />
              <Button variant="secondary" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">
              Keep this private: anyone with it can see your lesson times. Shared it by mistake?{' '}
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm('Make a new address? The old one stops working, so you’ll need to add the new one to your calendar app again.')) {
                    void load(true);
                  }
                }}
                className="font-semibold text-coral underline"
              >
                Make a new one
              </button>
              .
            </p>
          </div>

          <details open={open} className="rounded-xl bg-paper p-4" onToggle={(event) => setOpen(event.currentTarget.open)}>
            <summary className="cursor-pointer font-semibold text-navy">How to add it to each app</summary>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              {STEPS.map((entry) => (
                <div key={entry.app}>
                  <dt className="font-semibold text-navy">{entry.app}</dt>
                  {entry.steps.map((step) => (
                    <dd key={step} className="mt-0.5 text-ink-soft">
                      {step}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </details>
        </div>
      )}
    </section>
  );
}
