// The sitemap at /sitemap.xml, which search engines read to find pages: the
// public pages, each policy in every language, and every published mentor's
// page. Rebuilt at most once an hour, so a newly published mentor shows up
// without a redeploy. Sign-in, dashboards and staff pages are left out.

import type { MetadataRoute } from 'next';
import { POLICY_LANGUAGES, POLICY_PATHS, policyHref, type PolicyKey } from '@/lib/policy-languages';
import { APPLY_LINKS, NAV_LINKS, POLICIES_UPDATED, SITE } from '@/lib/site';

export const revalidate = 3600;

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
const PUBLIC_PAGES = ['/', ...NAV_LINKS.map((link) => link.href), '/faq', '/apply', ...Object.values(APPLY_LINKS)];

const address = (path: string) => (path === '/' ? SITE.url : `${SITE.url}${path}`);

/** Published mentors, a page of 60 at a time (the most the API gives at once). */
async function mentorSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  try {
    for (let page = 1; page <= 50; page += 1) {
      const response = await fetch(`${API}/mentors?sort=name&limit=60&page=${page}`, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) break;
      const body = (await response.json()) as { data: { slug: string }[]; meta: { hasMore: boolean } };
      slugs.push(...body.data.map((mentor) => mentor.slug));
      if (!body.meta.hasMore) break;
    }
  } catch {
    // The API is asleep or down. The other pages are still listed, and the
    // mentors come back at the next rebuild.
  }
  return slugs;
}

/** One entry per language, each naming the others, so search engines show people their own language. */
function policyEntries(policy: PolicyKey): MetadataRoute.Sitemap {
  const languages = Object.fromEntries([
    ...POLICY_LANGUAGES.map((language) => [language.code === 'zh' ? 'zh-CN' : language.code, address(policyHref(POLICY_PATHS[policy], language.code))]),
    ['x-default', address(POLICY_PATHS[policy])],
  ]);
  return POLICY_LANGUAGES.map((language) => ({
    url: address(policyHref(POLICY_PATHS[policy], language.code)),
    lastModified: POLICIES_UPDATED[policy],
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mentors = await mentorSlugs();
  return [
    ...PUBLIC_PAGES.map((path) => ({ url: address(path) })),
    ...(Object.keys(POLICY_PATHS) as PolicyKey[]).flatMap(policyEntries),
    ...mentors.map((slug) => ({ url: address(`/find-a-mentor/${encodeURIComponent(slug)}`) })),
  ];
}
