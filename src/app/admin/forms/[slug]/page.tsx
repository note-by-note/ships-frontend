import type { Metadata } from 'next';
import { RequirePermission } from '@/components/layout/admin-guard';
import { FormEditor } from '@/components/applications/form-editor';

export const metadata: Metadata = { title: 'Edit form' };

export default async function FormEditorPage({ params }: PageProps<'/admin/forms/[slug]'>) {
  const { slug } = await params;
  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormEditor slug={slug} />
    </RequirePermission>
  );
}
