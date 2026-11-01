'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { HoursLog } from '@/components/dashboard/hours-log';

export default function VolunteerHoursPage() {
  return (
    <>
      <DashboardHeading
        title="Volunteer hours"
        description="Log the time you give. Once staff approve it, it shows on a summary you can print for school."
      />
      <HoursLog summaryHref="/dashboard/hours/summary" mentor />
    </>
  );
}
