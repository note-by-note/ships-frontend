'use client';

import { use } from 'react';
import { DashboardHeading } from '@/components/dashboard-shell';
import { TeamMessagesHome } from '@/components/team-messages';

export default function StaffTeamConversationPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  return (
    <>
      <DashboardHeading
        title="Team messages"
        description="Conversations between the teams: Admin, Tech, Outreach, Marketing and the mentors."
      />
      <TeamMessagesHome base="/admin/team-messages" selected={threadId} />
    </>
  );
}
