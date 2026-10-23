import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';
import { ContactEmail, Container, Heading, Icon, IconBadge, Section, StickyNote, type IconName } from '@/components/marketing';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Note by Note team.',
};

// Layout follows "contact-page-desktop": hero, "what can we help with" tiles,
// the message form (sent through Formspree, shown once SITE.formspreeFormId is
// set) and direct details.

const TOPICS: { icon: IconName; title: string; body: string; href: string; cta: string }[] = [
  { icon: 'music', title: 'Learning', body: 'Questions about lessons or applying as a student.', href: '/faq', cta: 'Student FAQ' },
  { icon: 'users', title: 'Mentoring', body: 'Thinking about teaching your instrument.', href: '/for-mentors', cta: 'For mentors' },
  { icon: 'code', title: 'Volunteering', body: 'Tech, marketing and outreach teams.', href: '/for-mentors#other-teams', cta: 'See the teams' },
  { icon: 'school', title: 'Schools & partners', body: 'Working with your school or organization.', href: '/partners', cta: 'Partnerships' },
  { icon: 'file', title: 'Your application', body: 'Check the status of something you’ve sent.', href: '/applications', cta: 'My applications' },
  SITE.formspreeFormId
    ? { icon: 'help', title: 'Something else', body: 'Anything that doesn’t fit above.', href: '#message', cta: 'Send a message' }
    : { icon: 'help', title: 'Something else', body: 'Anything that doesn’t fit above.', href: '#email', cta: 'Email us' },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-cream text-navy">
        <Container className="relative flex flex-col gap-4 py-14 md:py-20">
          <Heading as="h1" before="Get in" accent="touch" />
          <p className="max-w-xl text-lg leading-relaxed text-navy/75">
            Questions about lessons, mentoring, volunteering or partnerships? The links below may answer it
            faster. Otherwise, email the team.
          </p>
          <StickyNote className="absolute top-14 right-8 hidden md:block">Say hello ♪</StickyNote>
        </Container>
      </section>

      <Section tone="white" className="pt-10 md:pt-14">
        <Container>
          <h2 className="mb-6 font-display text-2xl font-bold">What can we help with?</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <li key={topic.title}>
                <Link
                  href={topic.href}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-navy/10 bg-cream/60 p-6 transition-colors hover:border-navy/40"
                >
                  <IconBadge name={topic.icon} tone="sky" />
                  <h3 className="font-display text-lg font-bold">{topic.title}</h3>
                  <p className="text-sm leading-relaxed text-navy/70">{topic.body}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-coral">
                    {topic.cta}
                    <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {SITE.formspreeFormId ? (
            <div id="message" className="mt-12 max-w-3xl scroll-mt-24">
              <ContactForm />
            </div>
          ) : null}

          <div
            id="email"
            className="mt-12 grid scroll-mt-24 gap-6 rounded-3xl bg-navy p-8 text-cream md:grid-cols-[auto_1fr] md:items-center md:p-10"
          >
            <IconBadge name="mail" tone="gold" className="size-14" />
            <div>
              <h2 className="font-display text-2xl font-bold">Email the team</h2>
              <p className="mt-1 text-cream/75">Someone from Note by Note will get back to you.</p>
              <p className="mt-4">
                <ContactEmail className="text-cream" />
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
