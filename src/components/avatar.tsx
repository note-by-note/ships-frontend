// A person's photo, or their initials on a colour when there isn't one.
// Photos are only ever approved mentor photos, served publicly by the API.

import { apiUrl } from '@/lib/api';
import { cx } from './ui';

const TONES = ['bg-sky', 'bg-gold', 'bg-sage', 'bg-coral/70'];

export function initialsOf(name: string): string {
  return name
    .replace(/\s*\(test\)$/, '')
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({
  name,
  photoPath,
  className = 'size-10 text-sm',
  tone,
}: {
  name: string;
  photoPath?: string | null;
  /** Size and text size classes. */
  className?: string;
  /** Background for the initials; picked from the name if not given. */
  tone?: string;
}) {
  if (photoPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- served by the API on another origin
      <img
        src={apiUrl(photoPath)}
        alt=""
        className={cx('shrink-0 rounded-full object-cover', className)}
        loading="lazy"
      />
    );
  }
  const fallback = TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      aria-hidden
      className={cx(
        'flex shrink-0 items-center justify-center rounded-full font-display font-bold text-navy',
        tone ?? fallback,
        className,
      )}
    >
      {initialsOf(name) || '♪'}
    </span>
  );
}
