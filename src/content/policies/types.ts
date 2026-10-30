import type { ReactNode } from 'react';
import type { PolicyKey } from '@/lib/policy-languages';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** One policy in one language. */
export interface PolicyText {
  title: string;
  /** For search results and link previews. */
  description: string;
  summary: ReactNode;
  sections: LegalSection[];
}

/** The words around the policies: their names, the date line, and so on. */
export interface PolicyChrome {
  names: Record<PolicyKey, string>;
  policiesLabel: string;
  languageLabel: string;
  lastUpdated: (date: string) => string;
  onThisPage: string;
  /** Under the date on a translation, before the link to the English page. */
  translationNote: string;
  readInEnglish: string;
}

export type PolicySet = { chrome: PolicyChrome } & Record<PolicyKey, PolicyText>;
