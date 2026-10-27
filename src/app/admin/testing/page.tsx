'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequirePermission } from '@/components/admin-guard';
import { useAuth } from '@/components/auth-provider';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { Alert, Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { Select } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import type { TestAccount } from '@/lib/types';

// Test accounts: staff create pretend students, mentors and mentors who take
// lessons too, and switch into them to see their pages exactly as they would. Only test accounts can be entered —
// there is no way to sign in as a real person from here.

export default function TestingPage() {
  const router = useRouter();
  const { enterTestAccount } = useAuth();
  const [accounts, setAccounts] = useState<TestAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pair, setPair] = useState({ studentId: '', mentorId: '' });

  const load = useCallback(() => {
    api
      .get<{ data: TestAccount[] }>('/testing/accounts')
      .then((body) => setAccounts(body.data))
      .catch(() => setAccounts([]));
  }, []);

  useEffect(load, [load]);

  async function run(key: string, action: () => Promise<unknown>, success?: string) {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (success) setNotice(success);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work.');
    } finally {
      setBusy(null);
    }
  }

  async function switchInto(account: TestAccount) {
    setBusy(account.id);
    setError(null);
    try {
      await enterTestAccount(account.id);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not switch into that account.');
      setBusy(null);
    }
  }

  const students = (accounts ?? []).filter((account) => account.role === 'student' || account.alsoStudent);
  const mentors = (accounts ?? []).filter((account) => account.role === 'mentor');

  return (
    <RequirePermission anyOf={['testing.use']}>
      <DashboardHeading
        title="Test mode"
        description="Make test students, mentors and mentor-students (mentors who take lessons too), then switch into them to try their pages. Everything a test account does is labelled as test data and kept out of the real review queue and numbers."
        actions={
          <>
            <Button disabled={busy !== null} onClick={() => run('new-student', () => api.post('/testing/accounts', { kind: 'student' }), 'Test student created.')}>
              + Test student
            </Button>
            <Button
              variant="secondary"
              disabled={busy !== null}
              onClick={() => run('new-mentor', () => api.post('/testing/accounts', { kind: 'mentor' }), 'Test mentor created, with a hidden test profile.')}
            >
              + Test mentor
            </Button>
            <Button
              variant="secondary"
              disabled={busy !== null}
              onClick={() =>
                run('new-both', () => api.post('/testing/accounts', { kind: 'both' }), 'Test mentor-student created: a test mentor who can also apply for lessons and ask other mentors.')
              }
            >
              + Mentor-student
            </Button>
          </>
        }
      />

      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {notice ? <div className="mb-4"><Alert tone="ok">{notice}</Alert></div> : null}

      {!accounts ? (
        <Spinner />
      ) : !accounts.length ? (
        <EmptyState title="No test accounts yet" description="Create a test student or mentor to get started." />
      ) : (
        <div className="flex flex-col gap-8">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs tracking-wide text-ink-faint uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Test account</th>
                  <th scope="col" className="px-4 py-3 font-medium">Activity</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {account.name}{' '}
                        <Badge tone="warn" className="ml-1">{account.alsoStudent ? 'mentor + student' : account.role}</Badge>
                      </p>
                      <p className="text-xs text-ink-faint">{account.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {account.alsoStudent
                        ? `${account.matchRequestCount} received, ${account.requestsSent} sent, ${account.applicationCount} application${account.applicationCount === 1 ? '' : 's'}`
                        : account.role === 'mentor'
                        ? `${account.matchRequestCount} request${account.matchRequestCount === 1 ? '' : 's'} received`
                        : `${account.applicationCount} application${account.applicationCount === 1 ? '' : 's'}, ${account.matchRequestCount} request${account.matchRequestCount === 1 ? '' : 's'} sent`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" disabled={busy !== null} onClick={() => switchInto(account)}>
                          {busy === account.id ? 'Switching…' : 'Switch to'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy !== null}
                          onClick={() => {
                            if (window.confirm(`Delete ${account.name} and everything it created?`)) {
                              void run(`delete-${account.id}`, () => api.post(`/testing/accounts/${account.id}/delete`), 'Test account deleted.');
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Panel title="Send a test match request">
            <p className="mb-4 text-sm text-ink-soft">
              Test mentor profiles are hidden from Find a Mentor, so use this to put a request in a test mentor’s inbox.
            </p>
            {students.length && mentors.length ? (
              <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run('pair', () => api.post('/testing/match-request', pair), 'Request sent. Switch to the test mentor to see it.');
                }}
              >
                <Select aria-label="From test student" className="max-w-56" value={pair.studentId} onChange={(e) => setPair({ ...pair, studentId: e.target.value })} required>
                  <option value="">From student…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Select aria-label="To test mentor" className="max-w-56" value={pair.mentorId} onChange={(e) => setPair({ ...pair, mentorId: e.target.value })} required>
                  <option value="">To mentor…</option>
                  {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
                <Button type="submit" variant="secondary" disabled={busy !== null}>Send request</Button>
              </form>
            ) : (
              <p className="text-sm text-ink-faint">Create at least one test student and one test mentor first.</p>
            )}
          </Panel>
        </div>
      )}
    </RequirePermission>
  );
}
