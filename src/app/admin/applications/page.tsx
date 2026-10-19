import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequirePermission } from '@/components/admin-guard';
import { ReviewQueue } from '@/components/review-queue';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = { title: 'Review applications' };

export default function ReviewQueuePage() {
  return (
    <RequirePermission anyOf={['applications.review']}>
      <Suspense fallback={<Spinner />}>
        <ReviewQueue />
      </Suspense>
    </RequirePermission>
  );
}
