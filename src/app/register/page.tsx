import type { Metadata } from 'next';
import { RegisterForm } from '@/components/register-form';

export const metadata: Metadata = { title: 'Create an account' };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <RegisterForm />
    </div>
  );
}
