import type { Metadata } from 'next';
import Link from 'next/link';
import { MentorDirectory } from '@/components/mentor-directory';
import { APPLY_LINKS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Find a Mentor',
  description: 'Browse volunteer music mentors offering free online lessons.',
};

const STEPS = [
  {
    tone: 'bg-gold',
    title: '1. Browse mentors',
    body: 'Filter by instrument and language to see who teaches what you want to play.',
  },
  {
    tone: 'bg-sage',
    title: '2. Send a request',
    body: 'Tell us who caught your eye. A real person reads every application.',
  },
  {
    tone: 'bg-sky',
    title: '3. Start learning',
    body: 'We confirm a weekly time that works for you both, then lessons begin online.',
  },
];

export default function FindAMentorPage() {
  return (
    <div className="bg-cream text-navy">
      {/* Hero */}
      <section className="px-5 pt-12 pb-10 md:px-10 lg:px-20 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-wide text-navy/70 uppercase">Find a mentor</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] font-bold md:text-5xl lg:text-[64px]">
            Find the mentor for your <span className="text-coral">first note</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-normal text-navy/75">
            Every mentor here is a volunteer who loves their instrument. Lessons are free, online and
            one-on-one. Pick someone who sounds right, and we&apos;ll handle the rest.
          </p>
        </div>
      </section>

      {/* Directory */}
      <section aria-labelledby="mentors-heading" className="px-5 pb-20 md:px-10 lg:px-20 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 id="mentors-heading" className="sr-only">
            Mentors
          </h2>
          <MentorDirectory />
        </div>
      </section>

      {/* How matching works */}
      <section className="bg-sky/25 px-5 py-16 md:px-10 lg:px-20 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-14">
          <div className="flex max-w-[680px] flex-col gap-4 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-[48px]">How matching works</h2>
            <p className="text-base text-navy/60 lg:text-lg">
              Not sure who to pick? Apply anyway, and we&apos;ll match you on availability and goals.
            </p>
          </div>
          <ol className="grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col items-center gap-4 text-center">
                <span
                  aria-hidden
                  className={`${step.tone} flex size-[72px] items-center justify-center rounded-full font-display text-2xl font-bold`}
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-[22px] font-bold">{step.title}</h3>
                <p className="max-w-xs text-[15px] leading-[1.4] text-navy/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-5 py-24 md:px-16 lg:px-20 lg:py-28">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-10 text-center">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-3xl leading-normal font-bold text-cream md:text-4xl lg:text-[56px]">
              Ready to begin your music <span className="text-gold">journey</span>?
            </h2>
            <p className="text-base leading-normal text-cream/75 lg:text-xl">
              Start an application and we&apos;ll pair you with a mentor. Love to teach? Volunteer your
              skills and guide the next generation.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href={APPLY_LINKS.student} className="rounded-full bg-gold px-9 py-5 text-lg font-bold text-navy">
              Apply for lessons
            </Link>
            <Link
              href={APPLY_LINKS.mentor}
              className="rounded-full border-2 border-cream px-9 py-5 text-lg font-bold text-cream"
            >
              Volunteer as a mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
