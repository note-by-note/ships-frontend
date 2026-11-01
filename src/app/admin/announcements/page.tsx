'use client';

import { AnnouncementTabs, AnnouncementsPage } from '@/components/messages/announcements';
import { DashboardHeading } from '@/components/layout/dashboard-shell';

export default function StaffAnnouncementsPage() {
  return (
    <>
      <DashboardHeading title="Announcements" description="News and important dates for volunteers, from the Note by Note team." />
      <AnnouncementTabs />
      <AnnouncementsPage />
    </>
  );
}
