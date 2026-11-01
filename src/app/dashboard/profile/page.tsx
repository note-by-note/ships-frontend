'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { MentorPageEditor } from '@/components/dashboard/mentor-page-editor';

/** A mentor editing their own page. Staff-only fields live in the staff area. */
export default function MentorProfilePage() {
  return (
    <>
      <DashboardHeading title="My page" description="This is the page students see when they open your profile." />
      <MentorPageEditor />
    </>
  );
}
