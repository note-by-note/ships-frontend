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

async function refreshSession(): Promise<boolean> {
  const token = getRefreshToken();
  if (!token) return false;

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });

  if (!response.ok) {
    setSession(null);
    return false;
  }

  const body = await response.json();
  setSession({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
  return true;
}

function refreshOnce(): Promise<boolean> {
  refreshInFlight ??= refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  /** Send no Authorization header even if signed in (used by login/register). */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function send<T>(path: string, options: RequestOptions, retrying = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (!options.anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 401 && !options.anonymous && !retrying) {
    // One retry, and only one: if the refreshed token also 401s, the session is
    // genuinely gone and looping would just spend refresh tokens.
    if (await refreshOnce()) return send<T>(path, options, true);
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) => send<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>(path, { ...options, method: 'PATCH', body }),
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

export async function signOut(): Promise<void> {
  const token = getRefreshToken();
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
