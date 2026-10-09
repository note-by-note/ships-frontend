// Mentor directory data.
//
// Static for now: the API has no public mentor listing yet. The first four
// mentors are the ones in the Figma homepage; the rest fill out the filters.
// When an endpoint exists, replace MENTORS with a fetch and keep the shape.

export const INSTRUMENTS = [
  'Piano',
  'Guitar',
  'Violin',
  'Voice',
  'Drums',
  'Woodwinds',
  'Ukulele',
  'Music Theory',
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];

export interface Mentor {
  id: string;
  name: string;
  /** What the card's tag shows, e.g. "Alto Sax" — more specific than the filter category. */
  focus: string;
  instruments: Instrument[];
  experience: string;
  languages: string[];
  availability: string;
  quote: string;
}

export const MENTORS: Mentor[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    focus: 'Guitar',
    instruments: ['Guitar'],
    experience: '2+ Years Mentoring',
    languages: ['English'],
    availability: 'Weekday evenings',
    quote: 'Watching my students unlock a song they love is the absolute best feeling.',
  },
  {
    id: 'david',
    name: 'David',
    focus: 'Guitar & Ukulele',
    instruments: ['Guitar', 'Ukulele'],
    experience: 'International Concerts',
    languages: ['English', 'French'],
    availability: 'Weekends',
    quote: 'We start with songs that bring joy, technique follows naturally from there.',
  },
  {
    id: 'clara-moreno',
    name: 'Clara Moreno',
    focus: 'Violin',
    instruments: ['Violin'],
    experience: 'Orchestra Musician',
    languages: ['Spanish', 'Portuguese'],
    availability: 'Weekday afternoons',
    quote: 'Violin is expressive and beautiful. I make sure every child finds their voice.',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    focus: 'Alto Sax',
    instruments: ['Woodwinds'],
    experience: 'Jazz',
    languages: ['English'],
    availability: 'Weekday evenings',
    quote: "Rhythm is the heartbeat of all music. Let's make it fun and active!",
  },
  {
    id: 'priya',
    name: 'Priya',
    focus: 'Piano & Theory',
    instruments: ['Piano', 'Music Theory'],
    experience: 'Grade 10 RCM',
    languages: ['English', 'Hindi'],
    availability: 'Weekends',
    quote: 'Theory is just the story behind the sounds. Once it clicks, everything opens up.',
  },
  {
    id: 'jonah',
    name: 'Jonah',
    focus: 'Drums',
    instruments: ['Drums'],
    experience: 'School Jazz Band',
    languages: ['English'],
    availability: 'Weekday afternoons',
    quote: 'No drum kit at home? No problem. We can start with a pair of pencils.',
  },
  {
    id: 'mei',
    name: 'Mei',
    focus: 'Voice',
    instruments: ['Voice'],
    experience: 'Community Choir Lead',
    languages: ['English', 'Mandarin'],
    availability: 'Weekday evenings',
    quote: 'Everyone can sing. My job is to help you hear how good you already sound.',
  },
  {
    id: 'lucas',
    name: 'Lucas',
    focus: 'Piano',
    instruments: ['Piano'],
    experience: '3+ Years Mentoring',
    languages: ['French', 'English'],
    availability: 'Weekends',
    quote: 'Small wins every week. By the end of the month you will surprise yourself.',
  },
];

export const LANGUAGES = [...new Set(MENTORS.flatMap((mentor) => mentor.languages))].sort();
