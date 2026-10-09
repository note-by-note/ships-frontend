import type { Metadata } from 'next';
import { ApplicationWizard } from '@/components/application-wizard';

export async function generateMetadata({ params }: PageProps<'/apply/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  // The form's real title needs a fetch the client is about to make anyway;
  // the slug is a good enough tab label until it arrives.
  return { title: `Apply · ${slug.replace(/-/g, ' ')}` };
}

export default async function ApplyPage({ params }: PageProps<'/apply/[slug]'>) {
  const { slug } = await params;
  return <ApplicationWizard slug={slug} />;
}
