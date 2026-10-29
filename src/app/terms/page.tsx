import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, type LegalSection } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms for using the Note by Note website and taking part in its free music lessons.',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'about',
    title: 'About these terms',
    body: (
      <>
        <p>
          These terms apply to everyone who uses the Note by Note website. By creating an account or using the site, you
          agree to them, to our <Link href="/code-of-conduct">Code of Conduct</Link>, and to how we handle information as
          described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>If you’re under 18, please read these terms with a parent or guardian.</p>
      </>
    ),
  },
  {
    id: 'what-we-are',
    title: 'What Note by Note is',
    body: (
      <>
        <p>
          Note by Note is a student-led volunteer program offering free online music lessons. Mentors are volunteers,
          often students themselves. They play their instrument well and explain it patiently, but they aren’t
          professional teachers.
        </p>
        <p>
          Lessons are free. We do our best to match every student with a mentor, but we can’t promise a match, a
          particular mentor, a set number of lessons or any particular result.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <ul>
        <li>Give accurate information, and keep it up to date.</li>
        <li>Keep your password private. You’re responsible for what happens in your account.</li>
        <li>One person per account. A parent or guardian may set up and manage an account for their child.</li>
        <li>
          If you think someone else has used your account, tell us through the <Link href="/contact">contact page</Link>.
        </li>
      </ul>
    ),
  },
  {
    id: 'under-18',
    title: 'Students under 18',
    body: (
      <p>
        A parent or guardian must give their <Link href="/parent-consent">consent</Link> before a student under 18 starts
        lessons. They can withdraw it at any time by contacting us, and lessons will stop.
      </p>
    ),
  },
  {
    id: 'lessons',
    title: 'Lessons',
    body: (
      <>
        <p>
          Students and mentors arrange lessons on the site. Lessons take place over a video call service, such as Zoom or
          Google Meet, using the link on the Lessons page. That service’s own terms and privacy policy apply to the call.
        </p>
        <p>Either side can stop lessons at any time. Please let the other person and the team know.</p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'What you share',
    body: (
      <>
        <p>
          You keep ownership of what you post or upload: messages, files, recordings and your mentor page. You give
          Note by Note permission to store it and show it to the people it’s meant for, so the site can work.
        </p>
        <p>
          A mentor’s page, including an approved photo, is public on Find a Mentor once our team publishes it. Team members
          listed on the About page are shown there too.
        </p>
        <p>
          Don’t share anything illegal, harmful, or that you don’t have the right to share. We may remove content that
          breaks these terms or the Code of Conduct.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'Using the site fairly',
    body: (
      <ul>
        <li>Don’t try to get into other people’s accounts or parts of the site you don’t have access to.</li>
        <li>Don’t interfere with the site, overload it, or copy information from it in bulk.</li>
        <li>Don’t use it to send spam or advertising.</li>
      </ul>
    ),
  },
  {
    id: 'volunteers',
    title: 'Volunteers',
    body: (
      <>
        <p>
          Volunteers on our teams get access to what their role needs. That access is only for Note by Note work, and what
          you see there is confidential.
        </p>
        <p>
          Volunteer hours are recorded on the site and approved by the team. We can’t promise that a school or
          organization will accept them.
        </p>
      </>
    ),
  },
  {
    id: 'ending',
    title: 'Closing an account',
    body: (
      <p>
        You can ask us to close your account at any time through the <Link href="/contact">contact page</Link>. We may
        pause or close an account that breaks these terms or the Code of Conduct, or to keep someone safe.
      </p>
    ),
  },
  {
    id: 'no-guarantees',
    title: 'No guarantees',
    body: (
      <>
        <p>
          The site is run by volunteers and provided as it is. It may sometimes be slow or unavailable, for example while
          our server starts up after a quiet period.
        </p>
        <p>
          As far as the law allows, Note by Note and its volunteers aren’t responsible for indirect losses from using
          the site or the lessons. Nothing in these terms takes away rights you have by law.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms. The date at the top shows when they last changed. If a change matters to how you use
        the site, we’ll ask you to accept the new version when you next sign in.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms? Write to us through the <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of Use"
      summary={
        <p>
          The short version: lessons are free, mentors are volunteers, keep everyone safe, and respect what other people
          share. The details are below.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
