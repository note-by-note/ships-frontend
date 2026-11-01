import { MemberShell } from '@/components/layout/member-shell';

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return <MemberShell>{children}</MemberShell>;
}
