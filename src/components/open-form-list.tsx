'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { OpenForm } from '@/lib/types';
import { ButtonLink, Card, EmptyState, Spinner } from './ui';

const KIND_COPY: Record<string, { label: string; blurb: string }> = {
  mentee: { label: 'For students', blurb: 'Learn an instrument with a mentor alongside you.' },
  mentor: { label: 'For mentors', blurb: 'Teach with us.' },
  job: { label: 'Join the team', blurb: 'Open roles at Note by Note.' },
};

export function OpenFormList() {
  const [forms, setForms] = useState<OpenForm[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<{ data: OpenForm[] }>('/forms')
      .then((body) => setForms(body.data))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <EmptyState title="We could not load open applications" description="Please try again in a moment." />;
  }
  if (!forms) return <Spinner label="Loading applications" />;
  if (!forms.length) {
    return (
      <EmptyState
        title="Nothing is open right now"
        description="We open applications each term. Check back soon."
      />
    );
  }

  // Grouped so a student is not scrolling past job postings to find their form.
  const groups = ['mentee', 'mentor', 'job'].filter((kind) => forms.some((form) => form.kind === kind));

  return (
    <div className="space-y-10">
      {groups.map((kind) => (
        <section key={kind}>
          <h2 className="mb-1 text-lg font-semibold text-ink">{KIND_COPY[kind]?.label ?? kind}</h2>
          <p className="mb-4 text-sm text-ink-soft">{KIND_COPY[kind]?.blurb}</p>

          <div className="space-y-3">
            {forms
              .filter((form) => form.kind === kind)
              .map((form) => (
                <Card key={form.slug} className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-ink">{form.title}</h3>
                    {form.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{form.description}</p>
                    ) : null}
                  </div>
                  <ButtonLink href={`/apply/${form.slug}`}>Start</ButtonLink>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
