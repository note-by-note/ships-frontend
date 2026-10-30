import type { Metadata } from 'next';
import { ConductAcceptance } from '@/components/conduct-acceptance';
import { LegalPage, policyMetadata, translatedLanguage, translatedLanguageParams } from '@/components/legal';

// /code-of-conduct/es and the other translations. English is /code-of-conduct.

export const dynamicParams = false;
export const generateStaticParams = translatedLanguageParams;

export async function generateMetadata({ params }: PageProps<'/code-of-conduct/[lang]'>): Promise<Metadata> {
  return policyMetadata('conduct', translatedLanguage((await params).lang));
}

export default async function TranslatedCodeOfConductPage({ params }: PageProps<'/code-of-conduct/[lang]'>) {
  const lang = translatedLanguage((await params).lang);
  return (
    <LegalPage policy="conduct" lang={lang}>
      <ConductAcceptance lang={lang} />
    </LegalPage>
  );
}
