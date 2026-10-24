'use client';

// Small primitives shared by the applicant wizard, the form editor and the
// review queue. Deliberately unabstracted: each is a styled element with a
// couple of variants, not a component framework.

import Link from 'next/link';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// --- Buttons -----------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-accent-soft hover:text-ink',
  danger: 'border border-danger/30 bg-danger-soft text-danger hover:bg-danger/10',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-6',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: keyof typeof BUTTON_SIZES }) {
  return (
    <button
      type="button"
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: keyof typeof BUTTON_SIZES }) {
  return (
    <Link
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...props}
    />
  );
}

// --- Surfaces ----------------------------------------------------------------

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cx('rounded-card border border-line bg-surface', className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1.5 text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="px-6 py-14 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}

// --- Status ------------------------------------------------------------------

type Tone = 'neutral' | 'accent' | 'warn' | 'danger' | 'ok';

const TONES: Record<Tone, string> = {
  neutral: 'bg-paper text-ink-soft border-line-strong',
  accent: 'bg-accent-soft text-accent border-accent/25',
  warn: 'bg-warn-soft text-warn border-warn/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
  ok: 'bg-ok-soft text-ok border-ok/25',
};

export function Badge({ tone = 'neutral', className, ...props }: ComponentProps<'span'> & { tone?: Tone }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Maps every application status to a tone once, so the queue and the detail page agree. */
export const STATUS_TONES: Record<string, Tone> = {
  draft: 'neutral',
  submitted: 'accent',
  under_review: 'warn',
  accepted: 'ok',
  waitlisted: 'warn',
  rejected: 'danger',
  withdrawn: 'neutral',
  published: 'ok',
  closed: 'neutral',
  archived: 'neutral',
};

export function humanize(value: string): string {
  return value.replace(/_/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{humanize(status)}</Badge>;
}

/**
 * An error the user is meant to act on. `role="alert"` so it is announced the
 * moment it appears — a validation summary that only appears visually is
 * invisible to anyone filling the form by screen reader.
 */
export function Alert({ tone = 'danger', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div
      role="alert"
      className={cx('rounded-lg border px-4 py-3 text-sm', TONES[tone])}
    >
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-sm text-ink-faint">
      <div className="flex items-center justify-center gap-3">
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-accent"
        />
        <span>{label}…</span>
      </div>
      <SlowNotice />
    </div>
  );
}

/**
 * Shown under a loading message that has taken a while. The API's free
 * hosting sleeps when the site is quiet, and the first visit after that waits
 * for it to wake up.
 */
export function SlowNotice({ after = 5000 }: { after?: number }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), after);
    return () => window.clearTimeout(timer);
  }, [after]);

  if (!shown) return null;
  return (
    <p role="status" className="mt-3 max-w-xs text-center text-xs text-ink-faint">
      Still loading. If the site has been quiet for a while, it takes up to a minute to wake up.
    </p>
  );
}
