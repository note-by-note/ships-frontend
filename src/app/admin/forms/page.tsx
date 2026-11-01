import type { Metadata } from 'next';
import { RequirePermission } from '@/components/layout/admin-guard';
import { FormsList } from '@/components/applications/forms-list';
import { FormTabs } from '@/components/layout/staff-shell';

export const metadata: Metadata = { title: 'Forms' };

export default function AdminFormsPage() {
  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormTabs />
      <FormsList />
    </RequirePermission>
  );
}
