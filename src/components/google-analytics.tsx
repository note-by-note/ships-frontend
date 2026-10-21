'use client';

// Google Analytics 4 (gtag.js), set up for a site with young users:
//   - Google signals and ad personalisation are off, so visits aren't tied to
//     Google accounts or used for advertising
//   - page views are sent by hand on every route change, with the same
//     trimmed URL Vercel Analytics gets (no query strings, ids as "[id]"),
//     instead of gtag's automatic page_view with the raw URL
//   - it only loads in production builds, so local development isn't counted

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SITE } from '@/lib/site';
import { redactUrl } from './site-analytics';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let configured = false;

// gtag.js reads its queue as `arguments` objects, not arrays, so this has to
// push `arguments` itself. Calls made before the script loads wait in the queue.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

export function GoogleAnalytics() {
  const id = SITE.googleAnalyticsId;
  const pathname = usePathname();
  const enabled = Boolean(id) && process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!enabled || !id) return;
    if (!configured) {
      configured = true;
      gtag('js', new Date());
      gtag('config', id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
    const location = redactUrl(window.location.href);
    gtag('event', 'page_view', {
      page_location: location,
      page_path: new URL(location).pathname,
      page_title: document.title,
    });
  }, [enabled, id, pathname]);

  if (!enabled) return null;
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />;
}
