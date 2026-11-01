'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { MessagesHome } from '@/components/messages/messages';

export default function MessagesPage() {
  return (
    <>
      <DashboardHeading title="Messages" description="Talk about lessons, practice and music with your mentor or student." />
      <MessagesHome />
    </>
  );
}
