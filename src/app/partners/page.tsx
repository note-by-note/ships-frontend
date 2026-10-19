import type { Metadata } from 'next';
import {
  ArtPanel,
  ContactEmail,
  Container,
  Heading,
  Icon,
  IconBadge,
  PageHero,
  Polaroid,
  Section,
  SectionIntro,
  type IconName,
} from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Schools & partners',
  description: 'How schools and community organizations can work with Note by Note.',
};

// Layout follows "partners-page-desktop": hero, who we work with, the process,
// and an enquiry block. The design's sponsorship tiers are left out — nothing
// about sponsorship has been decided.

const PARTNERS: { icon: IconName; title: string; body: string; ideas: string[] }[] = [
  {
    icon: 'school',
    title: 'Schools',
    body: 'Help students who want lessons find us, and students who play find a way to volunteer.',
    ideas: ['Share Note by Note with students and families', 'Point musicians toward mentoring', 'Help with volunteer hours'],
  },
  {
    icon: 'users',
    title: 'Community organizations',
    body: 'Youth groups, libraries and community programs that work with young people.',
    ideas: ['Tell the families you work with', 'Co-host an information session', 'Suggest students who would benefit'],
  },
  {
    icon: 'music',
    title: 'Music programs & teachers',
    body: 'Band directors, music teachers and programs who want more students to have access to lessons.',
    ideas: ['Recommend strong players as mentors', 'Share resources with our mentors', 'Tell us what beginners need'],
  },
];

const PROCESS = [
  { title: 'Get in touch', body: 'Email us about your school or organization and what you have in mind.' },
  { title: 'Talk it through', body: 'We’ll set up a call to see how we could work together.' },
  { title: 'Share with students', body: 'We provide information you can pass on to students and families.' },
  { title: 'Stay in touch', body: 'We keep you updated as the program grows.' },
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
            <ArtPanel icon="school" tone="sky" />
          </Polaroid>
        }
      />

      <Section tone="white">
        <Container>
          <SectionIntro
            title={<Heading before="Who we work with" />}
            description="A few ideas for getting involved. We’re open to others."
          />
          <ul className="grid gap-6 md:grid-cols-3">
            {PARTNERS.map((partner) => (
              <li key={partner.title} className="flex flex-col gap-3 rounded-2xl bg-cream p-7">
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

      <Section>
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-navy px-8 py-12 text-center text-cream">
            <IconBadge name="mail" tone="gold" className="size-14" />
            <h2 className="font-display text-3xl font-bold">Start a conversation</h2>
            <p className="max-w-lg leading-relaxed text-cream/75">
              Tell us about your school or organization and how you’d like to work together.
            </p>
            <ContactEmail className="text-cream" />
          </div>
        </Container>
      </Section>
    </>
  );
}
