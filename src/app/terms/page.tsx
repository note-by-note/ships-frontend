import type { Metadata } from 'next';
import { LegalPage, policyMetadata } from '@/components/legal';

// The text is in `src/content/policies`. Translations are at /terms/es and so on.

export const metadata: Metadata = policyMetadata('terms', 'en');

export default function TermsPage() {
  return (
    <LegalPage policy="terms" lang="en" />
  );
}
