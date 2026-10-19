import type { Metadata } from 'next';
import {
  ArtPanel,
  Container,
  CtaBand,
  Heading,
  Icon,
  IconBadge,
  PageHero,
  PillLink,
  Polaroid,
  Section,
  SectionIntro,
  StickyNote,
  type IconName,
} from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Become a mentor',
  description:
    'Volunteer as a Note by Note music mentor: teach a student your instrument, online. No professional experience needed.',
};

// Layout follows "become-a-mentor-desktop": hero, why volunteer, what mentors
// do, a navy band, then other volunteer teams.

const WHY: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'heart',
    title: 'Help someone start',
    body: 'Many students never get lessons because of the cost. You can be the reason someone plays their first song.',
  },
  {
    icon: 'calendar',
    title: 'Fits around school',
    body: 'Lessons are online, and you and your student agree on a time that works for both of you.',
  },
  {
    icon: 'users',
    title: 'Join a team',
    body: 'Work alongside other students who care about music, and get real experience teaching.',
  },
];

const RESPONSIBILITIES = [
  'Meet your student online for regular lessons',
  'Teach technique and the musical ideas behind it',
  'Answer questions and help them practise',
  'Give clear, encouraging feedback',
  'Help them make progress over time',
];

const NEEDS = [
  'You play an instrument well enough to teach a beginner',
  'You’re patient and can explain things clearly',
  'A computer, tablet or phone that can make video calls',
  'Time for a regular lesson with your student',
];

const TEAMS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'code',
    title: 'Tech team',
    body: 'Frontend, backend and debugging. Help build this website and the tools that run lessons.',
  },
  {
    icon: 'megaphone',
    title: 'Marketing team',
    body: 'Graphics, video editing, social media and promotional content.',
  },
  {
    icon: 'school',
    title: 'Outreach team',
    body: 'Contact schools and organizations, and help recruit mentors and students.',
  },
];

export default function ForMentorsPage() {
  return (
    <>
      <PageHero
        eyebrow="For mentors"
        title={<Heading as="h1" before="Share what you know." accent="Help someone learn." />}
        description="Mentors are students who play an instrument and volunteer to teach it to someone else, online and for free. You don’t need to be a professional musician or a trained teacher."
        aside={
          <div className="relative">
            <Polaroid caption="Your first student" tilt="right" className="w-72">
              <ArtPanel icon="users" tone="coral" />
            </Polaroid>
            <StickyNote className="absolute -bottom-6 -left-10">Teach what you love ♪</StickyNote>
          </div>
        }
      >
        <PillLink href="/apply">Apply to be a mentor</PillLink>
        <PillLink href="#other-teams" variant="outline">
          Other ways to volunteer
        </PillLink>
      </PageHero>

      <Section tone="mist">
        <Container>
          <SectionIntro title={<Heading before="Why volunteer" accent="with us" />} />
          <ul className="grid gap-6 md:grid-cols-3">
            {WHY.map((item) => (
              <li key={item.title} className="flex flex-col gap-3 rounded-2xl bg-white p-7">
                <IconBadge name={item.icon} tone="gold" />
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading before="What mentors do" className="mb-6" />
            <ul className="flex flex-col gap-4">
              {RESPONSIBILITIES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sage text-white">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(30,42,68,0.08)]">
            <p className="text-xs font-semibold tracking-widest text-coral uppercase">What you’ll need</p>
            <ul className="mt-5 flex flex-col gap-4">
              {NEEDS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-navy/10 pt-5 text-sm text-navy/70">
              Volunteer hours may count toward your school’s community service requirement.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="navy" className="py-12 md:py-14">
        <Container className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          <IconBadge name="shield" tone="gold" className="size-14" />
          <div>
            <h2 className="font-display text-2xl font-bold">Many of our students are under 18</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-cream/75">
              Mentors are trusted with young learners. Lessons are online, and we ask for a parent or guardian’s
              contact details for every student under 18.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="stone" id="other-teams" className="scroll-mt-16">
        <Container>
          <SectionIntro
            title={<Heading before="There’s more than one way to" accent="volunteer" after="." />}
            description="Not looking to teach? These teams keep Note by Note running."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {TEAMS.map((team) => (
              <li key={team.title} className="flex flex-col gap-3 rounded-2xl bg-white p-7">
                <IconBadge name={team.icon} tone="sage" />
                <h3 className="font-display text-xl font-bold">{team.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{team.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <PillLink href="/apply">See open volunteer applications</PillLink>
          </div>
        </Container>
      </Section>

      <CtaBand
        title={<Heading before="Ready to" accent="teach" after="?" accentTone="gold" className="text-cream" />}
        description="Apply to be a mentor. Someone on the team reads every application and will be in touch."
        primary={{ href: '/apply', label: 'Apply to be a mentor' }}
        secondary={{ href: '/faq', label: 'Read the FAQ' }}
      />
    </>
  );
}
