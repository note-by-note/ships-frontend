// Site-wide content for the public pages: navigation, contact details and the
// instrument list. Anything the team has not confirmed yet is `null`, and the
// pages show a visible "to be confirmed" placeholder rather than a made-up value.

export const SITE = {
  name: 'Note by Note',
  tagline: 'Free online music tutoring, run by students.',
  /** Not confirmed yet. Set this and every "Email us" link on the site goes live. */
  contactEmail: null as string | null,
};

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
      { href: '/apply', label: 'Apply for lessons' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/instruments', label: 'Instruments' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Volunteers',
    links: [
      { href: '/for-mentors', label: 'Become a mentor' },
      { href: '/for-mentors#other-teams', label: 'Tech, marketing & outreach' },
      { href: '/apply', label: 'Open applications' },
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
