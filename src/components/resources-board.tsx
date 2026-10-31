'use client';

// Shared files and links.
//
//   member mode (dashboard): what your mentor or students shared with you,
//     what you shared, and (for mentors) the team library. Share a file or a
//     link with your students, or with your mentor.
//   team mode (staff area): the team library, e.g. training guides and
//     safety policies, each for everyone on the team or only picked teams.
//
// Files are fetched with the signed-in session and opened from memory, since
// they aren't public.

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, api } from '@/lib/api';
import { ALL_TEAMS, TEAM_LABELS, type Pairing, type ResourceTeam, type SharedResource } from '@/lib/types';
import { Icon, type IconName } from './marketing';
import { Alert, Button, Spinner, cx } from './ui';
import { Field, TextArea, TextInput } from './ui/fields';
import { ReportConcernButton } from './report-concern';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.mp3,.m4a,application/pdf,image/jpeg,image/png,audio/mpeg,audio/mp4,audio/x-m4a';

function sizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function iconFor(resource: SharedResource): IconName {
  if (resource.kind === 'link') return 'arrow';
  if (resource.file?.contentType.startsWith('audio/')) return 'music';
  if (resource.file?.contentType.startsWith('image/')) return 'star';
  return 'file';
}

const SAFE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp4'];

/**
 * Fetch a private file and open or save it. The tab is opened before the
 * download starts so pop-up blockers see it as part of the click. The blob
 * is re-typed to the checked type the API stored, never anything a browser
 * would run as a page.
 */
async function openFile(resource: SharedResource, download: boolean) {
  const tab = download ? null : window.open('', '_blank');
  try {
    const fetched = await api.blob(`/resources/${resource.id}/file${download ? '?download=1' : ''}`);
    const type = SAFE_TYPES.includes(resource.file?.contentType ?? '') ? resource.file!.contentType : 'application/octet-stream';
    const url = URL.createObjectURL(new Blob([fetched], { type }));
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.file?.name ?? 'file';
      link.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    tab?.close();
    throw err;
  }
}

/** Who a team resource can be for. None picked means everyone on the team. */
const TEAMS = ALL_TEAMS.map((key) => ({ key, label: TEAM_LABELS[key] }));

function teamsLabel(teams: ResourceTeam[]): string {
  if (!teams.length) return 'Everyone on the team';
  return TEAMS.filter((team) => teams.includes(team.key)).map((team) => team.label).join(', ');
}

function TeamPicker({ value, onChange }: { value: ResourceTeam[]; onChange: (next: ResourceTeam[]) => void }) {
  const chip = (on: boolean) =>
    cx('rounded-full border px-3 py-1 text-sm', on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft');
  function toggle(key: ResourceTeam) {
    const next = value.includes(key) ? value.filter((entry) => entry !== key) : [...value, key];
    // Every team picked is the same as everyone.
    onChange(next.length === TEAMS.length ? [] : next);
  }
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">Who can see it</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!value.length} onClick={() => onChange([])} className={chip(!value.length)}>
          Everyone on the team
        </button>
        {TEAMS.map((team) => (
          <button key={team.key} type="button" aria-pressed={value.includes(team.key)} onClick={() => toggle(team.key)} className={chip(value.includes(team.key))}>
            {team.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-faint">Students never see team resources. Admins can see all of them.</p>
    </fieldset>
  );
}

export function ResourcesBoard({ mode }: { mode: 'member' | 'team' }) {
  const [resources, setResources] = useState<SharedResource[] | null>(null);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get<{ data: SharedResource[] }>(mode === 'team' ? '/resources?scope=team' : '/resources'),
      mode === 'member' ? api.get<{ data: Pairing[] }>('/lessons') : Promise.resolve({ data: [] as Pairing[] }),
    ])
      .then(([list, lessons]) => {
        setResources(list.data);
        setPairings(lessons.data);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We couldn’t load resources.'));
  }, [mode]);

  useEffect(load, [load]);

  const groups = useMemo(() => {
    const all = resources ?? [];
    if (mode === 'team') return [{ title: 'Team library', items: all, empty: 'Nothing in the team library yet.' }];
    return [
      { title: 'Shared with you', items: all.filter((item) => item.scope === 'pairing' && !item.mine), empty: 'Nothing shared with you yet.' },
      { title: 'You shared', items: all.filter((item) => item.mine && item.scope === 'pairing'), empty: 'You haven’t shared anything yet.' },
      ...(all.some((item) => item.scope === 'team')
        ? [{ title: 'From the Note by Note team', items: all.filter((item) => item.scope === 'team'), empty: '' }]
        : []),
    ];
  }, [resources, mode]);

  if (error) return <Alert>{error}</Alert>;
  if (!resources) return <Spinner label="Loading resources" />;

  const canShare = mode === 'team' || pairings.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {canShare ? (
        sharing ? (
          <ShareForm
            mode={mode}
            pairings={pairings}
            onCancel={() => setSharing(false)}
            onShared={() => {
              setSharing(false);
              load();
            }}
          />
        ) : (
          <div>
            <Button onClick={() => setSharing(true)}>
              {mode === 'team' ? 'Add to the team library' : 'Share a file or link'}
            </Button>
          </div>
        )
      ) : (
        <p className="rounded-xl bg-white p-4 text-sm text-ink-soft shadow-sm">
          Once you&apos;re matched, you can share sheet music, recordings and links here.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 font-display text-xl font-bold text-navy">{group.title}</h2>
          {group.items.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {group.items.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  showAudience={mode === 'member' && resource.mine}
                  teamMode={mode === 'team'}
                  onDeleted={load}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">{group.empty}</p>
          )}
        </section>
      ))}
    </div>
  );
}

