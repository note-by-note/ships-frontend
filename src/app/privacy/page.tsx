import type { Metadata } from 'next';
import { LegalPage, policyMetadata } from '@/components/legal';

// The text is in `src/content/policies`. Translations are at /privacy/es and so on.

export const metadata: Metadata = policyMetadata('privacy', 'en');

export default function PrivacyPage() {
  return (
    <LegalPage policy="privacy" lang="en" />
  );
}
