import type { Metadata } from 'next';
import { MyApplications } from '@/components/my-applications';

export const metadata: Metadata = { title: 'My applications' };

export default function MyApplicationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-ink">My applications</h1>
      <MyApplications />
    </div>
  );
}
