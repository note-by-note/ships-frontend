'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Alert, Spinner } from '@/components/ui';
import { ApiError, api } from '@/lib/api';

interface Settings {
  email: string;
  absenceEmails: boolean;
  messageEmails: boolean;
  emailEnabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<{ data: Settings }>('/me/settings')
      .then((body) => setSettings(body.data))
      .catch(() => setError('We could not load your settings.'));
  }, []);

  async function update(changes: Partial<Settings>) {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...changes }); // feels instant; rolled back on failure
    setSaved(false);
    setError(null);
    try {
      const body = await api.patch<{ data: Settings }>('/me/settings', changes);
      setSettings(body.data);
      setSaved(true);
    } catch (err) {
      setSettings(previous);
      setError(err instanceof ApiError ? err.message : 'That setting did not save.');
    }
  }

  const other = user?.role === 'mentor' ? 'a student' : 'your mentor';

  return (
    <>
      <DashboardHeading title="Settings" description="Choose which emails you get from Note by Note." />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {!settings && !error ? <Spinner /> : null}

      {settings ? (
        <Panel title="Email notifications">
          <p className="mb-5 text-sm text-ink-soft">
            Sent to <strong className="text-ink">{settings.email}</strong>.
          </p>

          <div className="flex flex-col gap-3">
            <EmailSwitch
              title="Missed lessons"
              body={`Email me when ${other} says they can’t make a lesson, or that they can make it after all.`}
              checked={settings.absenceEmails}
              onChange={(value) => update({ absenceEmails: value })}
            />
            <EmailSwitch
              title="New messages"
              body={`Email me when ${other} sends a message I haven’t read. The email doesn’t include the message itself.`}
              checked={settings.messageEmails}
              onChange={(value) => update({ messageEmails: value })}
            />
          </div>

          {saved ? <p className="mt-3 text-sm text-ok">Saved.</p> : null}

          {!settings.emailEnabled ? (
            <p className="mt-4 rounded-lg bg-warn-soft p-3 text-sm text-warn">
              Note: the site isn’t sending emails yet. Your choice is saved and will apply once email is set up. You’ll
              still see notices on your dashboard.
            </p>
          ) : null}
        </Panel>
      ) : null}
    </>
  );
}

function EmailSwitch({
  title,
  body,
  checked,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-6 rounded-xl border border-line p-4">
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="block text-sm text-ink-soft">{body}</span>
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-sage peer-focus-visible:ring-2 peer-focus-visible:ring-navy" />
        <span className="absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
