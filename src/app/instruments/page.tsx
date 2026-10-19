import type { Metadata } from 'next';
import { InstrumentExplorer } from '@/components/instrument-explorer';
import { ArtPanel, Container, CtaBand, Heading, IconBadge, PageHero, Polaroid, Section } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'Instruments',
  description: 'The instruments you can learn with a Note by Note volunteer mentor.',
};

export default function InstrumentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Instruments"
        title={<Heading as="h1" before="Explore" accent="instruments" />}
        description="These are the instruments you can choose when you apply. Lessons start at the beginning, so you don’t need any experience."
        aside={
          <Polaroid caption="Pick one to start" tilt="left" className="w-72">
            <ArtPanel icon="music" tone="sage" />
          </Polaroid>
        }
      />

      <Section tone="white">
        <Container>
          <InstrumentExplorer />
          <p className="mt-10 text-sm text-navy/60">
            Who can teach each instrument depends on our volunteer mentors at the time. We’ll let you know if we
            can’t match you straight away.
          </p>
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0" tone="white">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-gold px-8 py-10 text-navy md:flex-row md:items-center md:justify-between md:px-12">
            <div className="flex items-start gap-5">
              <IconBadge name="help" tone="navy" />
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-bold">Not sure what to choose?</h2>
                <p className="max-w-xl leading-relaxed text-navy/80">
                  Pick the one you’re most curious about. Piano and ukulele are friendly places to start, and
                  music theory pairs with anything. You can tell us you’re unsure in your application.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand
        title={<Heading before="Found your" accent="instrument" after="?" accentTone="gold" className="text-cream" />}
        description="Apply for free lessons and we’ll look for a mentor who plays it."
        primary={{ href: '/apply', label: 'Apply for lessons' }}
        secondary={{ href: '/how-it-works', label: 'How it works' }}
      />
    </>
  );
}
