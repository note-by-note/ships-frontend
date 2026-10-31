import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { POLICY_TEXT } from '@/content/policies';
import {
  POLICY_LANGUAGES,
  POLICY_PATHS,
  formatPolicyDate,
  isPolicyLanguage,
  policyHref,
  policyLocale,
  type PolicyKey,
  type PolicyLanguage,
} from '@/lib/policy-languages';
import { POLICIES_UPDATED } from '@/lib/site';
import { Container } from './marketing';
import { PolicyLanguageSwitch, SameSearchLink } from './policy-language-switch';

// The layout shared by the Code of Conduct, Terms of Use, Privacy Policy and
// parent consent pages: a plain header with the date, links between the four,
// a language switch, a contents list beside the text on wide screens, and
// readable prose. The text itself is in `src/content/policies`.

export type { LegalSection } from '@/content/policies/types';

export function LegalPage({
  policy,
  lang,
  children,
}: {
  policy: PolicyKey;
  lang: PolicyLanguage;
  /** Shown after the sections, e.g. the form to accept. */
  children?: ReactNode;
}) {
  const { chrome, [policy]: text } = POLICY_TEXT[lang];

  return (
    <div lang={policyLocale(lang)}>
      <header className="border-b border-navy/10 bg-cream text-navy">
        <Container className="py-12 md:py-16">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
            <nav aria-label={chrome.policiesLabel} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {(Object.keys(POLICY_PATHS) as PolicyKey[]).map((key) => (
                <Link
                  key={key}
                  href={policyHref(POLICY_PATHS[key], lang)}
                  aria-current={key === policy ? 'page' : undefined}
                  className={
                    key === policy
                      ? 'font-semibold text-navy underline decoration-2 underline-offset-[6px]'
                      : 'text-navy/60 hover:text-navy'
                  }
                >
                  {chrome.names[key]}
                </Link>
              ))}
            </nav>
            <PolicyLanguageSwitch path={POLICY_PATHS[policy]} lang={lang} label={chrome.languageLabel} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-3 text-sm text-navy/60">{chrome.lastUpdated(formatPolicyDate(POLICIES_UPDATED, lang))}</p>
          {lang !== 'en' ? (
            <p className="mt-2 max-w-2xl text-sm text-navy/60">
              {chrome.translationNote}{' '}
              <SameSearchLink href={POLICY_PATHS[policy]} hrefLang="en" className="font-medium text-navy underline underline-offset-2">
                {chrome.readInEnglish}
              </SameSearchLink>
            </p>
          ) : null}
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-navy/80">{text.summary}</div>
        </Container>
      </header>

      <div className="bg-white text-navy">
        <Container className="grid gap-12 py-12 md:py-16 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav aria-label={chrome.onThisPage} className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-navy/50 uppercase">{chrome.onThisPage}</p>
              <ol className="flex flex-col gap-2 text-sm">
                {text.sections.map((section) => (
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
            {text.sections.map((section) => (
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
    </div>
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

export function policyMetadata(policy: PolicyKey, lang: PolicyLanguage): Metadata {
  const text = POLICY_TEXT[lang][policy];
  return { title: text.title, description: text.description };
}

/** The translated versions, for each policy's `[lang]` route. English is the page without one. */
export function translatedLanguageParams() {
  return POLICY_LANGUAGES.filter((language) => language.code !== 'en').map((language) => ({ lang: language.code }));
}

export function translatedLanguage(param: string): PolicyLanguage {
  if (!isPolicyLanguage(param) || param === 'en') notFound();
  return param;
}
