import type { Metadata } from 'next';
import { LegalPage, policyMetadata, translatedLanguage, translatedLanguageParams } from '@/components/legal';

// /privacy/es and the other translations. English is /privacy.

export const dynamicParams = false;
export const generateStaticParams = translatedLanguageParams;

export async function generateMetadata({ params }: PageProps<'/privacy/[lang]'>): Promise<Metadata> {
  return policyMetadata('privacy', translatedLanguage((await params).lang));
}

export default async function TranslatedPrivacyPage({ params }: PageProps<'/privacy/[lang]'>) {
  const lang = translatedLanguage((await params).lang);
  return (
    <LegalPage policy="privacy" lang={lang} />
  );
}
