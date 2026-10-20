'use client';

import { useCallback, useEffect, useState } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading } from '@/components/dashboard-shell';
import { Alert, Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { Select, TextInput } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import { ROLE_LABELS, STAFF_ROLES, type DirectoryUser, type Paged, type UserRole } from '@/lib/types';

// Accounts and roles. Admins can give any role; tech can switch people between
// student and mentor and deactivate non-staff accounts. The API enforces the
// same rules — the controls here just don't offer what would be refused.

const ROLE_HELP: Record<UserRole, string> = {
  student: 'Applies for lessons.',
  mentor: 'Teaches; can be linked to a mentor profile.',
  admin: 'Everything, including roles.',
  tech: 'Mentors, accounts, forms, applications, test mode.',
  outreach: 'Reviews applications; reads mentor profiles.',
  marketing: 'Overview numbers only.',
};

export default function PeoplePage() {
  const { user: me, can } = useAuth();
  const [people, setPeople] = useState<DirectoryUser[] | null>(null);
  const [role, setRole] = useState('');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ limit: '60' });
    if (role) params.set('role', role);
    if (submitted) params.set('q', submitted);
    api
      .get<Paged<DirectoryUser>>(`/users?${params.toString()}`)
      .then((body) => setPeople(body.data))
      .catch(() => setPeople([]));
  }, [role, submitted]);

  useEffect(load, [load]);

  const canManage = can('users.manage');
  const canGiveStaffRoles = can('roles.manage');

  async function update(person: DirectoryUser, changes: Record<string, unknown>) {
    setError(null);
    try {
      await api.patch(`/users/${person.id}`, changes);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That change did not save.');
    }
  }

  function roleOptions(person: DirectoryUser): UserRole[] {
    if (canGiveStaffRoles) return Object.keys(ROLE_LABELS) as UserRole[];
    // Without roles.manage you can only move people between student and mentor.
    return STAFF_ROLES.includes(person.role as never) ? [person.role] : ['student', 'mentor'];
  }

  return (
    <RequirePermission anyOf={['users.view']}>
      <DashboardHeading
        title="People & roles"
        description="Everyone with an account. Changing someone’s role signs them out everywhere so the change applies straight away."
      />

      <details className="mb-6 rounded-xl bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-navy">What each role can do</summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((entry) => (
            <li key={entry}>
              <strong>{ROLE_LABELS[entry]}:</strong> <span className="text-ink-soft">{ROLE_HELP[entry]}</span>
            </li>
          ))}
        </ul>
        {!canGiveStaffRoles ? (
          <p className="mt-3 text-xs text-ink-faint">Only admins can give or change staff roles.</p>
        ) : null}
      </details>

      <div className="mb-6 flex flex-wrap gap-3">
        <form
          className="flex min-w-64 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(query.trim());
          }}
        >
          <TextInput type="search" aria-label="Search people" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <Select aria-label="Filter by role" className="max-w-48" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((entry) => (
            <option key={entry} value={entry}>{ROLE_LABELS[entry]}</option>
          ))}
        </Select>
      </div>

      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      {!people ? (
        <Spinner />
      ) : !people.length ? (
        <EmptyState title="Nobody matches" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs tracking-wide text-ink-faint uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Person</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Mentor profile</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {people.map((person) => {
                const isMe = person.id === me?.id;
                const isStaffAccount = STAFF_ROLES.includes(person.role as never);
                const locked = !canManage || isMe || (isStaffAccount && !canGiveStaffRoles);
                return (
                  <tr key={person.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {person.name} {isMe ? <span className="text-xs text-ink-faint">(you)</span> : null}
                      </p>
                      <p className="text-xs text-ink-faint">{person.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {locked ? (
                        <Badge tone={isStaffAccount ? 'accent' : 'neutral'}>{ROLE_LABELS[person.role]}</Badge>
                      ) : (
                        <Select
                          aria-label={`Role for ${person.name}`}
                          value={person.role}
                          onChange={(e) => {
                            const next = e.target.value as UserRole;
                            if (window.confirm(`Change ${person.name} to ${ROLE_LABELS[next]}? They will be signed out.`)) {
                              void update(person, { role: next });
                            }
                          }}
                        >
                          {roleOptions(person).map((entry) => (
                            <option key={entry} value={entry}>{ROLE_LABELS[entry]}</option>
                          ))}
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {person.mentorProfile ? person.mentorProfile.name : person.role === 'mentor' ? <span className="text-ink-faint">Not linked</span> : <span className="text-ink-faint">None</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={person.active ? 'ok' : 'danger'}>{person.active ? 'Active' : 'Deactivated'}</Badge>
                        {!locked ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const verb = person.active ? 'Deactivate' : 'Reactivate';
                              if (window.confirm(`${verb} ${person.name}?`)) void update(person, { active: !person.active });
                            }}
                          >
                            {person.active ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </RequirePermission>
  );
}
