import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArtPanel,
  ContactEmail,
  Container,
  Heading,
  Icon,
  IconBadge,
  PageHero,
  PillLink,
  Polaroid,
  Section,
  SectionIntro,
  type IconName,
} from '@/components/public/marketing';
import { PartnerForm } from '@/components/public/partner-form';
import { APPLY_LINKS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Schools & partners',
  description: 'How schools, music programs and community organizations can work with Note by Note.',
};

// Layout follows "partners-page-desktop": hero, what students get, who we work
// with, safety, the process, questions and the sign-up form. The design's
// sponsorship tiers are left out: nothing about sponsorship has been decided.
// Everything here describes how the site works today; keep it that way.

const OFFER: { icon: IconName; title: string; points: string[] }[] = [
  {
    icon: 'music',
    title: 'For students who want lessons',
    points: [
      'Free lessons, with no fees of any kind',
      'One-on-one with their own mentor, over video call',
      'A weekly lesson of 30 to 60 minutes, at a time they agree together',
      'Beginners welcome: no experience needed',
    ],
  },
  {
    icon: 'star',
    title: 'For students who play',
    points: [
      'Teach their instrument to someone who wants to learn',
      'Log their hours on the site, checked by our team',
      'Print a summary of approved hours',
      'Hours may count toward a school’s community service requirement',
    ],
  },
];

const PARTNERS: { icon: IconName; title: string; body: string; ideas: string[] }[] = [
  {
    icon: 'school',
    title: 'Schools',
    body: 'Help students who want lessons find us, and students who play find a way to volunteer.',
    ideas: [
      'Share Note by Note with students and families',
      'Point musicians toward mentoring',
      'Get your school added to the student application',
      'Help with volunteer hours',
    ],
  },
  {
    icon: 'users',
    title: 'Community organizations',
    body: 'Youth groups, libraries and community programs that work with young people.',
    ideas: ['Tell the families you work with', 'Co-host an information session', 'Suggest students who would benefit'],
  },
  {
    icon: 'music',
    title: 'Music programs, teachers & studios',
    body: 'Band directors, private teachers, studios and music programs who want more students to have access to lessons.',
    ideas: [
      'Recommend strong players as mentors',
      'Suggest students who can’t afford lessons',
      'Share resources with our mentors',
      'Tell us what beginners need',
    ],
  },
];

const SAFETY: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'file',
    title: 'Parent or guardian consent',
    body: 'Students under 18 need a parent or guardian to agree before lessons start.',
  },
  {
    icon: 'shield',
    title: 'A Code of Conduct for everyone',
    body: 'Everyone agrees to it when they create an account, and has to accept it before messaging or teaching.',
  },
  {
    icon: 'message',
    title: 'Messages on the site',
    body: 'Mentors and students talk through Note by Note. Messages are kept, and our admins can read them.',
  },
  {
    icon: 'heart',
    title: 'An easy way to raise a concern',
    body: 'Students and mentors can report a message or a worry from their dashboard. Only our admins see reports.',
  },
];

const PROCESS = [
  { title: 'Get in touch', body: 'Fill in the form below, or email us, about your school or organization.' },
  { title: 'Talk it through', body: 'We’ll set up a call to see how we could work together.' },
  { title: 'Share with students', body: 'We provide information you can pass on to students and families.' },
  { title: 'Stay in touch', body: 'We keep you updated as the program grows.' },
];

