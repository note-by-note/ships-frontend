import Link from 'next/link';
import {
  ArrowLink,
  ArtPanel,
  ContactEmail,
  Container,
  CtaBand,
  Eyebrow,
  Heading,
  Icon,
  IconBadge,
  PillLink,
  Polaroid,
  Section,
  SectionIntro,
  StickyNote,
  type IconName,
} from '@/components/marketing';
import { APPLY_LINKS } from '@/lib/site';

// Layout follows "note-by-note-homepage-desktop" in the Figma file. Copy is
// rewritten to the brand voice, and the design's sample statistics, mentors and
// testimonials are left out until there are real ones to show.

const STEPS: { icon: IconName; tone: 'gold' | 'sage' | 'sky'; title: string; body: string }[] = [
  {
    icon: 'file',
    tone: 'gold',
    title: '1. Apply',
    body: 'Tell us which instrument you want to learn, your experience and when you are free.',
  },
  {
    icon: 'users',
    tone: 'sage',
    title: '2. Get matched',
    body: 'We pair you with a volunteer mentor who plays your instrument and fits your schedule.',
  },
  {
    icon: 'monitor',
    tone: 'sky',
    title: '3. Learn online',
    body: 'Meet your mentor for lessons over video, and practise what you worked on in between.',
  },
];

const INSTRUMENTS: { name: string; detail: string; tone: string }[] = [
  { name: 'Piano', detail: 'Keys', tone: 'bg-sky/50' },
  { name: 'Guitar', detail: 'Strings', tone: 'bg-gold/50' },
  { name: 'Violin', detail: 'Strings', tone: 'bg-coral/40' },
  { name: 'Woodwinds', detail: 'Flute, clarinet, sax…', tone: 'bg-sage/50' },
  { name: 'Brass', detail: 'Trumpet, trombone…', tone: 'bg-gold/40' },
  { name: 'Percussion', detail: 'Drums & mallets', tone: 'bg-sky/40' },
  { name: 'Ukulele', detail: 'Strings', tone: 'bg-sage/40' },
  { name: 'Music theory', detail: 'For any instrument', tone: 'bg-coral/30' },
];

const MENTOR_POINTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'star',
    title: 'You don’t need to be a pro',
    body: 'If you play an instrument and can explain it patiently, you can help a beginner get started.',
  },
  {
    icon: 'monitor',
    title: 'Teach from home',
    body: 'Lessons happen online, at a time that works for you and your student.',
  },
  {
    icon: 'clock',
    title: 'Count your hours',
    body: 'Volunteer hours may count toward your school’s community service requirement.',
  },
];

const TEAMS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'code', title: 'Tech', body: 'Build and improve this website and the tools behind lessons.' },
  { icon: 'megaphone', title: 'Marketing', body: 'Make graphics and videos, and run our social media.' },
  { icon: 'school', title: 'Outreach', body: 'Connect with schools and partners, and help recruit mentors.' },
];

const FACTS = [
  { value: 'Free', label: 'No lesson fees, ever' },
  { value: 'Online', label: 'Learn from home' },
  { value: '1-on-1', label: 'Your own mentor' },
  { value: 'Student-run', label: 'Organised by volunteers' },
];

const PATHWAYS = [
  { href: APPLY_LINKS.mentor, label: 'Volunteer as a mentor', tone: 'bg-gold/30' },
  { href: '/partners', label: 'Partner with us', tone: 'bg-sage/30' },
  { href: '/faq', label: 'Read the FAQ', tone: 'bg-sky/30' },
  { href: '/contact', label: 'Other questions', tone: 'bg-white' },
];

