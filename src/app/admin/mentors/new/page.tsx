'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { MentorProfileForm } from '@/components/mentor-profile-form';
import { Field, TextInput } from '@/components/ui/fields';
import { api } from '@/lib/api';
import type { MentorProfile } from '@/lib/types';

export default function NewMentorPage() {
  const router = useRouter();
  const [accountEmail, setAccountEmail] = useState('');

  return (
    <RequirePermission anyOf={['mentors.manage']}>
      <Link href="/admin/mentors" className="mb-4 inline-block text-sm text-navy/70 hover:underline">
        ← All mentors
      </Link>
      <DashboardHeading
        title="Add a mentor"
        description="New profiles start hidden. Publish once the details are checked."
      />
      <Panel>
        <MentorProfileForm
          profile={null}
          staff
          submitLabel="Create profile"
          extra={
            <Field
              label="Link to an account (optional)"
              help="The email they registered with. Linking makes their account a mentor account and lets them edit this profile. You can also do this later."
            >
              {({ id }) => (
                <TextInput id={id} type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} />
              )}
            </Field>
          }
          onSave={async (values) => {
            const body = await api.post<{ data: MentorProfile }>('/staff/mentors', {
              ...values,
              accountEmail: accountEmail.trim() || undefined,
            });
            router.push(`/admin/mentors/${body.data.id}`);
          }}
        />
      </Panel>
    </RequirePermission>
  );
}
