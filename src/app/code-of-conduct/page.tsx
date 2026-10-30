import type { Metadata } from 'next';
import { ConductAcceptance } from '@/components/conduct-acceptance';
import { LegalPage, policyMetadata } from '@/components/legal';

// The text is in `src/content/policies`. Translations are at /code-of-conduct/es and so on.

export const metadata: Metadata = policyMetadata('conduct', 'en');

export default function CodeOfConductPage() {
  return (
    <LegalPage policy="conduct" lang="en">
      <ConductAcceptance lang="en" />
    </LegalPage>
  );
}