function ResourceCard({
  resource,
  showAudience,
  teamMode,
  onDeleted,
}: {
  resource: SharedResource;
  showAudience: boolean;
  /** In the staff library: show which teams see it, and let managers change that. */
  teamMode: boolean;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<ResourceTeam[]>(resource.teams ?? []);
  const [editingTeams, setEditingTeams] = useState<ResourceTeam[] | null>(null);

  async function run(label: string, action: () => Promise<unknown>) {
    setBusy(label);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That didn’t work. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove “${resource.title}”? People you shared it with won’t see it any more.`)) return;
    await run('remove', async () => {
      await api.delete(`/resources/${resource.id}`);
      onDeleted();
    });
  }

  const audience = [...new Set(resource.sharedWith.map((entry) => entry.student.replace(/\s*\(test\)$/, '')))].join(', ');

  return (
    <li className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky/30 text-navy">
        <Icon name={iconFor(resource)} className={cx('size-5', resource.kind === 'link' && '-rotate-45')} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy">{resource.title}</p>
        {resource.note ? <p className="mt-0.5 text-sm text-ink-soft">{resource.note}</p> : null}
        <p className="mt-1 text-xs text-ink-faint">
          {resource.mine ? 'You' : resource.createdBy.replace(/\s*\(test\)$/, '')} ·{' '}
          {new Date(resource.createdAt).toLocaleDateString()}
          {resource.file ? ` · ${sizeLabel(resource.file.size)}` : ''}
          {showAudience && audience ? ` · Shared with ${resource.sharedWith.length > 1 ? audience : audience.split(' ')[0]}` : ''}
        </p>
        {teamMode && resource.scope === 'team' ? (
          editingTeams ? (
            <div className="mt-3 rounded-xl bg-paper p-3">
              <TeamPicker value={editingTeams} onChange={setEditingTeams} />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={busy !== null}
                  onClick={() =>
                    run('teams', async () => {
                      const body = await api.patch<{ data: SharedResource }>(`/resources/${resource.id}`, { teams: editingTeams });
                      setTeams(body.data.teams ?? []);
                      setEditingTeams(null);
                    })
                  }
                >
                  {busy === 'teams' ? 'Saving…' : 'Save'}
                </Button>
                <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => setEditingTeams(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-xs text-ink-soft">
              Seen by: <span className="font-medium text-ink">{teamsLabel(teams)}</span>
              {resource.canDelete ? (
                <button type="button" onClick={() => setEditingTeams(teams)} className="ml-2 font-semibold text-navy underline underline-offset-2">
                  Change
                </button>
              ) : null}
            </p>
          )
        ) : null}
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {resource.kind === 'link' && resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-cream hover:bg-navy/90"
            >
              Open link
            </a>
          ) : (
            <>
              <Button size="sm" disabled={busy !== null} onClick={() => run('open', () => openFile(resource, false))}>
                {busy === 'open' ? 'Opening…' : 'Open'}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => run('save', () => openFile(resource, true))}>
                {busy === 'save' ? 'Saving…' : 'Download'}
              </Button>
            </>
          )}
          {resource.canDelete ? (
            <Button size="sm" variant="ghost" disabled={busy !== null} onClick={remove}>
              {busy === 'remove' ? 'Removing…' : 'Remove'}
            </Button>
          ) : null}
          {!resource.mine && !teamMode ? (
            <ReportConcernButton kind="resource" targetId={resource.id} about={`“${resource.title}”`} label="Report" className="ml-auto" />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ShareForm({
  mode,
  pairings,
  onCancel,
  onShared,
}: {
  mode: 'member' | 'team';
  pairings: Pairing[];
  onCancel: () => void;
  onShared: () => void;
}) {
  const [kind, setKind] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [chosen, setChosen] = useState<string[]>(() => pairings.map((pairing) => pairing.id));
  const [teams, setTeams] = useState<ResourceTeam[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMentor = pairings.some((pairing) => pairing.side === 'mentor');
  const nameOf = (pairing: Pairing) =>
    (pairing.side === 'mentor' ? pairing.student.name : pairing.mentor.name).replace(/\s*\(test\)$/, '');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!title.trim()) return setError('Give it a title so people know what it is.');
    if (mode === 'member' && !chosen.length) return setError('Choose who to share it with.');
    const share = mode === 'team' ? 'team' : chosen;

    setBusy(true);
    try {
      if (kind === 'link') {
        if (!/^https:\/\/\S+$/.test(url.trim())) throw new Error('Links need to start with https://');
        await api.post('/resources', { title: title.trim(), note: note.trim(), url: url.trim(), share, ...(mode === 'team' ? { teams } : {}) });
      } else {
        if (!file) throw new Error('Choose a file.');
        if (file.size > MAX_BYTES) throw new Error('Files can be up to 10 MB.');
        const query = new URLSearchParams({
          title: title.trim(),
          note: note.trim(),
          name: file.name,
          share: Array.isArray(share) ? share.join(',') : share,
          ...(mode === 'team' && teams.length ? { teams: teams.join(',') } : {}),
        });
        await api.upload(`/resources/upload?${query.toString()}`, file);
      }
      onShared();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t upload. Please try again.');
      setBusy(false);
    }
  }

  let audience: ReactNode = null;
  if (mode === 'member') {
    audience =
      pairings.length === 1 ? (
        <p className="text-sm text-ink-soft">
          Shared with <strong className="text-ink">{nameOf(pairings[0])}</strong>
          {isMentor ? '' : ', your mentor'}.
        </p>
      ) : (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Share with</legend>
          <div className="flex flex-wrap gap-2">
            {pairings.map((pairing) => {
              const on = chosen.includes(pairing.id);
              return (
                <button
                  key={pairing.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChosen(on ? chosen.filter((id) => id !== pairing.id) : [...chosen, pairing.id])}
                  className={cx(
                    'rounded-full border px-3 py-1 text-sm',
                    on ? 'border-navy bg-navy text-cream' : 'border-line-strong bg-white text-ink-soft',
                  )}
                >
                  {nameOf(pairing)}
                </button>
              );
            })}
          </div>
        </fieldset>
      );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
      <div role="radiogroup" aria-label="What are you sharing?" className="inline-flex self-start rounded-full bg-paper p-1">
        {(['file', 'link'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={kind === option}
            onClick={() => setKind(option)}
            className={cx('rounded-full px-4 py-1.5 text-sm font-semibold', kind === option ? 'bg-navy text-cream' : 'text-navy/70')}
          >
            {option === 'file' ? 'A file' : 'A link'}
          </button>
        ))}
      </div>

      {kind === 'file' ? (
        <Field label="File" required help="PDF, JPEG or PNG image, or an MP3 or M4A recording. Up to 10 MB.">
          {({ id }) => (
            <input
              id={id}
              type="file"
              accept={ACCEPT}
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setFile(next);
                if (next && !title) setTitle(next.name.replace(/\.[^.]+$/, '').slice(0, 120));
              }}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
            />
          )}
        </Field>
      ) : (
        <Field label="Link" required help="A YouTube video, a backing track, a tool. Must start with https://">
          {({ id }) => <TextInput id={id} type="url" inputMode="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />}
        </Field>
      )}

      <Field label="Title" required>
        {({ id }) => <TextInput id={id} maxLength={120} value={title} placeholder="e.g. C major scale, two octaves" onChange={(e) => setTitle(e.target.value)} />}
      </Field>
      <Field label="Note">
        {({ id }) => (
          <TextArea id={id} rows={2} maxLength={500} value={note} placeholder="e.g. Practise slowly with the metronome at 60." onChange={(e) => setNote(e.target.value)} />
        )}
      </Field>

      {audience}
      {mode === 'team' ? <TeamPicker value={teams} onChange={setTeams} /> : null}
      {error ? <Alert>{error}</Alert> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? (kind === 'file' ? 'Uploading…' : 'Sharing…') : 'Share'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
