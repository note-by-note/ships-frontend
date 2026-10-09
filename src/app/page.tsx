import Link from 'next/link';
import { ButtonLink } from '@/components/ui';

const PATHS = [
  {
    href: '/apply',
    title: 'Learn an instrument',
    body: 'Apply as a student and we will match you with a mentor who teaches what you want to play.',
  },
  {
    href: '/apply',
    title: 'Teach with us',
    body: 'Mentors bring their instrument and their patience. We handle matching and scheduling.',
  },
  {
    href: '/apply',
    title: 'Join the team',
    body: 'Open roles at Note by Note, listed alongside everything else.',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="py-20 sm:py-28">
        <p className="text-sm font-medium text-accent">Music mentorship</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Every student gets a person, not a curriculum.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          Note by Note pairs students with mentors who teach the instrument and the music they
          actually want to play. Applications are read by hand, one at a time.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/apply" size="lg">
            Start an application
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary" size="lg">
            Sign in
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-4 border-t border-line py-16 sm:grid-cols-3">
        {PATHS.map((path) => (
          <Link
            key={path.title}
            href={path.href}
            className="group rounded-card border border-line bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <h2 className="font-medium text-ink group-hover:text-accent">{path.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{path.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
