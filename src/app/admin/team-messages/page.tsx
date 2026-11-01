'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { TeamMessagesHome } from '@/components/messages/team-messages';

export default function StaffTeamMessagesPage() {
  return (
    <>
      <DashboardHeading
        title="Team messages"
        description="Conversations between the teams: Admin, Tech, Outreach, Marketing and the mentors."
      />
      <TeamMessagesHome base="/admin/team-messages" />
    </>
  );
}
