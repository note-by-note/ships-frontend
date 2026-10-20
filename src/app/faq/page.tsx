import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ContactEmail, Container, Heading, Icon, IconBadge, PillLink, Section } from '@/components/marketing';
import { APPLY_LINKS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about Note by Note lessons, mentoring and volunteering.',
};

// Layout follows "faq-page-desktop": grouped, expandable questions with a
// "still have questions?" card. Answers only state what the program actually
// does; anything undecided is left out rather than guessed.

const GROUPS: { title: string; questions: { q: string; a: ReactNode }[] }[] = [
  {
    title: 'For students and families',
    questions: [
      {
        q: 'Is it really free?',
        a: 'Yes. There are no lesson fees. Our mentors are volunteers.',
      },
      {
        q: 'Who teaches the lessons?',
        a: 'Student volunteers who play the instrument and want to help others learn it. They aren’t necessarily professional musicians or trained teachers. They’re people who know their instrument and explain it patiently.',
      },
      {
        q: 'How are lessons held?',
        a: 'Online, over video. You’ll need a computer, tablet or phone that can make video calls.',
      },
      {
        q: 'Do I need any experience?',
        a: 'No. Complete beginners are welcome, and lessons start at the beginning.',
      },
      {
        q: 'Do I need my own instrument?',
        a: 'You’ll need access to the instrument you want to learn so you can practise. The application asks about this, so let us know if it’s a problem.',
      },
      {
        q: 'How does matching work?',
        a: 'Someone on the team reads your application and pairs you with a mentor based on your instrument, level, availability and language.',
      },
      {
        q: 'When are lessons?',
        a: 'You and your mentor agree on a regular time that works for both of you.',
      },
      {
        q: 'What about students under 18?',
        a: 'We ask for a parent or guardian’s contact details as part of the application for every student under 18.',
      },
    ],
  },
  {
    title: 'For mentors',
    questions: [
      {
        q: 'Do I need teaching experience?',
        a: 'No. If you play an instrument well enough to help a beginner, and you’re patient, you can apply.',
      },
      {
        q: 'What does a mentor do?',
        a: 'Meet your student online, teach technique and musical ideas, answer questions, give feedback and help them make progress over time.',
      },
      {
        q: 'Can I count volunteer hours?',
        a: 'Volunteer hours may be available if you want to count your time toward a community service requirement.',
      },
      {
        q: 'How do I apply?',
        a: (
          <>
            Fill in the <Link href={APPLY_LINKS.mentor} className="underline underline-offset-2">mentor application</Link>. Someone on the team
            reads every application.
          </>
        ),
      },
    ],
  },
  {
    title: 'Volunteering and partnerships',
    questions: [
      {
        q: 'I don’t play an instrument. Can I still help?',
        a: (
          <>
            Yes. Our tech, marketing and outreach teams all need volunteers.{' '}
            <Link href="/for-mentors#other-teams" className="underline underline-offset-2">
              See the teams
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Can my school or organization work with you?',
        a: (
          <>
            We’d like that. Have a look at our{' '}
            <Link href="/partners" className="underline underline-offset-2">
              partners page
            </Link>{' '}
            and get in touch.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-cream text-navy">
        <Container className="flex flex-col items-center gap-4 py-14 text-center md:py-20">
          <Heading as="h1" before="Frequently asked" accent="questions" />
          <p className="max-w-xl text-lg text-navy/75">
            Common questions about lessons, mentoring and volunteering.
          </p>
        </Container>
      </section>

      <Section tone="white" className="pt-10 md:pt-14">
        <Container className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-12">
            {GROUPS.map((group) => (
              <section key={group.title} aria-labelledby={group.title}>
                <h2 id={group.title} className="mb-4 font-display text-2xl font-bold">
                  {group.title}
                </h2>
                <div className="flex flex-col gap-3">
                  {group.questions.map((item) => (
                    <details key={item.q} className="group rounded-xl border border-navy/10 bg-cream/60 open:bg-cream">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold">
                        {item.q}
                        <span
                          aria-hidden
                          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-sm transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="px-5 pb-5 leading-relaxed text-navy/75">{item.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="h-max rounded-3xl bg-navy p-7 text-cream lg:sticky lg:top-24">
            <IconBadge name="help" tone="gold" />
            <h2 className="mt-4 font-display text-2xl font-bold">Still have questions?</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">Get in touch and someone from the team will reply.</p>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Icon name="mail" className="size-4 shrink-0" />
              <ContactEmail className="text-cream" />
            </p>
            <PillLink href="/contact" variant="gold" className="mt-6 w-full">
              Contact us
            </PillLink>
          </aside>
        </Container>
      </Section>
    </>
  );
}
