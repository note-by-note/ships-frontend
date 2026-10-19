import type { Metadata } from 'next';
import { RequirePermission } from '@/components/admin-guard';
import { ApplicationReview } from '@/components/application-review';

export const metadata: Metadata = { title: 'Review application' };

export default async function ApplicationReviewPage({ params }: PageProps<'/admin/applications/[id]'>) {
  const { id } = await params;
  return (
    <RequirePermission anyOf={['applications.review']}>
      <ApplicationReview id={id} />
    </RequirePermission>
  );
}
