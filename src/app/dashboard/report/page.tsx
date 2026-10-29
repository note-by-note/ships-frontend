'use client';

import Link from 'next/link';
import { DashboardHeading, Panel } from '@/components/dashboard-shell';
import { ReportConcernForm } from '@/components/report-concern';

// A concern that isn't about one message, page or file: anything that worries
// someone. Reports go to Note by Note admins only.

export default function ReportPage() {
  return (
    <>
      <DashboardHeading
        title="Report a concern"
        description="Tell us about anything that worries you. Only Note by Note admins read reports, and the person you report isn’t told who reported them."
      />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_260px]">
        <Panel>
          <ReportConcernForm kind="general" />
        </Panel>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-navy/75">
          <p>
            About one message? Use <strong>Report</strong> under it in{' '}
            <Link href="/dashboard/messages" className="underline underline-offset-2">Messages</Link>.
          </p>
          <p>
            About your lessons with someone? There’s a report link on each of your{' '}
            <Link href="/dashboard/lessons" className="underline underline-offset-2">lessons</Link>.
          </p>
          <p>
            See what’s expected of everyone in our <Link href="/code-of-conduct" className="underline underline-offset-2">Code of Conduct</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
