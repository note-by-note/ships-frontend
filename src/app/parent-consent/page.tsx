import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LegalPage, type LegalSection } from '@/components/legal';
import { ParentConsentForm } from '@/components/parent-consent-form';

export const metadata: Metadata = {
  title: 'Parent & guardian consent',
  description: 'What parents and guardians agree to when a student under 18 takes lessons with Note by Note.',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'lessons',
    title: 'What the lessons are',
    body: (
      <ul>
        <li>Free, one-on-one music lessons with a volunteer mentor, who is often a high school or university student.</li>
        <li>
          Lessons take place over a video call, such as Zoom or Google Meet, at a weekly time your child and their mentor
          agree on.
        </li>
        <li>
          Your child and their mentor can message each other, share files and keep lesson notes on the Note by Note
          website.
        </li>
        <li>There’s no cost, and mentors never ask for money or gifts.</li>
      </ul>
    ),
  },
  {
    id: 'safety',
    title: 'How we keep students safe',
    body: (
      <ul>
        <li>
          Everyone agrees to our <Link href="/code-of-conduct">Code of Conduct</Link>: lessons stay online, contact stays
          on the site, and conversations stay about music.
        </li>
        <li>Mentors don’t ask for phone numbers, social media or addresses, and don’t meet students in person.</li>
        <li>
          Note by Note admins can read messages between mentors and students, for example when a message is reported.
        </li>
        <li>Lessons aren’t recorded unless both sides agree, and for your child, you agree too.</li>
        <li>Students and parents can report a concern at any time, and the person reported isn’t told who reported them.</li>
      </ul>
    ),
  },
  {
    id: 'information',
    title: 'What your child’s mentor sees',
    body: (
      <p>
        Before accepting, a mentor sees your child’s first name, age group, level, instrument and preferred times. Once
        they accept, they also see the name and email of the account that asked. Our{' '}
        <Link href="/privacy">Privacy Policy</Link> explains the rest.
      </p>
    ),
  },
  {
    id: 'agreeing',
    title: 'What you agree to',
    body: (
      <ul>
        <li>You are the student’s parent or legal guardian, or the caregiver responsible for them.</li>
        <li>Your child may take part in free online lessons and use the site as described above.</li>
        <li>You’ve read the Code of Conduct and Privacy Policy.</li>
        <li>For a child under 13, you or another adult will be nearby during lessons.</li>
      </ul>
    ),
  },
  {
    id: 'withdraw',
    title: 'Changing your mind',
    body: (
      <p>
        You can withdraw consent at any time through our <Link href="/contact">contact page</Link>. Lessons will stop, and
        you can ask us to delete your child’s information.
      </p>
    ),
  },
];

export default function ParentConsentPage() {
  return (
    <LegalPage
      current="/parent-consent"
      title="Parent & guardian consent"
      summary={
        <p>
          Students under 18 need a parent or guardian’s consent before lessons start. Here’s what the lessons involve and
          what you’re agreeing to.
        </p>
      }
      sections={SECTIONS}
    >
      <Suspense fallback={null}>
        <ParentConsentForm />
      </Suspense>
    </LegalPage>
  );
}
