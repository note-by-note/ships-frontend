import type { Metadata } from 'next';
import { ApplicationWizard } from '@/components/application-wizard';

export async function generateMetadata({ params }: PageProps<'/apply/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  // The form's real title needs a fetch the client is about to make anyway;
  // the slug is a good enough tab label until it arrives.
  return { title: `Apply · ${slug.replace(/-/g, ' ')}` };
}

export default async function ApplyPage({ params, searchParams }: PageProps<'/apply/[slug]'>) {
  const { slug } = await params;
  // `?mentor=<slug>` comes from "Apply to learn with…" on Find a Mentor.
  const { mentor } = await searchParams;
  return <ApplicationWizard slug={slug} mentor={typeof mentor === 'string' ? mentor : undefined} />;
}
