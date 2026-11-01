import type { Metadata } from 'next';
import Link from 'next/link';
import { ApplyHub } from '@/components/apply-hub';
import { Container, Heading, IconBadge, StickyNote, type IconName } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Apply',
  description: 'Apply for free music lessons, volunteer as a mentor, or join the Note by Note team.',
};

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'users',
    title: 'Sign in or create an account',
    body: 'You can do it from inside the application, so nothing you’ve typed is lost.',
  },
  {
    icon: 'file',
    title: 'Answer a few short sections',
    body: 'Your answers save as you go. Come back and finish whenever you like.',
  },
  {
    icon: 'mail',
    title: 'Hear back from us',
    body: 'Someone on the team reads every application and gets in touch by email.',
  },
];

export default function ApplyIndexPage() {
  return (
    <div className="bg-cream text-navy">
      <section className="relative overflow-hidden">
        <Container className="relative pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase opacity-70">Applications</p>
            <Heading
              as="h1"
              before="Find your place at"
              accent={<span className="whitespace-nowrap">Note by Note</span>}
              className="mt-3"
            />
            <p className="mt-5 text-lg leading-relaxed text-navy/75">
              Choose what fits you below. Every application is read by a person, and you can save your progress
              and come back to finish.
            </p>
          </div>
          <StickyNote className="absolute top-16 right-10 hidden lg:block">
            Free lessons,
            <br />
            real people ♪
          </StickyNote>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <ApplyHub />
          <p className="mt-10 text-center text-sm text-navy/65">
            Already started one?{' '}
            <Link href="/applications" className="font-semibold text-navy underline underline-offset-4">
              Continue from My applications
            </Link>
          </p>
        </Container>
      </section>

      <section className="bg-navy py-16 text-cream md:py-20">
        <Container>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            How applying <span className="text-gold">works</span>
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <IconBadge name={step.icon} tone="gold" className="size-14" />
                  <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-cream text-xs font-bold text-navy">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-cream/75">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-center text-sm text-cream/70">
            Questions first?{' '}
            <Link href="/faq" className="font-semibold text-cream underline underline-offset-4">
              Read the FAQ
            </Link>
          </p>
        </Container>
      </section>
    </div>
  );
}
