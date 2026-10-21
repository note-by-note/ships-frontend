'use client';

// Vercel Web Analytics: page views only, no cookies. It only reports from the
// Vercel deployment; on localhost it does nothing.
//
// Before anything is sent, the URL is trimmed: query strings and #fragments
// are dropped, and database ids in paths (a conversation, an application, a
// test account) become "[id]". Mentor page slugs stay, since those pages are
// public and it's useful to see which ones people visit.

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';

const OBJECT_ID = /^[0-9a-f]{24}$/i;

export function redactUrl(raw: string): string {
  const url = new URL(raw);
  const path = url.pathname
    .split('/')
    .map((segment) => (OBJECT_ID.test(segment) ? '[id]' : segment))
    .join('/');
  return `${url.origin}${path}`;
}

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return { ...event, url: redactUrl(event.url) };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
