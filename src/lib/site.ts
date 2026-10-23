// Site-wide content for the public pages: navigation, contact details and the
// instrument list. Anything the team has not confirmed yet is `null`, and the
// pages show a visible "to be confirmed" placeholder rather than a made-up value.

export const SITE = {
  name: 'Note by Note',
  tagline: 'Free online music tutoring, run by students.',
  /** Not confirmed yet. Set this and every "Email us" link on the site goes live. */
  contactEmail: null as string | null,
  /**
   * The Formspree form the contact page sends messages to: the ID at the end
   * of the form's endpoint, https://formspree.io/f/<this part>. While null,
   * the contact page shows no form.
   */
  formspreeFormId: 'xoeeqooo' as string | null,
  /** Google Analytics 4 measurement ID. Set to null to turn Google Analytics off. */
  googleAnalyticsId: 'G-HGJBD8MB3Q' as string | null,
};

/**
 * Direct links to each application, used by every "Apply…" / "Volunteer…"
 * button. These are the starter forms' slugs (`npm run seed:forms`). A form's
 * slug can't change once made, so these only need updating if the team
 * replaces a form with a new one. If a form is closed, its page says so.
 */
export const APPLY_LINKS = {
  student: '/apply/student-application',
  mentor: '/apply/mentor-application',
  volunteer: '/apply/volunteer-application',
} as const;

export const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/instruments', label: 'Instruments' },
  { href: '/find-a-mentor', label: 'Find a mentor' },
  { href: '/for-mentors', label: 'For mentors' },
  { href: '/about', label: 'About' },
  { href: '/partners', label: 'Partners' },
  { href: '/contact', label: 'Contact' },
];

export const FOOTER_LINKS = [
  {
    title: 'Students',
    links: [
      { href: APPLY_LINKS.student, label: 'Apply for lessons' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/instruments', label: 'Instruments' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Volunteers',
    links: [
      { href: '/for-mentors', label: 'Mentoring' },
      { href: APPLY_LINKS.mentor, label: 'Volunteer as a mentor' },
      { href: APPLY_LINKS.volunteer, label: 'Join tech, marketing or outreach' },
      { href: '/apply', label: 'All applications' },
    ],
  },
  {
    title: 'Note by Note',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/partners', label: 'Schools & partners' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export type InstrumentFamily = 'Keys' | 'Strings' | 'Woodwinds' | 'Brass' | 'Percussion' | 'Theory';

/**
 * Mirrors the API's instrument list (`ships-api/src/schema/enums.ts`), so what
 * the site advertises matches what the application forms accept.
 */
export const INSTRUMENT_FAMILIES: { family: InstrumentFamily; blurb: string; instruments: string[] }[] = [
  { family: 'Keys', blurb: 'A great place to start reading music.', instruments: ['Piano'] },
  {
    family: 'Strings',
    blurb: 'Bowed and plucked, from classical to campfire songs.',
    instruments: ['Violin', 'Viola', 'Cello', 'String Bass', 'Guitar', 'Ukulele'],
  },
  {
    family: 'Woodwinds',
    blurb: 'The voices of the band and the orchestra.',
    instruments: [
      'Flute',
      'Clarinet',
      'Bass Clarinet',
      'Oboe',
      'Bassoon',
      'Soprano Saxophone',
      'Alto Saxophone',
      'Tenor Saxophone',
    ],
  },
  {
    family: 'Brass',
    blurb: 'Bright, bold and at the heart of most school bands.',
    instruments: ['Trumpet', 'French Horn', 'Trombone', 'Euphonium', 'Tuba'],
  },
  { family: 'Percussion', blurb: 'Rhythm first, then everything else.', instruments: ['Percussion', 'Xylophone'] },
  { family: 'Theory', blurb: 'How music works, for any instrument.', instruments: ['Music Theory'] },
];
