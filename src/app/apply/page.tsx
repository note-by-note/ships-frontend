import type { Metadata } from 'next';
import { OpenFormList } from '@/components/open-form-list';

export const metadata: Metadata = {
  title: 'Apply',
  description: 'Applications open at Note by Note.',
};

export default function ApplyIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Applications</h1>
        <p className="mt-3 text-ink-soft">
          Every application here is read by a person. Take your time: you can save your progress and
          come back to finish.
        </p>
      </div>
      <OpenFormList />
    </div>
  );
}
