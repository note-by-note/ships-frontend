import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReviewQueue } from '@/components/review-queue';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = { title: 'Review applications' };

export default function ReviewQueuePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReviewQueue />
    </Suspense>
  );
}
