'use client';

import { DashboardHeading } from '@/components/dashboard-shell';
import { TeamMessagesHome } from '@/components/team-messages';

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
