import type { Metadata } from 'next';
import {
  ArtPanel,
  Container,
  CtaBand,
  Heading,
  IconBadge,
  PageHero,
  PillLink,
  Polaroid,
  Section,
  SectionIntro,
  type IconName,
} from '@/components/marketing';
import { APPLY_LINKS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How students apply, get matched with a volunteer mentor and take free lessons online.',
};

// Layout follows "how-it-works-desktop": a hero, then the student journey as an
// alternating list of steps.

const STUDENT_STEPS: { icon: IconName; tone: 'gold' | 'sage' | 'sky' | 'coral'; title: string; body: string }[] = [
  {
    icon: 'file',
    tone: 'gold',
    title: 'Send an application',
    body: 'Create an account and fill in the student application. Your answers save as you go, so you can finish later.',
  },
  {
    icon: 'music',
    tone: 'sage',
    title: 'Tell us what you want to learn',
    body: 'Choose an instrument, tell us your experience (none is fine), and when you are usually free. Students under 18 add a parent or guardian’s contact details.',
  },
  {
    icon: 'users',
    tone: 'sky',
    title: 'Get matched',
    body: 'Someone on the team reads your application and pairs you with a volunteer mentor based on instrument, level, availability and language.',
  },
  {
    icon: 'calendar',
    tone: 'coral',
    title: 'Agree on a time',
    body: 'You and your mentor find a regular lesson time that works for both of you.',
  },
  {
    icon: 'monitor',
    tone: 'gold',
    title: 'Learn online',
    body: 'Lessons happen over video. Your mentor shows you technique, answers questions and gives you something to practise before next time.',
  },
  {
    icon: 'help',
    tone: 'sage',
    title: 'Ask for help any time',
    body: 'If something isn’t working (the time, the match, anything), get in touch and we’ll sort it out.',
  },
];

const MENTOR_STEPS = [
  { title: 'Apply', body: 'Tell us what you play, what levels you could teach and when you are free.' },
  { title: 'We review it', body: 'Someone on the team reads every application and gets in touch.' },
  { title: 'Get matched', body: 'We introduce you to a student who wants to learn your instrument.' },
  { title: 'Start teaching', body: 'Meet online, share what you know, and help them improve week by week.' },
];

const LESSON_FACTS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'heart', title: 'Free', body: 'There are no lesson fees. Mentors are volunteers.' },
  { icon: 'monitor', title: 'Online', body: 'All you need is a device that can make video calls.' },
  { icon: 'users', title: 'One-on-one', body: 'Each student has their own mentor.' },
  { icon: 'star', title: 'Any level', body: 'Complete beginners are welcome.' },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={<Heading as="h1" before="How Note by Note" accent="works" />}
        description="Students who want to learn an instrument are matched with student volunteers who already play it. Lessons are online and free."
        aside={
          <Polaroid caption="Lesson day" tilt="right" className="w-72">
            <ArtPanel icon="calendar" tone="gold" />
          </Polaroid>
        }
      >
        <PillLink href={APPLY_LINKS.student}>Apply for lessons</PillLink>
        <PillLink href={APPLY_LINKS.mentor} variant="outline">
          Volunteer as a mentor
        </PillLink>
      </PageHero>

      <Section tone="white">
        <Container className="max-w-4xl">
          <SectionIntro
            title={<Heading before="The student" accent="journey" />}
            description="From your application to your first lesson."
          />
          <ol className="relative flex flex-col gap-10 before:absolute before:top-6 before:bottom-6 before:left-6 before:w-0.5 before:bg-stone md:before:left-1/2">
            {STUDENT_STEPS.map((step, index) => (
              <li
                key={step.title}
                className={`relative grid gap-4 pl-16 md:grid-cols-2 md:gap-16 md:pl-0 ${index % 2 ? 'md:[&>div]:col-start-2' : ''}`}
              >
                <IconBadge
                  name={step.icon}
                  tone={step.tone}
                  className="absolute top-0 left-0 md:left-1/2 md:-translate-x-1/2"
                />
                <div className={`flex flex-col gap-2 ${index % 2 ? '' : 'md:text-right'} md:pt-2`}>
                  <p className="text-xs font-semibold tracking-widest text-coral uppercase">Step {index + 1}</p>
                  <h3 className="font-display text-2xl font-bold">{step.title}</h3>
                  <p className="leading-relaxed text-navy/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="mist">
        <Container>
          <SectionIntro
            title={<Heading before="What lessons are like" />}
            description="The basics are the same for every student."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LESSON_FACTS.map((fact) => (
              <li key={fact.title} className="flex flex-col gap-3 rounded-2xl bg-white p-6">
                <IconBadge name={fact.icon} tone="navy" />
                <h3 className="font-display text-xl font-bold">{fact.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{fact.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro
            title={<Heading before="For mentors" />}
            description="Mentors follow a similar path, from the other side."
          />
          <ol className="grid gap-5 md:grid-cols-4">
            {MENTOR_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white/60 p-6">
                <span className="font-display text-3xl font-bold text-gold">{index + 1}</span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <CtaBand
        title={<Heading before="Ready to" accent="start" after="?" accentTone="gold" className="text-cream" />}
        description="Applications are open on our apply page. Questions first? The FAQ covers the common ones."
        primary={{ href: APPLY_LINKS.student, label: 'Apply for lessons' }}
        secondary={{ href: '/faq', label: 'Read the FAQ' }}
      />
    </>
  );
}
