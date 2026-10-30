import type { Metadata } from 'next';
import { LegalPage, policyMetadata, translatedLanguage, translatedLanguageParams } from '@/components/legal';

// /terms/es and the other translations. English is /terms.

export const dynamicParams = false;
export const generateStaticParams = translatedLanguageParams;

export async function generateMetadata({ params }: PageProps<'/terms/[lang]'>): Promise<Metadata> {
  return policyMetadata('terms', translatedLanguage((await params).lang));
}

export default async function TranslatedTermsPage({ params }: PageProps<'/terms/[lang]'>) {
  const lang = translatedLanguage((await params).lang);
  return (
    <LegalPage policy="terms" lang={lang} />
  );
}
