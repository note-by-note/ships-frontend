'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { TeamMessagesHome } from '@/components/messages/team-messages';

export default function MentorTeamMessagesPage() {
  return (
    <>
      <DashboardHeading
        title="Team messages"
        description="Ask the Note by Note teams a question, or read what they send to mentors."
      />
      <TeamMessagesHome base="/dashboard/team-messages" />
    </>
  );
}
