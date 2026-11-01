'use client';

// A mentor editing their own page, with a live preview beside it.
//
// Built for someone filling it in for the first time: short numbered steps,
// a prompt in every box, nothing required except a name and an instrument,
// and empty sections simply stay off the public page. Availability has its
// own page (the weekly grid), linked from the last step.
//
// Staff keep the full editor in the staff area (MentorProfileForm), which
// also has the fields a mentor can't set on themselves.

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, api } from '@/lib/api';
import { zoneLabel } from '@/lib/schedule';
import type { MentorProfile, Options, PageTheme, PublicMentor, ScheduleDay } from '@/lib/types';
import { Chips, Toggle } from './mentor-profile-form';
import { MentorPage, OpenTimes, PAGE_THEMES } from './mentor-page';
import { PhotoUploader } from './photo-uploader';
import { Alert, Button, Spinner, cx } from './ui';
import { Field, Select, TextArea, TextInput } from './ui/fields';

type OwnProfile = MentorProfile & { schedule?: ScheduleDay[] };

interface Draft {
  pageTheme: PageTheme;
  name: string;
  pronouns: string;
  experienceHeadline: string;
  yearsTeaching: number | null;
  location: string;
  timeZone: string;
  instruments: string[];
  experienceLevels: string[];
  ageGroups: string[];
  formats: string[];
  languages: string[];
  acceptingStudents: boolean;
  shortBio: string;
  about: string;
  teachingPhilosophy: string;
  whatToExpect: string[];
  genres: string[];
  favoriteMusic: string;
  sampleUrl: string;
}

const MAX_FIRST_LESSON_POINTS = 5;

const TIME_ZONES = [
  'America/St_Johns',
  'America/Halifax',
  'America/Toronto',
  'America/New_York',
  'America/Winnipeg',
  'America/Chicago',
  'America/Regina',
  'America/Edmonton',
  'America/Denver',
  'America/Phoenix',
  'America/Vancouver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
];

function draftFrom(profile: OwnProfile): Draft {
  return {
    pageTheme: profile.pageTheme ?? 'sky',
    name: profile.name ?? '',
    pronouns: profile.pronouns ?? '',
    experienceHeadline: profile.experienceHeadline ?? '',
    yearsTeaching: profile.yearsTeaching ?? null,
    location: profile.location ?? '',
    timeZone: profile.timeZone ?? 'America/Toronto',
    instruments: profile.instruments ?? [],
    experienceLevels: profile.experienceLevels ?? [],
    ageGroups: profile.ageGroups ?? [],
    formats: profile.formats ?? [],
    languages: profile.languages ?? [],
    acceptingStudents: profile.acceptingStudents ?? true,
    shortBio: profile.shortBio ?? '',
    about: profile.about ?? '',
    teachingPhilosophy: profile.teachingPhilosophy ?? '',
    whatToExpect: profile.whatToExpect?.length ? profile.whatToExpect : [''],
    genres: profile.genres ?? [],
    favoriteMusic: profile.favoriteMusic ?? '',
    sampleUrl: profile.sampleUrl ?? '',
  };
}

/** What gets saved: trimmed, with the blank first-lesson rows dropped. */
function payloadOf(draft: Draft) {
  return {
    ...draft,
    name: draft.name.trim(),
    pronouns: draft.pronouns.trim(),
    experienceHeadline: draft.experienceHeadline.trim(),
    location: draft.location.trim(),
    shortBio: draft.shortBio.trim(),
    about: draft.about.trim(),
    teachingPhilosophy: draft.teachingPhilosophy.trim(),
    whatToExpect: draft.whatToExpect.map((item) => item.trim()).filter(Boolean),
    favoriteMusic: draft.favoriteMusic.trim(),
    sampleUrl: draft.sampleUrl.trim(),
  };
}

function problemWith(draft: Draft): string | null {
  if (draft.name.trim().length < 2) return 'Add your name in step 3.';
  if (!draft.instruments.length) return 'Choose at least one instrument in step 4.';
  const url = draft.sampleUrl.trim();
  if (url && !/^https:\/\/\S+$/.test(url)) return 'The link in step 7 needs to start with https://';
  return null;
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <p className={cx('text-right text-xs', value.length > max * 0.9 ? 'text-warn' : 'text-ink-faint')}>
      {value.length} / {max}
    </p>
  );
}

