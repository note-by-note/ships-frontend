'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import type { ApplicationForm, FormKind, FormListing, Paged } from '@/lib/types';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Spinner, StatusBadge, humanize } from './ui';
import { Field, Select, TextInput } from './ui/fields';

const KINDS: { value: FormKind; label: string }[] = [
  { value: 'mentee', label: 'Student intake' },
  { value: 'mentor', label: 'Mentor intake' },
  { value: 'job', label: 'Job posting' },
];

/** Turn a title into a usable slug so the admin rarely has to think about one. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function FormsList() {
  const router = useRouter();
  const [forms, setForms] = useState<FormListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [duplicating, setDuplicating] = useState<FormListing | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Paged<FormListing>>('/forms?scope=all&limit=50')
      .then((body) => setForms(body.data))
      .catch(() => {
        setForms([]);
        setError('We could not load the forms.');
      });
  }, []);

  useEffect(load, [load]);

  /** Open = published, closed = closed. Opening a draft publishes it. */
  async function setOpen(form: FormListing, open: boolean) {
    setSwitching(form.slug);
    setError(null);
    try {
      await api.patch(`/forms/${form.slug}`, { status: open ? 'published' : 'closed' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? `${form.title}: ${err.message}` : 'That change did not save.');
    } finally {
      setSwitching(null);
    }
  }

  async function closeAll() {
    const open = (forms ?? []).filter((form) => form.status === 'published');
    if (!open.length || !window.confirm(`Stop accepting applications on ${open.length} form${open.length === 1 ? '' : 's'}?`)) return;
    setSwitching('all');
    setError(null);
    try {
      for (const form of open) await api.patch(`/forms/${form.slug}`, { status: 'closed' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Not every form could be closed.');
    } finally {
      setSwitching(null);
      load();
    }
  }

  const openCount = (forms ?? []).filter((form) => form.accepting).length;

  return (
    <>
      <PageHeader
        title="Forms"
        description="Every application, mentor intake and job posting. Editing a live form bumps its version; applications already submitted keep the questions they were asked."
        actions={
          <>
            <Button variant="secondary" onClick={closeAll} disabled={switching !== null || !forms?.some((form) => form.status === 'published')}>
              Close all applications
            </Button>
            <Button onClick={() => setCreating(true)}>New form</Button>
          </>
        }
      />

      {forms ? (
        <p className="mb-6 text-sm text-ink-soft">
          <strong className="text-ink">{openCount}</strong> {openCount === 1 ? 'form is' : 'forms are'} accepting
          applications right now. Use the switch on each form to open or close it. Closed forms stay visible with a
          “not open” message, and nobody can start or send an application.
        </p>
      ) : null}

      {error ? (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {creating ? (
        <FormDialog
          title="New form"
          submitLabel="Create and edit"
          onCancel={() => setCreating(false)}
          onSubmit={async (values) => {
            const body = await api.post<{ data: ApplicationForm }>('/forms', values);
            router.push(`/admin/forms/${body.data.slug}`);
          }}
        />
      ) : null}

      {duplicating ? (
        <FormDialog
          title={`Duplicate “${duplicating.title}”`}
          description="The copy starts as a draft with every section and question of the original. Nothing about the original changes, and its applications stay where they are."
          submitLabel="Duplicate"
          defaults={{ title: `${duplicating.title} (copy)`, kind: duplicating.kind }}
          onCancel={() => setDuplicating(null)}
          onSubmit={async (values) => {
            const body = await api.post<{ data: ApplicationForm }>(
              `/forms/${duplicating.slug}/duplicate`,
              values,
            );
            router.push(`/admin/forms/${body.data.slug}`);
          }}
        />
      ) : null}

      {!forms ? (
        <Spinner />
      ) : !forms.length ? (
        <EmptyState
          title="No forms yet"
          description="Create one, or run the seed script for a starter set."
          action={<Button onClick={() => setCreating(true)}>New form</Button>}
        />
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/forms/${form.slug}`}
                    className="font-medium text-ink underline-offset-2 hover:underline"
                  >
                    {form.title}
                  </Link>
                  <StatusBadge status={form.status} />
                  <Badge>{humanize(form.kind)}</Badge>
                  {form.version > 1 ? <Badge>v{form.version}</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {form.sectionCount} {form.sectionCount === 1 ? 'section' : 'sections'} ·{' '}
                  {form.questionCount} {form.questionCount === 1 ? 'question' : 'questions'} ·{' '}
                  <Link
                    href={`/admin/applications?formSlug=${form.slug}`}
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {form.submissionCount} {form.submissionCount === 1 ? 'application' : 'applications'}
                  </Link>
                </p>
              </div>

              <OpenSwitch form={form} busy={switching !== null} onChange={(open) => setOpen(form, open)} />

              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => setDuplicating(form)}>
                  Duplicate
                </Button>
                <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/forms/${form.slug}`)}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function FormDialog({
  title,
  description,
  submitLabel,
  defaults,
  onCancel,
  onSubmit,
}: {
  title: string;
  description?: string;
  submitLabel: string;
  defaults?: { title?: string; kind?: FormKind };
  onCancel: () => void;
  onSubmit: (values: { title: string; slug: string; kind: FormKind }) => Promise<void>;
}) {
  const [formTitle, setFormTitle] = useState(defaults?.title ?? '');
  const [slug, setSlug] = useState(defaults?.title ? slugify(defaults.title) : '');
  const [slugEdited, setSlugEdited] = useState(false);
  const [kind, setKind] = useState<FormKind>(defaults?.kind ?? 'mentee');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await onSubmit({ title: formTitle.trim(), slug: slug.trim(), kind });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <Card className="mb-6 p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}

      <form onSubmit={submit} className="mt-5 grid max-w-2xl gap-4 sm:grid-cols-2">
        {error ? (
          <div className="sm:col-span-2">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Title" required>
            {({ id }) => (
              <TextInput
                id={id}
                required
                value={formTitle}
                onChange={(event) => {
                  setFormTitle(event.target.value);
                  if (!slugEdited) setSlug(slugify(event.target.value));
                }}
              />
            )}
          </Field>
        </div>

        <Field label="URL slug" required help="Appears in the link applicants open.">
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              required
              aria-describedby={describedBy}
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(slugify(event.target.value));
              }}
            />
          )}
        </Field>

        <Field label="Kind" required help="Groups it in the review queue.">
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={kind}
              onChange={(event) => setKind(event.target.value as FormKind)}
            >
              {KINDS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={busy || !formTitle.trim() || !slug.trim()}>
            {busy ? 'Working…' : submitLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** The per-form "accepting applications" switch. */
function OpenSwitch({ form, busy, onChange }: { form: FormListing; busy: boolean; onChange: (open: boolean) => void }) {
  if (form.status === 'archived') return <span className="text-sm text-ink-faint">Archived</span>;

  const open = form.status === 'published';
  // Published but outside its open/close dates: switched on, yet not taking applications.
  const scheduled = open && !form.accepting;
  const label = open ? (scheduled ? 'Open, but outside its dates' : 'Accepting applications') : form.status === 'draft' ? 'Draft' : 'Closed';

  return (
    <label className="flex shrink-0 items-center gap-3 text-sm">
      <span className={open && !scheduled ? 'font-medium text-ok' : 'text-ink-soft'}>{label}</span>
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          role="switch"
          aria-label={`Accept applications for ${form.title}`}
          checked={open}
          disabled={busy}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-sage peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-navy" />
        <span className="absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
