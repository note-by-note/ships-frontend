// "Meet the team" on the About page: one polaroid per person from TEAM in
// lib/site.ts. A picture is optional; without one the polaroid shows their
// initials on a colour from the site's palette. A server component, so no
// helpers from the client-only ui module (cx).

import Image from 'next/image';
import type { TeamMember } from '@/lib/site';
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

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => (
        <li key={member.name} className="flex flex-col items-center text-center">
          <Polaroid caption={member.name} tilt={TILTS[index % TILTS.length]} className="w-60">
            {member.photo ? (
              <div className="relative size-full">
                <Image
                  src={`/team/${member.photo}`}
                  alt={`Picture of ${member.name}`}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
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
