'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

/** The yellow bar shown on every page while staff are inside a test account. */
export function TestModeBanner() {
  const { user, leaveTestAccount } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user?.isTest) return null;

  return (
    <div role="status" className="bg-gold text-navy print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2.5 text-sm md:px-8">
        <p>
          <strong>Test mode.</strong> You’re viewing the site as <strong>{user.name}</strong> ({user.alsoStudent ? 'mentor and student' : user.role}). Anything
          you do is marked as test data.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await leaveTestAccount();
            setBusy(false);
            router.push('/admin/testing');
          }}
          className="rounded-full bg-navy px-4 py-1.5 font-semibold text-cream disabled:opacity-60"
        >
          {busy ? 'Returning…' : 'Return to my account'}
        </button>
      </div>
    </div>
  );
}
