'use client';

// Browser-side client for the Express API.
//
// Token handling note: the access token lives in memory only, and the refresh
// token in localStorage so a reload does not sign you out. localStorage is
// readable by any script on the page, so this trades a little XSS resistance
// for not having to run a session backend in Next. The upgrade path, if that
// trade stops being acceptable, is to proxy the API through Next route handlers
// and keep the refresh token in an httpOnly cookie — no change would be needed
// above this module.

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
const REFRESH_KEY = 'nbn.refresh';

let accessToken: string | null = null;

/**
 * The in-flight refresh, if any.
 *
 * Refresh tokens rotate: the server retires the old one the moment it is used.
 * If three requests 401 at once and each posts the same token, the first wins
 * and the other two look like a replay of a retired token — which the API
 * correctly treats as theft and answers by revoking the whole family. Sharing
 * one promise means the token is only ever spent once.
 */
let refreshInFlight: Promise<boolean> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

/** Subscribe to sign-in/sign-out so React can re-render. */
export function onAuthChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    // Private-mode browsers and blocked site data both throw here. Losing
    // persistence is survivable; crashing the page is not.
    return null;
  }
}

function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(REFRESH_KEY, token);
    else window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* see getRefreshToken */
  }
}

export function setSession(session: { accessToken: string; refreshToken: string } | null) {
  accessToken = session?.accessToken ?? null;
  setRefreshToken(session?.refreshToken ?? null);
  notify();
}

export function hasStoredSession(): boolean {
  return Boolean(accessToken || getRefreshToken());
}

/** Whether this tab already has a working sign-in pass (not just a saved token). */
export function hasAccessToken(): boolean {
  return Boolean(accessToken);
}

// Signing out in one tab signs out the others; signing in is picked up by
// them on their next request (AuthProvider listens for the change).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== REFRESH_KEY && event.key !== null) return;
    if (!event.newValue) accessToken = null;
    notify();
  });
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Per-question validation messages from a 422, keyed by question key. */
  get answerErrors(): Record<string, string> {
    const details = this.details as { answers?: Record<string, string> } | undefined;
    return details?.answers ?? {};
  }

  get code(): string | null {
    return (this.details as { code?: string } | undefined)?.code ?? null;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  let details: unknown;

  try {
    const body = await response.json();
    message = body?.error?.message ?? message;
    details = body?.error?.details;
  } catch {
    /* a non-JSON error body (a proxy's 502 page, say) keeps the default */
  }

  return new ApiError(response.status, message, details);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Trade the saved refresh token for a fresh pair.
 *
 * Staying signed in is the point, so the saved token is only forgotten when
 * the API says it's no good (401). A network hiccup, a server error or the
 * API waking up from sleep keeps it, so the next try (or the next visit)
 * still works.
 */
async function refreshWithSavedToken(attempt = 0): Promise<boolean> {
  // Read it fresh every time: another tab may have just renewed it.
  const token = getRefreshToken();
  if (!token) return false;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
  } catch {
    if (attempt < 2) {
      await wait(1500 * (attempt + 1));
      return refreshWithSavedToken(attempt + 1);
    }
    return false;
  }

  if (response.status === 409 && attempt < 3) {
    // Renewed a moment ago in another tab: give it time to save the new token, then use that.
    await wait(400);
    return refreshWithSavedToken(attempt + 1);
  }
  if (response.status === 401 || response.status === 409) {
    setSession(null);
    return false;
  }
  if (!response.ok) {
    if (response.status >= 500 && attempt < 2) {
      await wait(1500 * (attempt + 1));
      return refreshWithSavedToken(attempt + 1);
    }
    return false;
  }

  const body = await response.json();
  setSession({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
  return true;
}

/**
 * Tabs take turns. Every tab shares the one saved token, and the API retires
 * a token as soon as it's used, so two tabs renewing at once would trip its
 * theft check. A browser lock makes the second tab wait and then use the
 * token the first one saved.
 */
async function refreshSession(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('nbn-refresh', () => refreshWithSavedToken());
  }
  return refreshWithSavedToken();
}

function refreshOnce(): Promise<boolean> {
  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Send this file as the raw body instead of JSON (uploads). */
  file?: Blob;
  /** Send no Authorization header even if signed in (used by login/register). */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function request(path: string, options: RequestOptions, retrying = false): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.file) headers['Content-Type'] = options.file.type || 'application/octet-stream';
  else if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (!options.anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.file ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
    signal: options.signal,
  });

  if (response.status === 401 && !options.anonymous && !retrying) {
    // One retry, and only one: if the refreshed token also 401s, the session is
    // genuinely gone and looping would just spend refresh tokens.
    if (await refreshOnce()) return request(path, options, true);
  }

  if (!response.ok) throw await parseError(response);
  return response;
}

