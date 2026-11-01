'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { ResourcesBoard } from '@/components/dashboard/resources-board';

export default function ResourcesPage() {
  return (
    <>
      <DashboardHeading
        title="Resources"
        description="Sheet music, recordings and links shared between you and your mentor or students."
      />
      <ResourcesBoard mode="member" />
    </>
  );
}
