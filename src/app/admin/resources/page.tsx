'use client';

import { RequirePermission } from '@/components/admin-guard';
import { DashboardHeading } from '@/components/dashboard-shell';
import { ResourcesBoard } from '@/components/resources-board';

export default function TeamResourcesPage() {
  return (
    <RequirePermission anyOf={['resources.manage']}>
      <DashboardHeading
        title="Team resources"
        description="Guides, policies and teaching material for every mentor and volunteer. Students don't see these."
      />
      <ResourcesBoard mode="team" />
    </RequirePermission>
  );
}
