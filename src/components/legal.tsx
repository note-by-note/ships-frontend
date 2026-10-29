import Link from 'next/link';
import type { ReactNode } from 'react';
import { POLICIES, POLICIES_UPDATED } from '@/lib/site';
import { Container } from './marketing';

// The layout shared by the Code of Conduct, Terms of Use, Privacy Policy and
// parent consent pages: a plain header with the date, links between the four,
// a contents list beside the text on wide screens, and readable prose.

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalPage({
  current,
  title,
  summary,
  sections,
  children,
}: {
  /** This page's path, to mark it in the links between policies. */
  current: string;
  title: string;
  summary: ReactNode;
  sections: LegalSection[];
  /** Shown after the sections, e.g. the form to accept. */
  children?: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-navy/10 bg-cream text-navy">
        <Container className="py-12 md:py-16">
          <nav aria-label="Policies" className="mb-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {POLICIES.map((policy) => (
              <Link
                key={policy.href}
                href={policy.href}
                aria-current={policy.href === current ? 'page' : undefined}
                className={
                  policy.href === current
                    ? 'font-semibold text-navy underline decoration-2 underline-offset-[6px]'
                    : 'text-navy/60 hover:text-navy'
                }
              >
                {policy.label}
              </Link>
            ))}
          </nav>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-navy/60">Last updated {POLICIES_UPDATED}</p>
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-navy/80">{summary}</div>
        </Container>
      </header>

      <div className="bg-white text-navy">
        <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-navy/50 uppercase">On this page</p>
              <ol className="flex flex-col gap-2 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-navy/65 hover:text-navy">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="max-w-[68ch]">
            {sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24 pb-10">
                <h2 id={`${section.id}-title`} className="mb-3 font-display text-2xl font-bold">
                  {section.title}
                </h2>
                <Prose>{section.body}</Prose>
              </section>
            ))}
            {children}
          </div>
        </Container>
      </div>
    </>
  );
}

/** Paragraphs and lists at a comfortable reading size. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 leading-relaxed text-navy/80 [&_a]:font-medium [&_a]:text-navy [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-navy [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
