import { MemberShell } from '@/components/member-shell';

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return <MemberShell>{children}</MemberShell>;
}