async function send<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await request(path, options);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Where a path on the API lives, for <img src> on public files like approved photos. */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) => send<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options: RequestOptions = {}) => send<T>(path, { ...options, method: 'DELETE' }),
  /** POST a file as the raw request body. */
  upload: <T>(path: string, file: Blob, options: RequestOptions = {}) =>
    send<T>(path, { ...options, method: 'POST', file }),
  /** Fetch a private file (signed in) as a Blob, e.g. to show or save it. */
  blob: async (path: string, options: RequestOptions = {}) => (await request(path, { ...options, method: 'GET' })).blob(),
};

/**
 * Restore a session on first load. The access token is gone after a reload, so
 * the stored refresh token is spent once to get a fresh pair.
 */
export async function restoreSession(): Promise<boolean> {
  if (accessToken) return true;
  if (!getRefreshToken()) return false;
  return refreshOnce();
}

// --- Test mode ---------------------------------------------------------------
//
// Staff can switch into a test account (see the API's routes/testing.ts). While
// they do, their own refresh token waits under STAFF_REFRESH_KEY so "return to
// my account" can restore it without signing in again.

const STAFF_REFRESH_KEY = 'nbn.staffRefresh';

function readKey(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string | null) {
  try {
    if (typeof window === 'undefined') return;
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* see getRefreshToken */
  }
}

async function revokeRefreshToken(token: string | null) {
  if (!token) return;
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
  } catch {
    /* best effort, as in signOut */
  }
}

export function isInTestSession(): boolean {
  return Boolean(readKey(STAFF_REFRESH_KEY));
}

/** Switch to a test account's session, keeping the staff session to come back to. */
export function beginTestSession(session: { accessToken: string; refreshToken: string }) {
  if (isInTestSession()) {
    // Hopping from one test account to another: retire the one being left.
    void revokeRefreshToken(getRefreshToken());
  } else {
    writeKey(STAFF_REFRESH_KEY, getRefreshToken());
  }
  setSession(session);
}

/** Leave the test account and restore the staff session. False if it could not be restored. */
export async function endTestSession(): Promise<boolean> {
  const staffToken = readKey(STAFF_REFRESH_KEY);
  const testToken = getRefreshToken();
  writeKey(STAFF_REFRESH_KEY, null);
  void revokeRefreshToken(testToken);

  if (!staffToken) {
    setSession(null);
    return false;
  }
  accessToken = null;
  setRefreshToken(staffToken);
  return refreshOnce();
}

export async function signOut(): Promise<void> {
  const token = getRefreshToken();
  // Signing out of a test session signs out of the staff session behind it too.
  const staffToken = readKey(STAFF_REFRESH_KEY);
  writeKey(STAFF_REFRESH_KEY, null);
  void revokeRefreshToken(staffToken);
  setSession(null);
  if (!token) return;

  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
  } catch {
    // The local session is already cleared; a failed server-side revoke is
    // worth neither blocking the redirect nor an error the user cannot act on.
  }
}
