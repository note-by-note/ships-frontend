'use client';

import { useEffect, useState } from 'react';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { MentorProfileForm } from '@/components/mentor-profile-form';
import { Alert, Spinner } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import type { MentorProfile } from '@/lib/types';

/** A mentor editing their own profile. Staff-only fields aren't shown or sent. */
export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: MentorProfile }>('/me/mentor-profile')
      .then((body) => setProfile(body.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'We could not load your profile.'));
  }, []);

  return (
    <>
      <DashboardHeading
        title="My profile"
        description="This is what students see on Find a Mentor once staff publish your profile."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!profile && !error ? <Spinner /> : null}
      {profile ? (
        <Panel>
          <MentorProfileForm
            profile={profile}
            staff={false}
            onSave={async (values) => {
              const body = await api.patch<{ data: MentorProfile }>(`/mentors/${profile.id}`, values);
              setProfile(body.data);
            }}
          />
        </Panel>
      ) : null}
    </>
  );
}
