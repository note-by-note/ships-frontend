import type { Metadata } from 'next';
import Link from 'next/link';
import { ConductAcceptance } from '@/components/conduct-acceptance';
import { LegalPage, type LegalSection } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Code of Conduct',
  description: 'How students, families, mentors and volunteers treat each other at Note by Note.',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'respect',
    title: 'Be respectful',
    body: (
      <>
        <p>
          Treat everyone kindly and patiently. Harassment, bullying and discrimination are not allowed, whether it’s
          about someone’s race, ethnicity, religion, gender, gender identity, sexual orientation, disability, age,
          background or musical level.
        </p>
        <p>
          Feedback should be about the music, not the person. Every style of music and every starting point is
          welcome.
        </p>
      </>
    ),
  },
  {
    id: 'reliable',
    title: 'Show up',
    body: (
      <>
        <p>
          Come to the lessons you agreed to, on time. If you can’t make one, let the other person know on the{' '}
          <Link href="/dashboard/lessons">Lessons page</Link> as early as you can.
        </p>
        <p>
          If you need to stop lessons, tell your mentor or student, and let the team know through the{' '}
          <Link href="/contact">contact page</Link>, so nobody is left waiting.
        </p>
      </>
    ),
  },
  {
    id: 'safe-lessons',
    title: 'Keep lessons safe',
    body: (
      <>
        <p>Many of our students are under 18, and many of our mentors are students too. For everyone’s safety:</p>
        <ul>
          <li>Lessons happen online, over the video call link on the Lessons page. Don’t meet in person.</li>
          <li>
            Keep in touch through Note by Note messages. Don’t ask for or share personal phone numbers, social media or
            home addresses.
          </li>
          <li>Keep conversations about music and lessons.</li>
          <li>Join video calls from a suitable place, dressed as you would for school.</li>
          <li>
            For students under 13, a parent or guardian should be nearby during lessons. Students under 18 need a
            parent or guardian’s <Link href="/parent-consent">consent</Link> before lessons start.
          </li>
          <li>
            Don’t record a lesson, or take photos or screenshots of the other person, unless both of you agree. For a
            student under 18, their parent or guardian must agree too.
          </li>
          <li>No gifts and no money. Lessons are free, and mentors never ask for payment.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'mentors',
    title: 'For mentors',
    body: (
      <ul>
        <li>You’re a role model. Be patient, encouraging and honest about what you can teach.</li>
        <li>Keep a friendly but professional relationship with your student and their family.</li>
        <li>Keep what you know about your student private. Don’t share their details outside Note by Note.</li>
        <li>
          If a student says something that makes you worried about their safety, tell the team straight away through
          the <Link href="/contact">contact page</Link>. Don’t try to handle it on your own.
        </li>
      </ul>
    ),
  },
  {
    id: 'volunteers',
    title: 'For volunteers on the team',
    body: (
      <ul>
        <li>Use what you can see in the staff area only for your role, and only when you need to.</li>
        <li>Don’t copy, download or share anyone’s personal information outside Note by Note.</li>
        <li>Admins read messages between mentors and students only to keep people safe, such as when one is reported.</li>
        <li>Don’t make decisions about your own application or your own lessons. Ask someone else on the team.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing files and music',
    body: (
      <>
        <p>
          Share only things you have the right to share. Respect copyright: don’t pass on paid sheet music or
          recordings that aren’t yours to share.
        </p>
        <p>
          A student’s recordings, compositions and other work belong to them. Don’t share them with anyone else without
          their permission, and their parent or guardian’s if they’re under 18.
        </p>
      </>
    ),
  },
  {
    id: 'messages',
    title: 'Messages and safety checks',
    body: (
      <p>
        Messages between mentors and students stay on Note by Note so that we can keep everyone safe. Note by Note admins
        can read them, for example when a message is reported. Other volunteers can’t. More about this is in our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'report',
    title: 'Reporting a concern',
    body: (
      <>
        <p>
          If something doesn’t feel right, tell us. Use <strong>Report</strong> on a message, a lesson or a mentor’s page,
          or <Link href="/dashboard/report">report a concern</Link> from your dashboard. You can also write to us through the{' '}
          <Link href="/contact">contact page</Link>. The person you report isn’t told who reported them.
        </p>
        <p>If someone is in danger, contact your local emergency services first.</p>
      </>
    ),
  },
  {
    id: 'breaking',
    title: 'If this code is broken',
    body: (
      <>
        <p>
          Depending on what happened, we may give a reminder, pause lessons, end a mentor and student pairing, remove
          someone from the program or close their account.
        </p>
        <p>
          If we’re worried about a child’s safety, we may tell their parent or guardian and, where the law requires it,
          the authorities.
        </p>
      </>
    ),
  },
];

export default function CodeOfConductPage() {
  return (
    <LegalPage
      current="/code-of-conduct"
      title="Code of Conduct"
      summary={
        <p>
          Note by Note works because students, families and volunteers trust each other. This code applies to everyone
          with an account: students, parents and guardians, mentors, and volunteers on every team.
        </p>
      }
      sections={SECTIONS}
    >
      <ConductAcceptance />
    </LegalPage>
  );
}
