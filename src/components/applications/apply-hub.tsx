'use client';

// The /apply page's three paths (students, mentors, volunteers), each a
// distinct card that goes straight into its application. Whether each one is
// open comes from the API's public list of accepting forms, so the badges stay
// true when staff open or close a form. Any other open forms (say, a second
// volunteer posting) are listed underneath.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { APPLY_LINKS } from '@/lib/site';
import type { FormKind, OpenForm } from '@/lib/types';
import { Icon, type IconName } from './marketing';
import { cx } from './ui';

interface Path {
  kind: FormKind;
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  needs: string[];
  cta: string;
  learnMore: { href: string; label: string };
  icon: IconName;
  theme: { band: string; badge: string; dot: string };
}

const PATHS: Path[] = [
  {
    kind: 'mentee',
    href: APPLY_LINKS.student,
    eyebrow: 'For students',
    title: 'Learn an instrument',
    body: 'Free one-on-one lessons online with a volunteer mentor who plays what you want to learn.',
    needs: [
      'The instrument you’d like to learn',
      'A rough idea of when you’re free',
      'A parent or guardian’s contact, if you’re under 18',
    ],
    cta: 'Apply for lessons',
    learnMore: { href: '/how-it-works', label: 'How lessons work' },
    icon: 'music',
    theme: { band: 'bg-sky/45', badge: 'bg-sky text-navy', dot: 'bg-sky' },
  },
  {
    kind: 'mentor',
    href: APPLY_LINKS.mentor,
    eyebrow: 'For musicians',
    title: 'Volunteer as a mentor',
    body: 'Teach a student your instrument, online, at times that work for you. No teaching experience needed.',
    needs: [
      'An instrument you play well enough to teach a beginner',
      'Which levels and ages you’d be comfortable teaching',
      'When you’re usually free',
    ],
    cta: 'Volunteer as a mentor',
    learnMore: { href: '/for-mentors', label: 'What mentors do' },
    icon: 'star',
    theme: { band: 'bg-gold/50', badge: 'bg-gold text-navy', dot: 'bg-gold' },
  },
  {
    kind: 'job',
    href: APPLY_LINKS.volunteer,
    eyebrow: 'Behind the scenes',
    title: 'Join the team',
    body: 'Help run Note by Note on the tech, marketing or outreach team. You don’t need to play an instrument.',
    needs: [
      'Which team you’re interested in',
      'The skills or experience you’d bring',
      'A link to your work, if you have one',
    ],
    cta: 'Apply to volunteer',
    learnMore: { href: '/for-mentors#other-teams', label: 'About the teams' },
    icon: 'code',
    theme: { band: 'bg-sage/45', badge: 'bg-sage text-navy', dot: 'bg-sage' },
  },
];

type Status = 'checking' | 'open' | 'closed' | 'unknown';

export function ApplyHub() {
  const [forms, setForms] = useState<OpenForm[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get<{ data: OpenForm[] }>('/forms')
      .then((body) => setForms(body.data))
      .catch(() => setFailed(true));
  }, []);

  // For each path: its main form if that's open, otherwise any open form of the same kind.
  const resolved = PATHS.map((path) => {
    if (failed) return { path, status: 'unknown' as Status, href: path.href };
    if (!forms) return { path, status: 'checking' as Status, href: path.href };
    const ofKind = forms.filter((form) => form.kind === path.kind);
    const main = ofKind.find((form) => `/apply/${form.slug}` === path.href) ?? ofKind[0];
    return main
      ? { path, status: 'open' as Status, href: `/apply/${main.slug}` }
      : { path, status: 'closed' as Status, href: path.href };
  });

  const featured = new Set(resolved.map((entry) => entry.href));
  const others = (forms ?? []).filter((form) => !featured.has(`/apply/${form.slug}`));

  return (
    <>
      <ul className="grid gap-6 lg:grid-cols-3">
        {resolved.map(({ path, status, href }) => (
          <li key={path.kind}>
            <PathCard path={path} status={status} href={href} />
          </li>
        ))}
      </ul>

      {others.length ? (
        <section aria-labelledby="also-open" className="mt-12">
          <h2 id="also-open" className="font-display text-2xl font-bold text-navy">
            Also open
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((form) => (
              <li key={form.slug}>
                <Link
                  href={`/apply/${form.slug}`}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-5 transition-colors hover:border-navy/40"
                >
                  <span>
                    <span className="block font-semibold text-navy">{form.title}</span>
                    {form.description ? (
                      <span className="mt-1 line-clamp-2 block text-sm text-navy/65">{form.description}</span>
                    ) : null}
                  </span>
                  <Icon name="arrow" className="size-5 shrink-0 text-navy/40 transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === 'unknown') return null;
  const styles: Record<Exclude<Status, 'unknown'>, { label: string; className: string; dot: string }> = {
    checking: { label: 'Checking…', className: 'bg-white/70 text-navy/60', dot: 'bg-navy/30 animate-pulse' },
    open: { label: 'Open now', className: 'bg-white text-ok', dot: 'bg-ok' },
    closed: { label: 'Not open right now', className: 'bg-white/80 text-navy/70', dot: 'bg-navy/30' },
  };
  const style = styles[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', style.className)}>
      <span aria-hidden className={cx('size-2 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}

function PathCard({ path, status, href }: { path: Path; status: Status; href: string }) {
  const closed = status === 'closed';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(30,42,68,0.08)] ring-1 ring-navy/5 transition-shadow hover:shadow-[0_16px_40px_rgba(30,42,68,0.14)]">
      <div className={cx('relative px-7 pt-7 pb-6', path.theme.band)}>
        <div className="flex items-start justify-between gap-3">
          <span className={cx('flex size-14 items-center justify-center rounded-2xl shadow-sm', path.theme.badge)}>
            <Icon name={path.icon} className="size-6" />
          </span>
          <StatusPill status={status} />
        </div>
        <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-navy/60 uppercase">{path.eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl leading-tight font-bold text-navy">{path.title}</h2>
      </div>

      <div className="flex flex-1 flex-col px-7 pt-5 pb-7">
        <p className="leading-relaxed text-navy/75">{path.body}</p>

        <p className="mt-6 text-xs font-semibold tracking-wider text-navy/50 uppercase">You’ll be asked about</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {path.needs.map((need) => (
            <li key={need} className="flex items-start gap-2.5 text-sm text-navy/80">
              <span aria-hidden className={cx('mt-1.5 size-2 shrink-0 rounded-full', path.theme.dot)} />
              {need}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link
            href={href}
            className={cx(
              'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors',
              closed ? 'border-2 border-navy/20 text-navy/70 hover:border-navy/40' : 'bg-navy text-cream hover:bg-navy/90',
            )}
          >
            {closed ? 'See details' : path.cta}
            <Icon name="arrow" className="size-4" />
          </Link>
          <Link
            href={path.learnMore.href}
            className="mt-3 block text-center text-sm font-medium text-navy/65 underline-offset-4 hover:text-navy hover:underline"
          >
            {path.learnMore.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
