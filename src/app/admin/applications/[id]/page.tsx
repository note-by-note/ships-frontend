import type { Metadata } from 'next';
import { ApplicationReview } from '@/components/application-review';

export const metadata: Metadata = { title: 'Review application' };

export default async function ApplicationReviewPage({ params }: PageProps<'/admin/applications/[id]'>) {
  const { id } = await params;
  return <ApplicationReview id={id} />;
}
