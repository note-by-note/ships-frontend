import { AdminGuard } from '@/components/admin-guard';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </AdminGuard>
  );
}
