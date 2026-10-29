import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, type LegalSection } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What information Note by Note keeps, why, and who can see it.',
};

// Every statement here describes what the site actually does. If the site
// changes (a new service, a new kind of data), change this page with it.

const SECTIONS: LegalSection[] = [
  {
    id: 'collect',
    title: 'What we keep',
    body: (
      <>
        <p>We keep only what we need to run free lessons and keep people safe:</p>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address and role. Your password is stored scrambled, so nobody
            at Note by Note can read it.
          </li>
          <li>
            <strong>Applications:</strong> your answers, such as your school, age group, instrument, level, the days and
            times you’re free, languages and goals. For a student under 18, the name and email of a parent or guardian.
          </li>
          <li>
            <strong>Mentor pages:</strong> what mentors write about themselves, their instruments, their weekly free times,
            and a photo if they add one.
          </li>
          <li>
            <strong>Lessons:</strong> requests, agreed lesson times, “can’t make it” notices, lesson notes, practice
            checklists and video call links.
          </li>
          <li>
            <strong>Messages and files</strong> shared between a mentor and their student.
          </li>
          <li>
            <strong>Volunteer hours</strong> that mentors and volunteers log.
          </li>
          <li>
            <strong>Agreements:</strong> when you accepted the Code of Conduct and Terms of Use, and the name you typed. For
            a student under 18, their parent or guardian’s consent: their name, email, relationship and the date.
          </li>
          <li>
            <strong>Messages sent through our contact form.</strong>
          </li>
          <li>
            <strong>Visits:</strong> which pages are viewed, without the parts of a web address that could identify you.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it',
    body: (
      <>
        <p>
          To match students with mentors, arrange and run lessons, keep everyone safe, contact you about the program, and
          understand which pages are useful.
        </p>
        <p>
          We don’t sell your information, and we don’t use it for advertising.
        </p>
      </>
    ),
  },
  {
    id: 'who-sees',
    title: 'Who can see it',
    body: (
      <ul>
        <li>
          <strong>Your mentor or student.</strong> Before a mentor accepts a student, they see the student’s first name,
          age group, level, instrument and preferred times. Once they accept, they also see the name and email of the
          account that asked.
        </li>
        <li>
          <strong>The public.</strong> Published mentor pages, including approved photos, are shown on Find a Mentor.
          Team members on the About page are shown there. Nothing else is public.
        </li>
        <li>
          <strong>The Note by Note team.</strong> Volunteers see only what their role needs. Admins can read messages
          between mentors and students to keep people safe, such as when one is reported. Some volunteers see only
          totals, never names.
        </li>
        <li>
          <strong>Services that run the site for us</strong> (listed below), only to do that job.
        </li>
        <li>
          <strong>Others, only if we must:</strong> if the law requires it, or to protect someone from harm.
        </li>
      </ul>
    ),
  },
  {
    id: 'services',
    title: 'Services we use',
    body: (
      <ul>
        <li>
          <strong>Vercel</strong> hosts the website and counts page visits.
        </li>
        <li>
          <strong>Render</strong> runs our server.
        </li>
        <li>
          <strong>MongoDB Atlas</strong> stores our database.
        </li>
        <li>
          <strong>Google Analytics</strong> counts visits. We’ve turned off Google signals and ad personalization, and we
          remove anything that could identify you from the addresses it sees.
        </li>
        <li>
          <strong>Formspree</strong> delivers messages from our contact form.
        </li>
        <li>
          <strong>An email delivery service</strong> sends the site’s emails, such as lesson notices and consent requests.
        </li>
        <li>
          <strong>Video call services</strong> you choose for lessons, such as Zoom or Google Meet, have their own privacy
          policies.
        </li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and browser storage',
    body: (
      <>
        <p>
          To keep you signed in, the site saves a sign-in key in your browser’s storage. It also remembers small
          preferences, like which dashboard tab you used last. Signing out removes the sign-in key.
        </p>
        <p>
          Google Analytics uses cookies to count visits. Vercel’s visit counting doesn’t use cookies. You can block or clear
          cookies in your browser settings; the site still works.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Keeping it secure',
    body: (
      <p>
        Connections to the site are encrypted. Passwords are stored scrambled. Location and camera details are removed
        from uploaded photos. Volunteers’ access is limited to their role, and only test accounts can be entered by staff,
        never a real person’s account.
      </p>
    ),
  },
  {
    id: 'how-long',
    title: 'How long we keep it',
    body: (
      <p>
        We keep your information while your account is open. When you ask us to close it, we delete or anonymize your
        information, except anything we need to keep for safety reasons or because the law requires it.
      </p>
    ),
  },
  {
    id: 'choices',
    title: 'Your choices',
    body: (
      <ul>
        <li>
          Ask to see, correct or delete your information through the <Link href="/contact">contact page</Link>.
        </li>
        <li>
          Choose which emails you get in your <Link href="/dashboard/settings">account settings</Link>.
        </li>
        <li>A parent or guardian can withdraw consent for their child at any time by contacting us.</li>
      </ul>
    ),
  },
  {
    id: 'children',
    title: 'Children and teenagers',
    body: (
      <p>
        Many of our students are under 18. A parent or guardian gives <Link href="/parent-consent">consent</Link> before
        lessons start, and can ask to see or delete their child’s information. If you’re under 13, please ask a parent or
        guardian to set up your account with you.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>If we change how we handle information, we’ll update this page and the date at the top.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about privacy? Write to us through the <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy Policy"
      summary={
        <p>
          We keep what we need to run free lessons and keep students safe. We don’t sell it, and we don’t use it for
          advertising.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
