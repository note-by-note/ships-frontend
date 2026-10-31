// The Code of Conduct, Terms of Use, Privacy Policy and parent consent pages
// come in these languages. English lives at /terms, the others at /terms/es
// and so on. The English text is the one that applies; the others are
// translations of it, so when the English changes, change them too.
//
// The API keeps the same list for the consent email
// (`ships-api/src/util/consentEmail.ts`).

export const POLICY_LANGUAGES = [
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'es', label: 'Español', locale: 'es' },
  { code: 'fr', label: 'Français', locale: 'fr' },
  // Simplified Chinese, the written form of Mandarin used in mainland China and Singapore.
  { code: 'zh', label: '简体中文', locale: 'zh-CN' },
] as const;

export type PolicyLanguage = (typeof POLICY_LANGUAGES)[number]['code'];

export type PolicyKey = 'conduct' | 'terms' | 'privacy' | 'consent';

export const POLICY_PATHS: Record<PolicyKey, string> = {
  conduct: '/code-of-conduct',
  terms: '/terms',
  privacy: '/privacy',
  consent: '/parent-consent',
};

export function isPolicyLanguage(value: unknown): value is PolicyLanguage {
  return POLICY_LANGUAGES.some((language) => language.code === value);
}

/** Where a page is in a language: `/terms` for English, `/terms/es` for Spanish. */
export function policyHref(path: string, lang: PolicyLanguage) {
  return lang === 'en' ? path : `${path}/${lang}`;
}

/** The tag for `lang` attributes and dates, e.g. `zh-CN`, so browsers pick the right fonts. */
export function policyLocale(lang: PolicyLanguage) {
  return POLICY_LANGUAGES.find((language) => language.code === lang)?.locale ?? 'en-US';
}

/** A date as people write it in that language, e.g. "29 de octubre de 2026". */
export function formatPolicyDate(isoDate: string, lang: PolicyLanguage) {
  return new Date(`${isoDate.slice(0, 10)}T12:00:00Z`).toLocaleDateString(policyLocale(lang), {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
}
