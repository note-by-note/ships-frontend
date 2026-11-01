import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LegalPage, policyMetadata } from '@/components/legal';
import { ParentConsentForm } from '@/components/parent-consent-form';

// The text is in `src/content/policies`. Translations are at /parent-consent/es and so on.

export const metadata: Metadata = policyMetadata('consent', 'en');

export default function ParentConsentPage() {
  return (
    <LegalPage policy="consent" lang="en">
      <Suspense fallback={null}>
        <ParentConsentForm lang="en" />
      </Suspense>
    </LegalPage>
  );
}
