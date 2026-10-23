'use client';

// The partner schools the student application asks about. Adding one makes
// it a choice on the form within a minute; turning one off hides it from new
// applications but keeps what past applicants answered.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { FormTabs } from '@/components/staff-shell';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { TextInput } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import type { PartnerSchool } from '@/lib/types';

export default function PartnerSchoolsPage() {
  const [schools, setSchools] = useState<PartnerSchool[] | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get<{ data: PartnerSchool[] }>('/staff/schools')
      .then((body) => setSchools(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load the schools.'));
  }, []);

  useEffect(load, [load]);

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.post('/staff/schools', { name: name.trim() });
      setName('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? (err.status === 409 ? 'That school is already on the list.' : err.message) : 'That didn’t save.');
    } finally {
      setBusy(false);
    }
  }

  async function update(school: PartnerSchool, changes: Partial<PartnerSchool>) {
    setError(null);
    try {
      await api.patch(`/staff/schools/${school.id}`, changes);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t save.');
    }
  }

  function rename(school: PartnerSchool) {
    const next = window.prompt('New name for this school', school.name);
    if (next && next.trim() && next.trim() !== school.name) void update(school, { name: next.trim() });
  }

  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormTabs />
      <DashboardHeading
        title="Partner schools"
        description="The first question on the student application asks which of these schools a student comes from. “Another school” and “Not in school or homeschooled” are always offered too."
      />
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title="Schools">
          {!schools ? (
            <Spinner />
          ) : !schools.length ? (
            <p className="text-sm text-ink-soft">No partner schools yet. Add the first one.</p>
          ) : (
            <ul className="divide-y divide-line">
              {schools.map((school) => (
                <li key={school.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-2">
                    <span className={school.active ? 'font-medium text-ink' : 'text-ink-faint line-through'}>{school.name}</span>
                    {!school.active ? <Badge>Off</Badge> : null}
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => rename(school)}>
                      Rename
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => update(school, { active: !school.active })}>
                      {school.active ? 'Turn off' : 'Turn on'}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Add a school">
          <form onSubmit={add} className="flex flex-col gap-3">
            <label htmlFor="school-name" className="text-sm font-medium text-ink">
              School name
            </label>
            <TextInput id="school-name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? 'Adding…' : 'Add school'}
            </Button>
            <p className="text-xs text-ink-faint">
              It appears on the student application within a minute. Turning a school off hides it from new
              applications; past answers stay as they were.
            </p>
          </form>
        </Panel>
      </div>
    </RequirePermission>
  );
}
