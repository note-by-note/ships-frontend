import type { Metadata } from 'next';
import { MentorProfileView } from '@/components/mentor-profile-view';

export const metadata: Metadata = {
  title: 'Mentor',
  description: 'A volunteer mentor offering free online music lessons with Note by Note.',
};

export default async function MentorPageRoute({ params }: PageProps<'/find-a-mentor/[slug]'>) {
  const { slug } = await params;
  return <MentorProfileView slug={slug} />;
}
