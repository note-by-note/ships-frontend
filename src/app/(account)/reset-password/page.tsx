import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/account/reset-password-form';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Choose a new password',
  robots: { index: false },
  // The reset link is in this page's address; never pass it on to another site.
  referrer: 'no-referrer',
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      {/* useSearchParams needs a Suspense boundary to keep the route static. */}
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
