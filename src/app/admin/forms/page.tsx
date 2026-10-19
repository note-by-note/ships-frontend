import type { Metadata } from 'next';
import { RequirePermission } from '@/components/admin-guard';
import { FormsList } from '@/components/forms-list';

export const metadata: Metadata = { title: 'Forms' };

export default function AdminFormsPage() {
  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormsList />
    </RequirePermission>
  );
}