export default function HomePage() {
  return (
    <div className="bg-cream text-navy">
      {/* Hero */}
      <section>
        <Container className="grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-6">
            <Heading as="h1" before="Every musician deserves a" accent="first note" after="." />
            <p className="max-w-xl text-lg leading-relaxed text-navy/75">
              Free online music lessons, taught one-on-one by student volunteers who play the instrument you
              want to learn.
            </p>
            <div className="flex flex-wrap gap-3">
              <PillLink href={APPLY_LINKS.student}>Apply for lessons</PillLink>
              <PillLink href={APPLY_LINKS.mentor} variant="outline">
                Volunteer as a mentor
              </PillLink>
            </div>
            <p className="max-w-sm text-sm font-semibold text-navy/80">
              Run by students who think music lessons shouldn’t depend on what a family can afford.
            </p>
          </div>

          <HeroArt />
        </Container>
      </section>

      {/* Mission */}
      <Section tone="mist">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <MissionArt />
          <div className="flex flex-col gap-5 rounded-3xl bg-white/50 p-8 md:p-10">
            <Eyebrow>Our mission</Eyebrow>
            <Heading before="Music lessons, without the" accent="price tag" after="." />
            <p className="leading-relaxed text-navy/75">
              Private lessons are expensive, and plenty of students who want to learn never get the chance.
              Note by Note connects students who already play with students who want to start, online and
              free.
            </p>
            <ArrowLink href="/about" className="w-max">
              More about us
            </ArrowLink>
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section>
        <Container>
          <SectionIntro
            title={<Heading before="How it works" />}
            description="Three steps from application to your first lesson."
          />
          <ol className="grid gap-6 rounded-3xl bg-stone p-6 md:grid-cols-3 md:p-10">
            {STEPS.map((step) => (
              <li key={step.title} className="flex flex-col items-center gap-3 text-center">
                <IconBadge name={step.icon} tone={step.tone} className="size-14" />
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-navy/70">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <ArrowLink href="/how-it-works">The full process</ArrowLink>
          </div>
        </Container>
      </Section>

      {/* Instruments */}
      <Section className="pt-0 md:pt-0">
        <Container>
          <SectionIntro
            title={<Heading before="Choose your instrument" />}
            description="Lessons start from the beginning. No experience needed."
          />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {INSTRUMENTS.map((instrument, index) => (
              <li key={instrument.name}>
                <Link
                  href="/instruments"
                  className={`group flex h-full flex-col rounded-2xl bg-stone p-3 shadow-[0_6px_18px_rgba(30,42,68,0.08)] transition-transform hover:-translate-y-1 ${
                    index % 2 ? 'rotate-1' : '-rotate-1'
                  } hover:rotate-0`}
                >
                  <div
                    className={`flex aspect-[4/3] items-center justify-center rounded-xl ${instrument.tone} font-display text-5xl font-bold text-navy/80`}
                  >
                    {instrument.name.charAt(0)}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-1 pt-3 pb-1">
                    <span className="font-display text-lg font-bold">{instrument.name}</span>
                    <span className="text-xs text-navy/60">{instrument.detail}</span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-coral">
                      Learn more <Icon name="arrow" className="size-3.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <ArrowLink href="/instruments">See every instrument we teach</ArrowLink>
          </div>
        </Container>
      </Section>

      {/* Mentor recruitment */}
      <Section tone="navy">
        <Container>
          <SectionIntro
            eyebrow="Become a mentor"
            title={<Heading before="Share what you know." accent="Help someone learn." accentTone="gold" />}
            description="Mentors are students who play an instrument and want to help someone else learn it."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {MENTOR_POINTS.map((point, index) => (
              <li
                key={point.title}
                className={`flex flex-col gap-3 rounded-2xl bg-cream p-6 text-navy shadow-lg ${
                  index === 1 ? 'md:rotate-1' : index === 2 ? 'md:-rotate-1' : ''
                }`}
              >
                <IconBadge name={point.icon} tone="gold" />
                <h3 className="font-display text-xl font-bold">{point.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{point.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <PillLink href={APPLY_LINKS.mentor} variant="gold">
              Volunteer as a mentor
            </PillLink>
            <ArrowLink href="/for-mentors" className="text-cream">
              What mentors do
            </ArrowLink>
          </div>
        </Container>
      </Section>

      {/* Other ways to volunteer */}
      <Section tone="stone">
        <Container>
          <SectionIntro
            title={<Heading before="There’s more than one way to" accent="volunteer" after="." />}
            description="Not a musician? Our tech, marketing and outreach teams keep Note by Note running."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {TEAMS.map((team) => (
              <li key={team.title} className="flex flex-col gap-3 rounded-2xl bg-white p-6">
                <IconBadge name={team.icon} tone="sage" />
                <h3 className="font-display text-xl font-bold">{team.title}</h3>
                <p className="text-sm leading-relaxed text-navy/70">{team.body}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid grid-cols-2 gap-6 rounded-3xl bg-sage/80 px-6 py-10 text-center text-white md:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.value} className="flex flex-col gap-1">
                <dt className="order-2 text-sm text-white/85">{fact.label}</dt>
                <dd className="order-1 font-display text-3xl font-bold">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-sm text-navy/70">
            <strong className="text-navy">We’re just getting started.</strong> Volunteer with us and help shape
            what Note by Note becomes.
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href={APPLY_LINKS.volunteer}>Apply to volunteer</PillLink>
          </div>
        </Container>
      </Section>

      <CtaBand
        title={
          <Heading before="Ready to play your" accent="first note" after="?" accentTone="gold" className="text-cream" />
        }
        description="Apply for free lessons, or volunteer to teach what you already know."
        primary={{ href: APPLY_LINKS.student, label: 'Apply for lessons' }}
        secondary={{ href: APPLY_LINKS.mentor, label: 'Volunteer as a mentor' }}
      />

      {/* Contact */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-4">
            <Heading before="We’d love to hear from you" />
            <p className="max-w-lg leading-relaxed text-navy/75">
              Questions about lessons, mentoring or working with your school? Get in touch and someone from the
              team will reply.
            </p>
            <p className="flex items-center gap-3">
              <Icon name="mail" className="size-5 shrink-0" />
              <ContactEmail />
            </p>
          </div>
          <nav aria-label="Quick pathways" className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-bold">Quick pathways</h3>
            {PATHWAYS.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className={`flex items-center justify-between rounded-xl ${pathway.tone} px-5 py-4 text-sm font-semibold transition-colors hover:bg-navy hover:text-cream`}
              >
                {pathway.label}
                <Icon name="arrow" className="size-4" />
              </Link>
            ))}
          </nav>
        </Container>
      </Section>
    </div>
  );
}

/** Stand-in for the hero photo collage: sky arch, Polaroid and sticky note. */
function HeroArt() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[460px] md:h-[400px]" aria-hidden>
      <div className="absolute top-0 right-0 h-[88%] w-[78%] overflow-hidden rounded-t-[200px] rounded-b-[40px] border-[10px] border-sky bg-sky/40">
        <svg viewBox="0 0 300 300" className="h-full w-full text-navy/70">
          {[0, 1, 2, 3, 4].map((line) => (
            <line key={line} x1="0" x2="300" y1={110 + line * 18} y2={110 + line * 18} stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          ))}
          {[
            [60, 155],
            [110, 128],
            [160, 146],
            [210, 110],
            [250, 137],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="11" ry="8" transform={`rotate(-20 ${x} ${y})`} fill="currentColor" />
              <line x1={x + 10} x2={x + 10} y1={y} y2={y - 52} stroke="currentColor" strokeWidth="3" />
            </g>
          ))}
        </svg>
      </div>
      <Polaroid caption="First lesson" className="absolute bottom-2 left-0 w-[52%]">
        <ArtPanel icon="music" tone="navy" />
      </Polaroid>
      <StickyNote className="absolute right-2 bottom-12">
        You can do this!
        <br />
        Keep playing ♪
      </StickyNote>
    </div>
  );
}

/** Stand-in for the mission photo collage. */
function MissionArt() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[440px]" aria-hidden>
      <Polaroid caption="Practice time" tilt="left" className="absolute top-4 left-0 w-[62%]">
        <ArtPanel icon="music" tone="coral" />
      </Polaroid>
      <Polaroid caption="Online lessons" tilt="right" className="absolute right-0 bottom-0 w-[50%]">
        <ArtPanel icon="monitor" tone="sky" />
      </Polaroid>
      <span className="absolute top-0 right-6 flex size-24 items-center justify-center rounded-full bg-gold p-3 text-center font-display text-[11px] leading-tight font-bold tracking-wide text-navy uppercase">
        Community · Music · Learning
      </span>
    </div>
  );
}
