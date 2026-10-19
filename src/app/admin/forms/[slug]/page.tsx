import type { Metadata } from 'next';
import { RequirePermission } from '@/components/admin-guard';
import { FormEditor } from '@/components/form-editor';

export const metadata: Metadata = { title: 'Edit form' };

export default async function FormEditorPage({ params }: PageProps<'/admin/forms/[slug]'>) {
  const { slug } = await params;
  return (
    <RequirePermission anyOf={['forms.manage']}>
      <FormEditor slug={slug} />
    </RequirePermission>
  );
}