const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: 'Does it cost students anything?',
    a: 'No. Lessons are free, and students only need a computer, tablet or phone that can make video calls.',
  },
  {
    q: 'Who can take lessons?',
    a: (
      <>
        Students of any age and level, including complete beginners. They apply on our{' '}
        <Link href={APPLY_LINKS.student} className="font-semibold underline underline-offset-4">
          student application
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Who are the mentors?',
    a: (
      <>
        Students who play an instrument and volunteer to teach it. They apply on our{' '}
        <Link href={APPLY_LINKS.mentor} className="font-semibold underline underline-offset-4">
          mentor application
        </Link>
        , and our team reviews each one before they can teach.
      </>
    ),
  },
  {
    q: 'Do mentoring hours count for community service?',
    a: 'Mentors log their hours on the site, our team approves them, and mentors can print a summary. Whether those hours count is up to each school, so check your school’s rules.',
  },
  {
    q: 'What would we need to do?',
    a: 'As much or as little as suits you. Most partners start by telling students and families about Note by Note. Fill in the form below and we’ll work out what makes sense together.',
  },
  {
    q: 'Where can I read your policies?',
    a: (
      <>
        Our{' '}
        <Link href="/code-of-conduct" className="font-semibold underline underline-offset-4">
          Code of Conduct
        </Link>
        ,{' '}
        <Link href="/privacy" className="font-semibold underline underline-offset-4">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/parent-consent" className="font-semibold underline underline-offset-4">
          parent consent page
        </Link>{' '}
        are all public, in English, Spanish, French and Chinese.
      </>
    ),
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Schools & partners"
        title={<Heading as="h1" before="Partner with Note by" accent="Note" />}
        description="We work with schools and organizations to reach students who want music lessons and students who could teach them."
        aside={
          <Polaroid caption="Working together" tilt="right" className="w-72">
            <ArtPanel scene="together" tone="sky" />
          </Polaroid>
        }
      />

      <Section tone="white">
        <Container>
          <SectionIntro
            title={<Heading before="What your students" accent="get" />}
            description="Note by Note is free online music tutoring, run by students."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {OFFER.map((group) => (
              <div key={group.title} className="flex flex-col gap-4 rounded-2xl bg-cream p-7">
                <div className="flex items-center gap-3">
                  <IconBadge name={group.icon} tone="gold" />
                  <h3 className="font-display text-xl font-bold">{group.title}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {group.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm leading-relaxed">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-sage" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro
            title={<Heading before="Who we work with" />}
            description="A few ideas for getting involved. We’re open to others."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {PARTNERS.map((partner) => (
              <li key={partner.title} className="flex flex-col gap-3 rounded-2xl bg-white p-7">
                <IconBadge name={partner.icon} tone="gold" />
                <h3 className="font-display text-xl font-bold">{partner.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{partner.body}</p>
                <ul className="mt-2 flex flex-col gap-2 border-t border-navy/10 pt-4">
                  {partner.ideas.map((idea) => (
                    <li key={idea} className="flex items-start gap-2 text-sm">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-sage" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-sky/40 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-navy/80">
              <strong className="text-navy">Students at partner schools:</strong> your school is added to the list students
              choose from when they apply, so we can see how many of your students take part.
            </p>
            <PillLink href="#partner-form" className="shrink-0">
              Become a partner
            </PillLink>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionIntro
            title={<Heading before="Keeping students" accent="safe" />}
            description="Many of our students are under 18, so safety is built into how the site works."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAFETY.map((item) => (
              <li key={item.title} className="flex flex-col gap-3">
                <IconBadge name={item.icon} tone="gold" />
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="mist">
        <Container>
          <SectionIntro title={<Heading before="How it" accent="works" />} />
          <ol className="grid gap-6 md:grid-cols-4">
            {PROCESS.map((step, index) => (
              <li key={step.title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-navy font-display text-xl font-bold text-gold">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="max-w-[16rem] text-sm leading-relaxed text-navy/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="white">
        <Container className="max-w-3xl">
          <SectionIntro title={<Heading before="Questions from" accent="partners" />} />
          <div className="flex flex-col gap-3">
            {QUESTIONS.map((item) => (
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
        </Container>
      </Section>

      <Section id="partner-form" className="scroll-mt-16">
        <Container className="max-w-3xl">
          <PartnerForm />
          <p className="mt-6 text-center text-sm text-navy/70">
            Prefer email? Write to us at <ContactEmail />
          </p>
        </Container>
      </Section>
    </>
  );
}
