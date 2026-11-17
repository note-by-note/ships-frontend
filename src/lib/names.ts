// How mentors are named in public: first name and last initial, "Paul H.".
// The API does the same for public pages (`ships-api/src/util/names.ts`);
// this copy is for the mentor's own preview of their page.

const TEST_SUFFIX = /\s*\(test\)$/;

export function publicName(name: string): string {
  const test = TEST_SUFFIX.test(name);
  const parts = name.replace(TEST_SUFFIX, '').trim().split(/\s+/);
  if (parts.length < 2) return name;
  const initial = parts[parts.length - 1].charAt(0).toLocaleUpperCase();
  return `${parts[0]} ${initial}.${test ? ' (test)' : ''}`;
}
