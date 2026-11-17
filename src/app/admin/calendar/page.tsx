'use client';

// Staff volunteers' own calendar: the important dates posted for their team
// and the volunteer hours they've logged (and lessons, if they also mentor or
// take lessons).

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { CalendarSync } from '@/components/dashboard/calendar-sync';
import { LessonCalendar } from '@/components/dashboard/lesson-calendar';

export default function StaffCalendarPage() {
  return (
    <>
      <DashboardHeading
        title="My calendar"
        description="Important dates for your team and the volunteer hours you’ve logged."
      />
      <div className="flex flex-col gap-8">
        <LessonCalendar showHours lessonHint={false} />
        <CalendarSync />
      </div>
    </>
  );
}
