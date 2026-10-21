'use client';

import { use } from 'react';
import { DashboardHeading } from '@/components/dashboard-shell';
import { MessagesHome } from '@/components/messages';

export default function ConversationPage({ params }: { params: Promise<{ pairingId: string }> }) {
  const { pairingId } = use(params);
  return (
    <>
      <DashboardHeading title="Messages" description="Talk about lessons, practice and music with your mentor or student." />
      <MessagesHome selected={pairingId} />
    </>
  );
}
