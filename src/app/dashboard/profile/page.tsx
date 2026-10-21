'use client';

import { DashboardHeading } from '@/components/dashboard-shell';
import { MentorPageEditor } from '@/components/mentor-page-editor';

/** A mentor editing their own page. Staff-only fields live in the staff area. */
export default function MentorProfilePage() {
  return (
    <>
      <DashboardHeading title="My page" description="This is the page students see when they open your profile." />
      <MentorPageEditor />
    </>
  );
}
