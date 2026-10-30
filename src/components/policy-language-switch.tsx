'use client';

// The language links at the top of each policy page, and the "read in
// English" link on a translation. They keep the rest of the address, so a
// parent who opens their consent link (`?t=…`) can switch language without
// losing the form.

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { POLICY_LANGUAGES, policyHref, type PolicyLanguage } from '@/lib/policy-languages';

interface SwitchProps {
  path: string;
  lang: PolicyLanguage;
  label: string;
}

export function PolicyLanguageSwitch(props: SwitchProps) {
  return (
    <Suspense fallback={<LanguageLinks {...props} search="" />}>
      <WithSearch {...props} />
    </Suspense>
  );
}

function WithSearch(props: SwitchProps) {
  return <LanguageLinks {...props} search={useSearch()} />;
}

function useSearch() {
  const search = useSearchParams().toString();
  return search ? `?${search}` : '';
}

/** A link to another language of this page that keeps the address's `?…`. */
export function SameSearchLink({
  href,
  hrefLang,
  className,
  children,
}: {
  href: string;
  hrefLang: string;
  className?: string;
  children: ReactNode;
}) {
  const link = (search: string) => (
    <Link href={`${href}${search}`} hrefLang={hrefLang} className={className}>
      {children}
    </Link>
  );
  return (
    <Suspense fallback={link('')}>
      <WithSearchLink link={link} />
    </Suspense>
  );
}

function WithSearchLink({ link }: { link: (search: string) => ReactNode }) {
  return link(useSearch());
}

function LanguageLinks({ path, lang, label, search }: SwitchProps & { search: string }) {
  return (
    <nav aria-label={label} className="flex items-baseline gap-3 text-sm">
      <span className="text-navy/50">{label}</span>
      <ul className="flex gap-3">
        {POLICY_LANGUAGES.map((language) => (
          <li key={language.code}>
            <Link
              href={`${policyHref(path, language.code)}${search}`}
              hrefLang={language.code}
              lang={language.code}
              aria-current={language.code === lang ? 'true' : undefined}
              className={language.code === lang ? 'font-semibold text-navy' : 'text-navy/60 hover:text-navy'}
            >
              {language.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
