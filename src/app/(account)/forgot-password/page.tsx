import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/account/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot your password?', robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <ForgotPasswordForm />
    </div>
  );
}
