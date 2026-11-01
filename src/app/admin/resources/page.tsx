'use client';

import { RequirePermission } from '@/components/layout/admin-guard';
import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { ResourcesBoard } from '@/components/dashboard/resources-board';

export default function TeamResourcesPage() {
  return (
    <RequirePermission anyOf={['resources.manage']}>
      <DashboardHeading
        title="Team resources"
        description="Guides, policies and teaching material for the team: everyone, or only the teams you pick. Students don't see these."
      />
      <ResourcesBoard mode="team" />
    </RequirePermission>
  );
}
