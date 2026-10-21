'use client';

// One editor for a mentor profile, used two ways:
//   - by staff (admin/tech) to create or edit any profile, including the
//     fields a mentor must not set on themselves: published, verified, screening
//   - by a mentor, from their dashboard, for their own profile
// The API enforces the same split; hiding the staff fields here is only so a
// mentor isn't shown controls that would be rejected.

import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, api } from '@/lib/api';
import type { MentorProfile, Options } from '@/lib/types';
import { Alert, Button, Spinner, cx } from './ui';
import { Field, TextArea, TextInput } from './ui/fields';

export type MentorProfileValues = {
  name: string;
  pronouns: string;
  location: string;
  timeZone: string;
  instruments: string[];
  languages: string[];
  experienceLevels: string[];
  ageGroups: string[];
  formats: string[];
  availability: { days: string[]; times: string[] };
  genres: string[];
  experienceHeadline: string;
  yearsTeaching: number | null;
  shortBio: string;
  about: string;
  acceptingStudents: boolean;
  // Staff only
  published?: boolean;
  verified?: boolean;
  screening?: { backgroundCheckCleared: boolean; childSafetyCertified: boolean; note: string };
};

function initialValues(profile: MentorProfile | null, staff: boolean): MentorProfileValues {
  return {
    name: profile?.name ?? '',
    pronouns: profile?.pronouns ?? '',
    location: profile?.location ?? '',
    timeZone: profile?.timeZone ?? 'America/Toronto',
    instruments: profile?.instruments ?? [],
    languages: profile?.languages ?? ['English'],
    experienceLevels: profile?.experienceLevels ?? [],
    ageGroups: profile?.ageGroups ?? [],
    formats: profile?.formats ?? ['One-on-one'],
    availability: { days: profile?.availability?.days ?? [], times: profile?.availability?.times ?? [] },
    genres: profile?.genres ?? [],
    experienceHeadline: profile?.experienceHeadline ?? '',
    yearsTeaching: profile?.yearsTeaching ?? null,
    shortBio: profile?.shortBio ?? '',
    about: profile?.about ?? '',
    acceptingStudents: profile?.acceptingStudents ?? true,
    ...(staff
      ? {
          published: profile?.published ?? false,
          verified: profile?.verified ?? false,
          screening: {
            backgroundCheckCleared: Boolean(profile?.screening?.backgroundCheckCleared),
            childSafetyCertified: Boolean(profile?.screening?.childSafetyCertified),
            note: profile?.screening?.note ?? '',
          },
        }
      : {}),
  };
}

/** Toggleable chips for a multi-choice field. */
export function Chips({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((entry) => entry !== option) : [...value, option])}
              className={cx(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft hover:border-navy/50',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Toggle({ label, help, checked, onChange }: { label: string; help?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 accent-accent" />
      <span>
        <span className="text-sm font-medium text-ink">{label}</span>
        {help ? <span className="block text-xs text-ink-faint">{help}</span> : null}
      </span>
    </label>
  );
}

