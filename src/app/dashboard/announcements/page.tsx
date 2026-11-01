'use client';

import { AnnouncementsPage } from '@/components/messages/announcements';
import { DashboardHeading } from '@/components/layout/dashboard-shell';

export default function MemberAnnouncementsPage() {
  return (
    <>
      <DashboardHeading title="Announcements" description="News and important dates from the Note by Note team." />
      <AnnouncementsPage />
    </>
  );
}
