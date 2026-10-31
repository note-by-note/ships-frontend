'use client';

import { DashboardHeading } from '@/components/dashboard-shell';
import { TeamMessagesHome } from '@/components/team-messages';

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
