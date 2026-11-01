// Building blocks for the public pages, taken from the Figma design: serif
// headings with one accented word, pill buttons, Polaroid cards and the gold
// sticky note. Server components — nothing here needs the browser.

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { SITE } from '@/lib/site';

// Local copy of ui's `cx`: that module is a client module, and a server
// component cannot call a function imported from one.
function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// --- Icons ---------------------------------------------------------------------
// A handful of stroke icons (Lucide shapes) inlined, rather than a dependency.

const ICON_PATHS = {
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  monitor: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
  check: <path d="M20 6 9 17l-5-5" />,
  school: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/** The round tinted icon badge used for steps and feature cards. */
export function IconBadge({
  name,
  tone = 'gold',
  className,
}: {
  name: IconName;
  tone?: 'gold' | 'sage' | 'sky' | 'coral' | 'navy';
  className?: string;
}) {
  const tones = {
    gold: 'bg-gold text-navy',
    sage: 'bg-sage text-navy',
    sky: 'bg-sky text-navy',
    coral: 'bg-coral text-white',
    navy: 'bg-navy text-cream',
  };
  return (
    <span className={cx('inline-flex size-12 shrink-0 items-center justify-center rounded-full', tones[tone], className)}>
      <Icon name={name} className="size-5" />
    </span>
  );
}

// --- Layout --------------------------------------------------------------------

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cx('mx-auto w-full max-w-6xl px-5 md:px-8', className)} {...props} />;
}

