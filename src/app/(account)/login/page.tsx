import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '@/components/sign-in-form';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      {/* useSearchParams needs a Suspense boundary to keep the route static. */}
      <Suspense fallback={<Spinner />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
