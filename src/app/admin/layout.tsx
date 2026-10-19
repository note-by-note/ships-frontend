import { StaffShell } from '@/components/staff-shell';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return <StaffShell>{children}</StaffShell>;
}