export function Section({
  tone = 'cream',
  className,
  children,
  ...props
}: ComponentProps<'section'> & { tone?: 'cream' | 'mist' | 'stone' | 'navy' | 'white' }) {
  const tones = {
    cream: 'bg-cream text-navy',
    mist: 'bg-mist text-navy',
    stone: 'bg-stone text-navy',
    navy: 'bg-navy text-cream',
    white: 'bg-white text-navy',
  };
  return (
    <section className={cx('py-16 md:py-24', tones[tone], className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-xs font-semibold tracking-[0.14em] uppercase opacity-70', className)}>{children}</p>;
}

/**
 * A serif heading with an optional accented word, as in "Every musician
 * deserves a *first note*." Pass the accent separately so it gets the colour.
 */
export function Heading({
  as: Tag = 'h2',
  before,
  accent,
  after,
  accentTone = 'coral',
  className,
}: {
  as?: 'h1' | 'h2' | 'h3';
  before: ReactNode;
  accent?: ReactNode;
  after?: ReactNode;
  accentTone?: 'coral' | 'gold';
  className?: string;
}) {
  const sizes = {
    h1: 'text-4xl leading-[1.1] md:text-5xl lg:text-[60px]',
    h2: 'text-3xl leading-tight md:text-[42px]',
    h3: 'text-2xl leading-snug',
  };
  return (
    <Tag className={cx('font-display font-bold tracking-tight', sizes[Tag], className)}>
      {before}
      {accent ? (
        <>
          {' '}
          <span className={accentTone === 'gold' ? 'text-gold' : 'text-coral'}>{accent}</span>
        </>
      ) : null}
      {after}
    </Tag>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cx('mb-12 flex flex-col gap-3', align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title}
      {description ? <p className="text-base leading-relaxed opacity-75 md:text-lg">{description}</p> : null}
    </div>
  );
}

// --- Actions ---------------------------------------------------------------------

type PillVariant = 'navy' | 'outline' | 'gold' | 'light-outline' | 'white';

const PILL_VARIANTS: Record<PillVariant, string> = {
  navy: 'bg-navy text-cream hover:bg-navy/90',
  outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-cream',
  gold: 'bg-gold text-navy hover:bg-gold/90',
  'light-outline': 'border-2 border-cream text-cream hover:bg-cream hover:text-navy',
  white: 'bg-white text-navy hover:bg-cream',
};

export function PillLink({
  variant = 'navy',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: PillVariant }) {
  return (
    <Link
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors md:text-base',
        PILL_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ArrowLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        'group inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4',
        className,
      )}
      {...props}
    >
      {children}
      <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// --- Figma flourishes -----------------------------------------------------------------

/** A white Polaroid frame with a caption, tilted a little. */
export function Polaroid({
  caption,
  children,
  tilt = 'left',
  className,
}: {
  caption: string;
  children: ReactNode;
  tilt?: 'left' | 'right' | 'none';
  className?: string;
}) {
  const tilts = { left: '-rotate-3', right: 'rotate-3', none: '' };
  return (
    <figure className={cx('bg-white p-3 pb-2 shadow-[0_12px_30px_rgba(30,42,68,0.18)]', tilts[tilt], className)}>
      <div className="aspect-[4/3] overflow-hidden">{children}</div>
      <figcaption className="py-2 text-center font-display text-sm text-navy">{caption}</figcaption>
    </figure>
  );
}

/** The gold handwritten-style note from the hero. */
export function StickyNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        'w-max rotate-[-4deg] bg-gold px-4 py-3 font-display text-sm leading-snug text-navy shadow-[0_8px_20px_rgba(30,42,68,0.2)]',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Stand-in artwork for photo slots: a tinted panel with a big icon. */
export function ArtPanel({
  icon,
  tone = 'sky',
  className,
}: {
  icon: IconName;
  tone?: 'sky' | 'sage' | 'gold' | 'coral' | 'navy';
  className?: string;
}) {
  const tones = {
    sky: 'bg-sky/60 text-navy',
    sage: 'bg-sage/60 text-navy',
    gold: 'bg-gold/70 text-navy',
    coral: 'bg-coral/70 text-white',
    navy: 'bg-navy text-gold',
  };
  return (
    <div className={cx('flex h-full w-full items-center justify-center', tones[tone], className)}>
      <Icon name={icon} className="size-1/3 opacity-80" />
    </div>
  );
}

/** The site's email, or a visible placeholder until the team confirms one. */
export function ContactEmail({ className }: { className?: string }) {
  if (SITE.contactEmail) {
    return (
      <a href={`mailto:${SITE.contactEmail}`} className={cx('font-semibold underline underline-offset-4', className)}>
        {SITE.contactEmail}
      </a>
    );
  }
  return (
    <span className={cx('inline-block rounded-md border border-dashed border-current px-2 py-0.5 text-sm opacity-70', className)}>
      Contact email to be confirmed
    </span>
  );
}

/** The page-top hero band shared by the inner pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="bg-cream text-navy">
      <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {title}
          <p className="max-w-xl text-lg leading-relaxed text-navy/75">{description}</p>
          {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {aside ? <div className="relative hidden justify-center lg:flex">{aside}</div> : null}
      </Container>
    </section>
  );
}

/** Closing call to action, the navy band at the bottom of most pages. */
export function CtaBand({
  title,
  description,
  primary,
  secondary,
}: {
  title: ReactNode;
  description: ReactNode;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <Section tone="navy" className="relative overflow-hidden">
      <StaffLines className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-cream/[0.06]" />
      <Container className="relative flex max-w-3xl flex-col items-center gap-6 text-center">
        {title}
        <p className="max-w-xl text-base leading-relaxed text-cream/75 md:text-lg">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <PillLink href={primary.href} variant="gold">
            {primary.label}
          </PillLink>
          {secondary ? (
            <PillLink href={secondary.href} variant="light-outline">
              {secondary.label}
            </PillLink>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/** Five faint stave lines, the background texture of the navy bands. */
export function StaffLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden className={cx('h-40 w-full', className)}>
      {[0, 1, 2, 3, 4].map((line) => (
        <path
          key={line}
          d={`M0 ${20 + line * 20} C 300 ${line * 20 - 10}, 600 ${50 + line * 20}, 1200 ${10 + line * 20}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
