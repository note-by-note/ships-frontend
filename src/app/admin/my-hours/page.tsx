'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { HoursTabs } from '@/components/layout/staff-shell';
import { HoursLog } from '@/components/dashboard/hours-log';

export default function StaffHoursPage() {
  return (
    <>
      <HoursTabs />
      <DashboardHeading
        title="My volunteer hours"
        description="Log the time you give to Note by Note. Another staff member approves it."
      />
      <HoursLog summaryHref="/admin/my-hours/summary" mentor={false} />
    </>
  );
}
