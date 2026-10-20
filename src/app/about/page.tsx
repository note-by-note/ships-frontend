import type { Metadata } from 'next';
import {
  ArtPanel,
  Container,
  CtaBand,
  Eyebrow,
  Heading,
  IconBadge,
  PageHero,
  Polaroid,
  Section,
  SectionIntro,
  type IconName,
} from '@/components/marketing';
import { APPLY_LINKS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'Note by Note is a student-led initiative offering free online music tutoring.',
};

// Layout follows "about-us-desktop": hero, story, values, team. The design's
// statistics band and leadership bios are left out until there is real content.

const GOALS = [
  'Make music learning more accessible through free online tutoring',
  'Connect volunteer musicians with students who want to learn',
  'Give student volunteers meaningful experience on a real project',
  'Build a community around music, teaching and collaboration',
  'Develop tools that make organizing lessons easier',
];

const VALUES: { icon: IconName; tone: 'gold' | 'sage' | 'sky' | 'coral'; title: string; body: string }[] = [
  { icon: 'heart', tone: 'coral', title: 'Accessible', body: 'Cost shouldn’t decide who gets to learn music.' },
  { icon: 'clock', tone: 'gold', title: 'Patient', body: 'Everyone starts somewhere. Beginners are always welcome.' },
  { icon: 'users', tone: 'sage', title: 'Community', body: 'Students teaching students, and learning from each other.' },
  { icon: 'star', tone: 'sky', title: 'Growth', body: 'Small, steady progress, for students and mentors alike.' },
  { icon: 'shield', tone: 'sage', title: 'Trust', body: 'We take the safety and privacy of young learners seriously.' },
  { icon: 'book', tone: 'gold', title: 'Honest', body: 'We say what we can offer, and we don’t overpromise.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={<Heading as="h1" before="About Note by" accent="Note" />}
        description="We’re a student-led initiative offering free online music tutoring. Students who play an instrument volunteer to teach students who want to learn."
        aside={
          <Polaroid caption="Students teaching students" tilt="left" className="w-72">
            <ArtPanel icon="music" tone="gold" />
          </Polaroid>
        }
      />

      <Section tone="white">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Eyebrow>Why we started</Eyebrow>
            <Heading before="Lessons shouldn’t depend on" accent="cost" after="." />
            <p className="leading-relaxed text-navy/75">
              Private music lessons are expensive, so plenty of students who want to learn never get the chance.
              Meanwhile, lots of students already play an instrument well and would happily share what they
              know.
            </p>
            <p className="leading-relaxed text-navy/75">
              Note by Note puts those two groups together. It runs on volunteers and it’s still growing, so the
              website and how we run lessons will keep changing as we learn what works.
            </p>
          </div>
          <div className="rounded-3xl bg-mist p-8">
            <h3 className="font-display text-xl font-bold">What we’re working toward</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {GOALS.map((goal) => (
                <li key={goal} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-coral" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro title={<Heading before="What we" accent="value" />} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <li key={value.title} className="flex gap-4 rounded-2xl bg-white p-6">
                <IconBadge name={value.icon} tone={value.tone} />
                <div>
                  <h3 className="font-display text-lg font-bold">{value.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy/70">{value.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="stone">
        <Container>
          <SectionIntro
            title={<Heading before="Meet the" accent="team" />}
            description="The students organizing and running Note by Note."
          />
          <div className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-navy/25 px-6 py-12 text-center text-navy/60">
            Team profiles are coming soon.
          </div>
        </Container>
      </Section>

      <CtaBand
        title={<Heading before="Want to" accent="help" after="?" accentTone="gold" className="text-cream" />}
        description="Teach as a mentor, or join the tech, marketing or outreach team."
        primary={{ href: APPLY_LINKS.mentor, label: 'Volunteer as a mentor' }}
        secondary={{ href: '/for-mentors#other-teams', label: 'Other ways to volunteer' }}
      />
    </>
  );
}
