// The policies in English: the version that applies. When this text changes,
// change es.tsx and fr.tsx to match, and the date in `src/lib/site.ts`.
//
// Every statement in the Privacy Policy describes what the site actually does.
// If the site changes (a new service, a new kind of data), change it with it.

import Link from 'next/link';
import type { PolicySet } from './types';

export const en: PolicySet = {
  chrome: {
    names: {
      conduct: 'Code of Conduct',
      terms: 'Terms of Use',
      privacy: 'Privacy Policy',
      consent: 'Parent & guardian consent',
    },
    policiesLabel: 'Policies',
    languageLabel: 'Language',
    lastUpdated: (date) => `Last updated ${date}`,
    onThisPage: 'On this page',
    translationNote: '',
    readInEnglish: '',
  },

  conduct: {
    title: 'Code of Conduct',
    description: 'How students, families, mentors and volunteers treat each other at Note by Note.',
    summary: (
      <p>
        Note by Note works because students, families and volunteers trust each other. This code applies to everyone
        with an account: students, parents and guardians, mentors, and volunteers on every team.
      </p>
    ),
    sections: [
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
    ],
  },

  terms: {
    title: 'Terms of Use',
    description: 'The terms for using the Note by Note website and taking part in its free music lessons.',
    summary: (
      <p>
        The short version: lessons are free, mentors are volunteers, keep everyone safe, and respect what other people
        share. The details are below.
      </p>
    ),
    sections: [
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
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    description: 'What information Note by Note keeps, why, and who can see it.',
    summary: (
      <p>
        We keep what we need to run free lessons and keep students safe. We don’t sell it, and we don’t use it for
        advertising.
      </p>
    ),
    sections: [
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
    ],
  },

  consent: {
    title: 'Parent & guardian consent',
    description: 'What parents and guardians agree to when a student under 18 takes lessons with Note by Note.',
    summary: (
      <p>
        Students under 18 need a parent or guardian’s consent before lessons start. Here’s what the lessons involve and
        what you’re agreeing to.
      </p>
    ),
    sections: [
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
    ],
  },
};
