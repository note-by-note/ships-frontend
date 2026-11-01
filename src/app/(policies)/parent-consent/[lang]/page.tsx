import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LegalPage, policyMetadata, translatedLanguage, translatedLanguageParams } from '@/components/legal';
import { ParentConsentForm } from '@/components/parent-consent-form';

// /parent-consent/es and the other translations. English is /parent-consent.

export const dynamicParams = false;
export const generateStaticParams = translatedLanguageParams;

export async function generateMetadata({ params }: PageProps<'/parent-consent/[lang]'>): Promise<Metadata> {
  return policyMetadata('consent', translatedLanguage((await params).lang));
}

export default async function TranslatedParentConsentPage({ params }: PageProps<'/parent-consent/[lang]'>) {
  const lang = translatedLanguage((await params).lang);
  return (
    <LegalPage policy="consent" lang={lang}>
      <Suspense fallback={null}>
        <ParentConsentForm lang={lang} />
      </Suspense>
    </LegalPage>
  );
}
