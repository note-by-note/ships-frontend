import type { Metadata } from 'next';
import { FormsList } from '@/components/forms-list';

export const metadata: Metadata = { title: 'Forms' };

export default function AdminFormsPage() {
  return <FormsList />;
}
