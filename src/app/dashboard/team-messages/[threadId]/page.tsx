'use client';

import { use } from 'react';
import { DashboardHeading } from '@/components/dashboard-shell';
import { TeamMessagesHome } from '@/components/team-messages';

export default function MentorTeamConversationPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  return (
    <>
      <DashboardHeading
        title="Team messages"
        description="Ask the Note by Note teams a question, or read what they send to mentors."
      />
      <TeamMessagesHome base="/dashboard/team-messages" selected={threadId} />
    </>
  );
}
