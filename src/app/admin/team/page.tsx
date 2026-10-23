'use client';

// "Meet the team" on the About page, edited here: add people, change their
// words or picture, put them in order, remove them. Pictures are optional;
// without one the About page shows their initials.

import Link from 'next/link';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { Avatar } from '@/components/avatar';
import { DashboardHeading } from '@/components/dashboard-shell';
import { squareJpeg } from '@/components/photo-uploader';
import { Alert, Button, Spinner } from '@/components/ui';
import { Field, TextArea, TextInput } from '@/components/ui/fields';
import { ApiError, api } from '@/lib/api';
import type { TeamMember } from '@/lib/types';

function message(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function TeamPageEditor() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ data: TeamMember[] }>('/team')
      .then((body) => setMembers(body.data))
      .catch((err: unknown) => setError(message(err, 'We couldn’t load the team.')));
  }, []);

  useEffect(load, [load]);

  async function move(index: number, by: -1 | 1) {
    if (!members) return;
    const next = [...members];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    setMembers(next);
    try {
      const body = await api.post<{ data: TeamMember[] }>('/team/order', { ids: next.map((member) => member.id) });
      setMembers(body.data);
    } catch (err) {
      setError(message(err, 'The new order didn’t save.'));
      load();
    }
  }

  async function remove(member: TeamMember) {
    if (!window.confirm(`Remove ${member.name} from the About page?`)) return;
    try {
      await api.delete(`/team/${member.id}`);
      load();
    } catch (err) {
      setError(message(err, 'That didn’t work.'));
    }
  }

  return (
    <RequirePermission anyOf={['team.manage']}>
      <DashboardHeading
        title="Team page"
        description="The people shown under “Meet the team” on the About page, in this order."
        actions={
          <>
            <Link href="/about" target="_blank" className="rounded-lg border border-line-strong bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-paper">
              View About page
            </Link>
            {!adding ? <Button onClick={() => setAdding(true)}>Add a person</Button> : null}
          </>
        }
      />

      <div className="flex max-w-3xl flex-col gap-4">
        {error ? <Alert>{error}</Alert> : null}

        {adding ? (
          <MemberForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              load();
            }}
          />
        ) : null}

        {!members ? (
          <Spinner />
        ) : !members.length && !adding ? (
          <div className="rounded-2xl border-2 border-dashed border-navy/15 px-6 py-12 text-center">
            <p className="font-medium text-navy">No one on the team page yet</p>
            <p className="mt-1 text-sm text-navy/60">The About page says “Team profiles are coming soon” until you add someone.</p>
            <Button className="mt-5" onClick={() => setAdding(true)}>
              Add the first person
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member, index) =>
              editing === member.id ? (
                <li key={member.id}>
                  <MemberForm
                    member={member}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      load();
                    }}
                  />
                </li>
              ) : (
                <li key={member.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <Avatar name={member.name} photoPath={member.photoPath} className="size-14 text-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy">{member.name}</p>
                    <p className="text-sm text-coral">{member.role}</p>
                    {member.about ? <p className="mt-0.5 truncate text-sm text-navy/60">{member.about}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${member.name} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded-lg px-2 py-1.5 text-navy/60 hover:bg-paper hover:text-navy disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${member.name} down`}
                      disabled={index === members.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded-lg px-2 py-1.5 text-navy/60 hover:bg-paper hover:text-navy disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(member.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(member)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </RequirePermission>
  );
}

function MemberForm({ member, onCancel, onSaved }: { member?: TeamMember; onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState(member?.name ?? '');
  const [role, setRole] = useState(member?.role ?? '');
  const [about, setAbout] = useState(member?.about ?? '');
  const [photoPath, setPhotoPath] = useState(member?.photoPath ?? null);
  const [picture, setPicture] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    setPicture(event.target.files?.[0] ?? null);
  }

  async function removePicture() {
    if (!member) return;
    try {
      const body = await api.delete<{ data: TeamMember }>(`/team/${member.id}/photo`);
      setPhotoPath(body.data.photoPath);
    } catch (err) {
      setError(message(err, 'That didn’t work.'));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const values = { name: name.trim(), role: role.trim(), about: about.trim() };
      const saved = member
        ? (await api.patch<{ data: TeamMember }>(`/team/${member.id}`, values)).data
        : (await api.post<{ data: TeamMember }>('/team', values)).data;
      if (picture) {
        let jpeg: Blob;
        try {
          jpeg = await squareJpeg(picture);
        } catch {
          throw new Error('That picture couldn’t be read. Try a JPEG or PNG.');
        }
        await api.upload(`/team/${saved.id}/photo`, jpeg);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-2 ring-navy/10">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required help="First name and last initial is fine.">
          {({ id }) => <TextInput id={id} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Role" required help="e.g. Founder, Tech lead, Outreach">
          {({ id }) => <TextInput id={id} required maxLength={60} value={role} onChange={(e) => setRole(e.target.value)} />}
        </Field>
      </div>
      <Field label="A line about them">
        {({ id }) => <TextArea id={id} rows={2} maxLength={300} value={about} onChange={(e) => setAbout(e.target.value)} />}
      </Field>
      <Field label="Picture" help="A photo, drawing or avatar. It's cropped to a square. Leave it out to show their initials.">
        {({ id }) => (
          <div className="flex flex-wrap items-center gap-3">
            {photoPath && !picture ? <Avatar name={name || '?'} photoPath={photoPath} className="size-12" /> : null}
            <input
              id={id}
              type="file"
              accept="image/*"
              onChange={choose}
              className="text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
            />
            {photoPath && !picture ? (
              <Button type="button" size="sm" variant="ghost" onClick={removePicture}>
                Remove picture
              </Button>
            ) : null}
          </div>
        )}
      </Field>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !name.trim() || !role.trim()}>
          {busy ? 'Saving…' : member ? 'Save' : 'Add to team page'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
