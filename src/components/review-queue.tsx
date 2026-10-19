'use client';

// The reviewers' work surface: one queue across every form, filterable down to
// a single intake. Because forms are data, this page never needs to change when
// a new intake is created.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ApplicationListing, FormListing, Paged } from '@/lib/types';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner, StatusBadge, cx, humanize } from './ui';
import { Select, TextInput } from './ui/fields';

const STATUS_FILTERS = ['submitted', 'under_review', 'accepted', 'waitlisted', 'rejected', 'withdrawn'] as const;

export function ReviewQueue() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? '';
  const formSlug = searchParams.get('formSlug') ?? '';
  const query = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const includeTest = searchParams.get('includeTest') === '1';

  // The result is stored with the query it answered, so "are we loading?" is a
  // comparison rather than a second piece of state to keep in step.
  const queryKey = `${status}|${formSlug}|${query}|${page}|${includeTest}`;
  const [result, setResult] = useState<{ key: string; page: Paged<ApplicationListing> | null } | null>(null);
  const [forms, setForms] = useState<FormListing[]>([]);
  const [search, setSearch] = useState(query);

  const loading = result?.key !== queryKey;
  const current = result?.key === queryKey ? result.page : null;

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Any filter change invalidates the page number.
      if (key !== 'page') next.delete('page');
      router.push(`/admin/applications?${next.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    api.get<Paged<FormListing>>('/forms?scope=all&limit=50').then((body) => setForms(body.data)).catch(() => setForms([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (formSlug) params.set('formSlug', formSlug);
    if (query) params.set('q', query);
    if (page > 1) params.set('page', String(page));
    if (includeTest) params.set('includeTest', '1');

    api
      .get<Paged<ApplicationListing>>(`/applications?${params.toString()}`)
      .then((body) => {
        if (!cancelled) setResult({ key: queryKey, page: body });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: queryKey, page: null });
      });

    return () => {
      cancelled = true;
    };
  }, [status, formSlug, query, page, includeTest, queryKey]);

  const counts = current?.meta.statusCounts ?? {};

  return (
    <>
      <PageHeader
        title="Applications"
        description="Everything submitted, across every intake. Drafts stay private to the applicant until they send them."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setParam('status', '')}
          className={cx(
            'rounded-full border px-3 py-1 text-sm transition-colors',
            !status ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line-strong text-ink-soft hover:bg-paper',
          )}
        >
          All
        </button>

        {STATUS_FILTERS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setParam('status', entry)}
            className={cx(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              status === entry
                ? 'border-accent bg-accent-soft font-medium text-accent'
                : 'border-line-strong text-ink-soft hover:bg-paper',
            )}
          >
            {humanize(entry)}
            {counts[entry] ? <span className="ml-1.5 text-xs text-ink-faint">{counts[entry]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <form
          className="flex min-w-64 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setParam('q', search.trim());
          }}
        >
          <TextInput
            type="search"
            placeholder="Search by applicant name or email"
            aria-label="Search applications"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <Select
          aria-label="Filter by form"
          className="max-w-56"
          value={formSlug}
          onChange={(event) => setParam('formSlug', event.target.value)}
        >
          <option value="">All forms</option>
          {forms.map((form) => (
            <option key={form.slug} value={form.slug}>
              {form.title}
            </option>
          ))}
        </Select>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(event) => setParam('includeTest', event.target.checked ? '1' : '')}
            className="size-4 accent-accent"
          />
          Show test data
        </label>
      </div>

      {loading ? (
        <Spinner />
      ) : !current || !current.data.length ? (
        <EmptyState
          title="Nothing here"
          description={
            status || formSlug || query
              ? 'No applications match these filters.'
              : 'Applications will appear as they are submitted.'
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Applicant</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Form</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {current.data.map((application) => (
                  <tr key={application.id} className="transition-colors hover:bg-paper">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {application.applicantName || 'Unnamed applicant'}
                      </Link>
                      {application.isTest ? (
                        <Badge tone="warn" className="ml-2">
                          Test
                        </Badge>
                      ) : null}
                      <p className="text-xs text-ink-faint">{application.applicantEmail}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">
                      <Badge>{application.formKind}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {current.meta.pages > 1 ? (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-ink-soft">
                Page {current.meta.page} of {current.meta.pages} · {current.meta.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={current.meta.page <= 1}
                  onClick={() => setParam('page', String(current.meta.page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!current.meta.hasMore}
                  onClick={() => setParam('page', String(current.meta.page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
