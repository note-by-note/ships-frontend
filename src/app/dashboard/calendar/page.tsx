'use client';

import { DashboardHeading } from '@/components/layout/dashboard-shell';
import { CalendarSync } from '@/components/dashboard/calendar-sync';
import { LessonCalendar } from '@/components/dashboard/lesson-calendar';
import { sidesOf, useAuth } from '@/components/account/auth-provider';

export default function CalendarPage() {
  const { user } = useAuth();
  const mentor = user ? sidesOf(user).mentor : false;
  return (
    <>
      <DashboardHeading
        title="Calendar"
        description={
          mentor
            ? 'Your lessons, important dates and the volunteer hours you’ve logged. After each lesson, mark whether it happened.'
            : 'Your lessons and important dates, on your own clock.'
        }
      />
      <div className="flex flex-col gap-8">
        <LessonCalendar showHours={mentor || Boolean(user?.isStaff)} />
        <CalendarSync />
      </div>
    </>
  );
}
