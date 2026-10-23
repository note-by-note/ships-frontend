'use client';

// "Meet the team" on the About page: one polaroid per person, from the team
// staff edit in the staff area (Team page). A picture is optional; without one
// the polaroid shows their initials on a colour from the site's palette.

import { useEffect, useState } from 'react';
import { api, apiUrl } from '@/lib/api';
import type { TeamMember } from '@/lib/types';
import { Polaroid } from './marketing';

const TONES = ['bg-sky/60', 'bg-gold/60', 'bg-sage/60', 'bg-coral/45'];
const TILTS = ['left', 'right', 'none'] as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);

  useEffect(() => {
    api
      .get<{ data: TeamMember[] }>('/team')
      .then((body) => setMembers(body.data))
      .catch(() => setMembers([]));
  }, []);

  // Nothing while it loads, so the "coming soon" box doesn't flash first.
  if (!members) return <div className="min-h-40" aria-busy="true" />;

  if (!members.length) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-navy/25 px-6 py-12 text-center text-navy/60">
        Team profiles are coming soon.
      </div>
    );
  }

  return (
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => (
        <li key={member.id} className="flex flex-col items-center text-center">
          <Polaroid caption={member.name} tilt={TILTS[index % TILTS.length]} className="w-60">
            {member.photoPath ? (
              // eslint-disable-next-line @next/next/no-img-element -- served by the API on another origin
              <img src={apiUrl(member.photoPath)} alt={`Picture of ${member.name}`} className="size-full object-cover" loading="lazy" />
            ) : (
              <div
                aria-hidden
                className={`flex size-full items-center justify-center font-display text-5xl font-bold text-navy ${TONES[index % TONES.length]}`}
              >
                {initials(member.name)}
              </div>
            )}
          </Polaroid>
          <p className="mt-5 text-sm font-semibold tracking-wide text-coral uppercase">{member.role}</p>
          {member.about ? <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy/75">{member.about}</p> : null}
        </li>
      ))}
    </ul>
  );
}
