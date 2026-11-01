'use client';

import { RequirePermission } from '@/components/layout/admin-guard';
import { AnnouncementTabs, AnnouncementsManager } from '@/components/messages/announcements';
import { DashboardHeading } from '@/components/layout/dashboard-shell';

export default function ManageAnnouncementsPage() {
  return (
    <RequirePermission anyOf={['announcements.manage']}>
      <DashboardHeading
        title="Announcements"
        description="Post news and important dates, and choose who sees them: students, mentors, or any of the volunteer teams."
      />
      <AnnouncementTabs />
      <AnnouncementsManager />
    </RequirePermission>
  );
}
