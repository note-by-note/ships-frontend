'use client';

// Form controls. Every one wires its own label, help text and error message
// together with ids so the association survives — a required-field error that
// is only red is not an error message to a screen reader.

import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';
import { cx } from './index';

const CONTROL =
  'w-full rounded-lg border bg-surface px-3 py-2 text-ink placeholder:text-ink-faint ' +
  'transition-colors focus:border-accent disabled:bg-paper disabled:text-ink-faint';

function controlClass(invalid?: boolean, className?: string) {
  return cx(CONTROL, invalid ? 'border-danger' : 'border-line-strong', className);
}

export interface FieldShellProps {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}

export function Field({ label, help, error, required, children }: FieldShellProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-ink-faint">Optional</span>
        )}
      </label>
      {help ? (
        <p id={helpId} className="text-sm text-ink-soft">
          {help}
        </p>
      ) : null}
      {children({ id, describedBy })}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ invalid, className, ...props }: ComponentProps<'input'> & { invalid?: boolean }) {
  return <input className={controlClass(invalid, className)} {...props} />;
}

export function TextArea({ invalid, className, ...props }: ComponentProps<'textarea'> & { invalid?: boolean }) {
  return <textarea rows={5} className={cx(controlClass(invalid, className), 'resize-y')} {...props} />;
}

export function Select({ invalid, className, ...props }: ComponentProps<'select'> & { invalid?: boolean }) {
  return <select className={controlClass(invalid, className)} {...props} />;
}

/**
 * A group of radios or checkboxes.
 *
 * `fieldset`/`legend` rather than a label: a group of inputs needs a group
 * label, and this is the only markup that gives one to assistive tech.
 */
export function ChoiceGroup({
  label,
  help,
  error,
  required,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <fieldset
      className="space-y-1.5"
      aria-describedby={[help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
    >
      <legend className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-ink-faint">Optional</span>
        )}
      </legend>
      {help ? (
        <p id={helpId} className="text-sm text-ink-soft">
          {help}
        </p>
      ) : null}
      <div className="space-y-1.5 pt-1">{children}</div>
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ChoiceRow({
  type,
  checked,
  onChange,
  label,
  name,
}: {
  type: 'radio' | 'checkbox';
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name?: string;
}) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
        checked ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-ink-soft hover:border-line-strong',
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
      />
      <span>{label}</span>
    </label>
  );
}