export function MentorProfileForm({
  profile,
  staff,
  submitLabel = 'Save profile',
  onSave,
  extra,
}: {
  profile: MentorProfile | null;
  staff: boolean;
  submitLabel?: string;
  onSave: (values: MentorProfileValues) => Promise<void>;
  /** Rendered above the save button — e.g. the "link to account" field on create. */
  extra?: ReactNode;
}) {
  const [values, setValues] = useState(() => initialValues(profile, staff));
  const [options, setOptions] = useState<Options | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ data: Options }>('/options')
      .then((body) => setOptions(body.data))
      .catch(() => setError('We could not load the option lists.'));
  }, []);

  function set<K extends keyof MentorProfileValues>(key: K, value: MentorProfileValues[K]) {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (values.name.trim().length < 2) return setError('A name is required.');
    if (!values.instruments.length) return setError('Choose at least one instrument.');

    setBusy(true);
    try {
      await onSave({ ...values, name: values.name.trim() });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.details && typeof err.details === 'object') {
        const messages = Object.values(err.details as Record<string, unknown>).filter((v) => typeof v === 'string');
        setError(messages.length ? messages.join(' ') : err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'We could not save this profile.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (!options) return error ? <Alert>{error}</Alert> : <Spinner label="Loading the editor" />;

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      {error ? <Alert>{error}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          {({ id }) => <TextInput id={id} value={values.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label="Pronouns">
          {({ id }) => <TextInput id={id} value={values.pronouns} onChange={(e) => set('pronouns', e.target.value)} />}
        </Field>
        <Field label="Location" help="City or region, e.g. Toronto, ON">
          {({ id }) => <TextInput id={id} value={values.location} onChange={(e) => set('location', e.target.value)} />}
        </Field>
        <Field label="Time zone">
          {({ id }) => <TextInput id={id} value={values.timeZone} onChange={(e) => set('timeZone', e.target.value)} />}
        </Field>
        <Field label="Experience headline" help="Short, e.g. “Grade 8 RCM piano”">
          {({ id }) => (
            <TextInput id={id} value={values.experienceHeadline} onChange={(e) => set('experienceHeadline', e.target.value)} />
          )}
        </Field>
        <Field label="Years teaching">
          {({ id }) => (
            <TextInput
              id={id}
              type="number"
              min={0}
              value={values.yearsTeaching ?? ''}
              onChange={(e) => set('yearsTeaching', e.target.value === '' ? null : Number(e.target.value))}
            />
          )}
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <Chips label="Instruments" required options={options.instruments} value={values.instruments} onChange={(v) => set('instruments', v)} />
        <Chips label="Levels they teach" options={options.experienceLevels} value={values.experienceLevels} onChange={(v) => set('experienceLevels', v)} />
        <Chips label="Student ages" options={options.ageGroups} value={values.ageGroups} onChange={(v) => set('ageGroups', v)} />
        <Chips label="Languages" options={options.languages} value={values.languages} onChange={(v) => set('languages', v)} />
        <Chips label="Lesson formats" options={options.formats} value={values.formats} onChange={(v) => set('formats', v)} />
        <Chips
          label="Available days"
          options={options.availabilityDays}
          value={values.availability.days}
          onChange={(v) => set('availability', { ...values.availability, days: v })}
        />
        <Chips
          label="Available times"
          options={options.availabilityTimes}
          value={values.availability.times}
          onChange={(v) => set('availability', { ...values.availability, times: v })}
        />
        <Chips label="Styles" options={options.genres} value={values.genres} onChange={(v) => set('genres', v)} />
      </section>

      <section className="flex flex-col gap-4">
        <Field label="Short bio" help="Shown on the mentor card. Up to 400 characters.">
          {({ id }) => (
            <TextArea id={id} rows={3} maxLength={400} value={values.shortBio} onChange={(e) => set('shortBio', e.target.value)} />
          )}
        </Field>
        <Field label="About">
          {({ id }) => <TextArea id={id} rows={5} value={values.about} onChange={(e) => set('about', e.target.value)} />}
        </Field>
        <Toggle
          label="Accepting new students"
          checked={values.acceptingStudents}
          onChange={(v) => set('acceptingStudents', v)}
        />
      </section>

      {staff && values.screening ? (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-5">
          <h3 className="text-sm font-semibold text-ink">Staff only</h3>
          <Toggle
            label="Published"
            help="Shown publicly on Find a Mentor. New profiles start unpublished."
            checked={Boolean(values.published)}
            onChange={(v) => set('published', v)}
          />
          <Toggle label="Verified" help="Shows the verified badge." checked={Boolean(values.verified)} onChange={(v) => set('verified', v)} />
          <Toggle
            label="Background check cleared"
            checked={values.screening.backgroundCheckCleared}
            onChange={(v) => set('screening', { ...values.screening!, backgroundCheckCleared: v })}
          />
          <Toggle
            label="Child safety training completed"
            checked={values.screening.childSafetyCertified}
            onChange={(v) => set('screening', { ...values.screening!, childSafetyCertified: v })}
          />
          <Field label="Screening note" help="Internal.">
            {({ id }) => (
              <TextArea
                id={id}
                rows={2}
                value={values.screening!.note}
                onChange={(e) => set('screening', { ...values.screening!, note: e.target.value })}
              />
            )}
          </Field>
        </section>
      ) : null}

      {extra}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {saved ? <span className="text-sm text-ok">Saved.</span> : null}
      </div>
    </form>
  );
}
