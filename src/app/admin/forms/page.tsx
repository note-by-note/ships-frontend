import type { Metadata } from 'next';
import { RequirePermission } from '@/components/admin-guard';
import { FormsList } from '@/components/forms-list';
import { FormTabs } from '@/components/staff-shell';

export const metadata: Metadata = { title: 'Forms' };

export default function AdminFormsPage() {
  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormTabs />
      <FormsList />
    </RequirePermission>
  );
}