function Step({ number, title, intro, children }: { number: number; title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(30,42,68,0.06)]">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold text-navy">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy font-sans text-sm text-cream">
          {number}
        </span>
        {title}
      </h2>
      {intro ? <p className="mt-2 text-sm text-ink-soft">{intro}</p> : null}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function MentorPageEditor() {
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [options, setOptions] = useState<Options | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    Promise.all([api.get<{ data: OwnProfile }>('/me/mentor-profile'), api.get<{ data: Options }>('/options')])
      .then(([own, opts]) => {
        setProfile(own.data);
        setDraft(draftFrom(own.data));
        setOptions(opts.data);
      })
      .catch((err: unknown) => setLoadError(err instanceof ApiError ? err.message : 'We couldn’t load your page.'));
  }, []);

  const dirty = useMemo(
    () => Boolean(profile && draft && JSON.stringify(payloadOf(draft)) !== JSON.stringify(payloadOf(draftFrom(profile)))),
    [profile, draft],
  );

  // Don't lose an afternoon of writing to a closed tab.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loadError) return <Alert>{loadError}</Alert>;
  if (!profile || !draft || !options) return <Spinner label="Loading your page" />;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setJustSaved(false);
    setSaveError(null);
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    if (!draft || !profile) return;
    const problem = problemWith(draft);
    if (problem) return setSaveError(problem);

    setBusy(true);
    setSaveError(null);
    try {
      const body = await api.patch<{ data: OwnProfile }>(`/mentors/${profile.id}`, payloadOf(draft));
      const next = { ...profile, ...body.data };
      setProfile(next);
      setDraft(draftFrom(next));
      setJustSaved(true);
    } catch (err) {
      const details =
        err instanceof ApiError && err.details && typeof err.details === 'object'
          ? Object.values(err.details as Record<string, unknown>).filter((value): value is string => typeof value === 'string')
          : [];
      setSaveError(details.length ? details.join(' ') : err instanceof ApiError ? err.message : 'We couldn’t save your page.');
    } finally {
      setBusy(false);
    }
  }

  const preview: PublicMentor = {
    ...profile,
    ...payloadOf(draft),
    yearsTeaching: draft.yearsTeaching ?? undefined,
    openSchedule: profile.schedule ?? [],
    reviews: [],
  };
  const zones = TIME_ZONES.includes(draft.timeZone) ? TIME_ZONES : [draft.timeZone, ...TIME_ZONES];
  const pageHref = `/find-a-mentor/${profile.slug}`;

  return (
    <div className="pb-28">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-ink-soft">
          Fill in as much or as little as you like. Sections you leave empty stay off your page.
          {profile.published || profile.isTest ? null : ' Students will see it once staff publish your profile.'}
        </p>
        <Link
          href={pageHref}
          target="_blank"
          className="rounded-full border-2 border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
        >
          Open my page
        </Link>
      </div>

      <div role="tablist" aria-label="Editor view" className="mb-6 inline-flex rounded-full bg-white p-1 shadow-sm xl:hidden">
        {(['edit', 'preview'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            onClick={() => setView(option)}
            className={cx(
              'rounded-full px-5 py-2 text-sm font-semibold',
              view === option ? 'bg-navy text-cream' : 'text-navy/70 hover:text-navy',
            )}
          >
            {option === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={cx('flex flex-col gap-6', view === 'preview' && 'hidden xl:flex')}>
          <Step number={1} title="Pick a colour" intro="Sets the colour of the top of your page.">
            <div role="radiogroup" aria-label="Page colour" className="flex flex-wrap gap-3">
              {(Object.keys(PAGE_THEMES) as PageTheme[]).map((key) => {
                const on = draft.pageTheme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set('pageTheme', key)}
                    className={cx(
                      'flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs font-semibold text-navy',
                      on ? 'ring-2 ring-navy' : 'hover:bg-paper',
                    )}
                  >
                    <span className={cx('size-12 rounded-full ring-1 ring-navy/10', PAGE_THEMES[key].band)} />
                    {PAGE_THEMES[key].label}
                  </button>
                );
              })}
            </div>
          </Step>

          <Step number={2} title="Your photo">
            <PhotoUploader
              mentorId={profile.id}
              name={draft.name || profile.name}
              state={{
                photoPath: profile.photoPath ?? null,
                pendingPhoto: Boolean(profile.pendingPhoto),
                photoDeclinedReason: profile.photoDeclinedReason ?? null,
              }}
              onChange={(next) => setProfile((current) => (current ? { ...current, ...next } : current))}
            />
          </Step>

          <Step number={3} title="The basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required>
                {({ id }) => <TextInput id={id} value={draft.name} onChange={(e) => set('name', e.target.value)} />}
              </Field>
              <Field label="Pronouns">
                {({ id }) => (
                  <TextInput id={id} value={draft.pronouns} placeholder="e.g. she/her" onChange={(e) => set('pronouns', e.target.value)} />
                )}
              </Field>
            </div>
            <Field label="One line about your playing" help="Shown under your name.">
              {({ id }) => (
                <TextInput
                  id={id}
                  maxLength={120}
                  value={draft.experienceHeadline}
                  placeholder="e.g. Grade 8 piano, 4 years in the school jazz band"
                  onChange={(e) => set('experienceHeadline', e.target.value)}
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Years teaching">
                {({ id }) => (
                  <TextInput
                    id={id}
                    type="number"
                    min={0}
                    max={80}
                    value={draft.yearsTeaching ?? ''}
                    onChange={(e) => set('yearsTeaching', e.target.value === '' ? null : Number(e.target.value))}
                  />
                )}
              </Field>
              <Field label="Time zone" required>
                {({ id }) => (
                  <Select id={id} value={draft.timeZone} onChange={(e) => set('timeZone', e.target.value)}>
                    {zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zoneLabel(zone)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Field label="Where you're based" help="City or region. Leave it blank if you'd rather not say.">
              {({ id }) => <TextInput id={id} value={draft.location} onChange={(e) => set('location', e.target.value)} />}
            </Field>
          </Step>

          <Step number={4} title="What you teach" intro="Tap to select. Tap again to remove.">
            <Chips label="Instruments" required options={options.instruments} value={draft.instruments} onChange={(v) => set('instruments', v)} />
            <Chips label="Levels" options={options.experienceLevels} value={draft.experienceLevels} onChange={(v) => set('experienceLevels', v)} />
            <Chips label="Student ages" options={options.ageGroups} value={draft.ageGroups} onChange={(v) => set('ageGroups', v)} />
            <Chips label="Languages you can teach in" options={options.languages} value={draft.languages} onChange={(v) => set('languages', v)} />
            <Chips label="Lesson types" options={options.formats} value={draft.formats} onChange={(v) => set('formats', v)} />
            <Toggle
              label="I'm taking new students"
              help="Turn this off when you're full. Your page stays up, but students can't apply to you."
              checked={draft.acceptingStudents}
              onChange={(v) => set('acceptingStudents', v)}
            />
          </Step>

          <Step number={5} title="Your story" intro="Write the way you'd talk to a new student. A few sentences is plenty.">
            <Field label="Card blurb" help="The short quote on your card in Find a Mentor.">
              {({ id }) => (
                <>
                  <TextArea
                    id={id}
                    rows={2}
                    maxLength={400}
                    value={draft.shortBio}
                    placeholder="e.g. I love helping beginners play their first full song."
                    onChange={(e) => set('shortBio', e.target.value)}
                  />
                  <Counter value={draft.shortBio} max={400} />
                </>
              )}
            </Field>
            <Field label="About me">
              {({ id }) => (
                <>
                  <TextArea
                    id={id}
                    rows={5}
                    maxLength={2000}
                    value={draft.about}
                    placeholder="How did you get into music? What do you enjoy playing? What else are you into?"
                    onChange={(e) => set('about', e.target.value)}
                  />
                  <Counter value={draft.about} max={2000} />
                </>
              )}
            </Field>
            <Field label="How I teach">
              {({ id }) => (
                <>
                  <TextArea
                    id={id}
                    rows={4}
                    maxLength={1500}
                    value={draft.teachingPhilosophy}
                    placeholder="What does a lesson with you feel like? Do you start with songs, technique, theory, games?"
                    onChange={(e) => set('teachingPhilosophy', e.target.value)}
                  />
                  <Counter value={draft.teachingPhilosophy} max={1500} />
                </>
              )}
            </Field>
          </Step>

          <Step number={6} title="Your first lesson" intro="A few short points so a nervous beginner knows what to expect.">
            <ol className="flex flex-col gap-2">
              {draft.whatToExpect.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-sm font-semibold text-ink-faint">{index + 1}.</span>
                  <TextInput
                    aria-label={`First lesson point ${index + 1}`}
                    maxLength={160}
                    value={item}
                    placeholder={
                      ['We get to know each other and what you want to play', 'I check how you hold your instrument', 'You leave with one thing to practise'][index] ?? ''
                    }
                    onChange={(e) => set('whatToExpect', draft.whatToExpect.map((entry, i) => (i === index ? e.target.value : entry)))}
                  />
                  <button
                    type="button"
                    aria-label={`Remove point ${index + 1}`}
                    onClick={() => set('whatToExpect', draft.whatToExpect.filter((_, i) => i !== index))}
                    className="shrink-0 rounded-lg px-2 py-2 text-sm text-ink-faint hover:bg-paper hover:text-danger"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
            {draft.whatToExpect.length < MAX_FIRST_LESSON_POINTS ? (
              <button
                type="button"
                onClick={() => set('whatToExpect', [...draft.whatToExpect, ''])}
                className="self-start rounded-full border border-dashed border-navy/40 px-4 py-2 text-sm font-semibold text-navy hover:border-navy"
              >
                + Add a point
              </button>
            ) : null}
          </Step>

          <Step number={7} title="Music you love">
            <Chips label="Styles" options={options.genres} value={draft.genres} onChange={(v) => set('genres', v)} />
            <Field label="Pieces, artists or soundtracks you love">
              {({ id }) => (
                <>
                  <TextArea
                    id={id}
                    rows={2}
                    maxLength={300}
                    value={draft.favoriteMusic}
                    placeholder="e.g. Chopin nocturnes, Studio Ghibli soundtracks, anything by Stevie Wonder"
                    onChange={(e) => set('favoriteMusic', e.target.value)}
                  />
                  <Counter value={draft.favoriteMusic} max={300} />
                </>
              )}
            </Field>
            <Field label="A link to you playing" help="A YouTube, SoundCloud or Drive link. Make sure it's set so anyone with the link can see it.">
              {({ id }) => (
                <TextInput
                  id={id}
                  type="url"
                  inputMode="url"
                  value={draft.sampleUrl}
                  placeholder="https://"
                  onChange={(e) => set('sampleUrl', e.target.value)}
                />
              )}
            </Field>
          </Step>

          <Step number={8} title="When you're free" intro="Students see your open times. Times you already teach are hidden.">
            <OpenTimes schedule={profile.schedule ?? []} timeZone={draft.timeZone} name={draft.name || profile.name} />
            <Link href="/dashboard/availability" className="self-start rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream">
              Change my times
            </Link>
          </Step>
        </div>

        <div className={cx(view === 'edit' && 'hidden xl:block')}>
          <div className="xl:sticky xl:top-6">
            <p className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">Live preview</p>
            <div className="overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(30,42,68,0.12)] ring-1 ring-navy/10 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <MentorPage mentor={preview} preview action={<span className="block rounded-xl bg-navy py-3 text-center text-sm font-semibold text-cream">Apply to learn with you</span>} />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cx(
          'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur transition-transform lg:left-64',
          dirty || saveError || justSaved ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
          <p aria-live="polite" className={cx('text-sm', saveError ? 'text-danger' : justSaved && !dirty ? 'text-ok' : 'text-ink-soft')}>
            {saveError ?? (dirty ? 'You have unsaved changes.' : justSaved ? 'Saved. Your page is up to date.' : '')}
          </p>
          <div className="flex gap-2">
            {dirty ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(draftFrom(profile));
                  setSaveError(null);
                }}
                disabled={busy}
              >
                Undo changes
              </Button>
            ) : null}
            <Button onClick={save} disabled={busy || !dirty}>
              {busy ? 'Saving…' : 'Save my page'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
