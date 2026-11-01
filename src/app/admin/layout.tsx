import { StaffShell } from '@/components/layout/staff-shell';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return <StaffShell>{children}</StaffShell>;
}
