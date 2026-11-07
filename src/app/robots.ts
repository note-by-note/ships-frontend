// robots.txt: points search engines to the sitemap and asks them to skip the
// signed-in areas and private consent links (`?t=`). This only asks: those
// pages are protected by signing in, not by this file.

import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/applications', '/*?t='],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
