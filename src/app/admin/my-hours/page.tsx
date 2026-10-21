'use client';

import { DashboardHeading } from '@/components/dashboard-shell';
import { HoursLog } from '@/components/hours-log';

export default function StaffHoursPage() {
  return (
    <>
      <DashboardHeading
        title="My volunteer hours"
        description="Log the time you give to Note by Note. Another staff member approves it."
      />
      <HoursLog summaryHref="/admin/my-hours/summary" mentor={false} />
    </>
  );
}
