'use client';

// The dashboard frame from the Figma "student-dashboard" / "mentor-dashboard"
// designs: a navy sidebar of sections beside the page. Used by the student and
// mentor dashboards and by the staff area. On small screens the sidebar becomes
// a scrolling row of tabs above the content.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './marketing';
import { cx } from './ui';

export interface ShellLink {
  href: string;
  label: string;
  icon: IconName;
  /** Match only the exact path, for an overview page whose children have their own links. */
  exact?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  links,
  children,
}: {
  title: string;
  subtitle?: string;
  links: ShellLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (link: ShellLink) =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-cream lg:flex-row">
      <aside className="shrink-0 bg-navy text-cream lg:w-64">
        <div className="hidden px-6 pt-8 pb-4 lg:block">
          <p className="font-display text-lg font-bold">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-cream/60">{subtitle}</p> : null}
        </div>
        <nav aria-label={title} className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:py-2">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
                  active ? 'bg-cream/15 font-semibold text-cream' : 'text-cream/70 hover:bg-cream/10 hover:text-cream',
                )}
              >
                <Icon name={link.icon} className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}

/** The "Welcome back, Maya!" heading row from the dashboard designs. */
export function DashboardHeading({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-navy/70">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** A white dashboard card with an optional heading row. */
export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx('rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(30,42,68,0.06)]', className)}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="font-display text-lg font-bold text-navy">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(30,42,68,0.06)]">
      <p className="text-xs font-semibold tracking-wider text-navy/60 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy/55">{hint}</p> : null}
    </div>
  );
}
