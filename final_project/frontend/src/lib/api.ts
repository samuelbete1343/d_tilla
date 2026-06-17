/**
 * api.ts — Thin fetch wrapper for Tilla
 *
 * BUG FIX #8 — drainQueue() now called BEFORE isRefreshing = false.
 *   Previously: drainQueue() resolved waiting promises, which could
 *   immediately fire new requests. Those new requests entered apiFetch()
 *   and saw isRefreshing = true (still set from the finally block ordering),
 *   causing them to queue forever. Fixed by draining THEN clearing the flag
 *   inside the try block before the finally resets it.
 *
 * ADDED — unwrap() helper.
 *   Since CustomJSONRenderer wraps every response in
 *   { success, message, data, error }, all API callers need to unwrap
 *   the inner payload. This helper does it consistently.
 *
 * FIX D2 (retained) — tryRefresh() stores rotated refresh token.
 * FIX D3 (retained) — concurrent 401s share one refresh attempt.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const STORAGE_TOKEN   = "tilla_token";
const STORAGE_REFRESH = "tilla_refresh";
const STORAGE_USER    = "tilla_user";

// ---------------------------------------------------------------------------
// Refresh-queue state
// ---------------------------------------------------------------------------

let isRefreshing = false;

type QueueResolver = (token: string | null) => void;
let refreshQueue: QueueResolver[] = [];

function drainQueue(newToken: string | null) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHeaders(options: RequestInit, token: string | null): Headers {
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

/**
 * Calls /api/auth/token/refresh/ with the stored refresh token.
 * Stores both the new access token and the new (rotated) refresh token.
 * Returns the new access token, or null on any failure.
 */
async function tryRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem(STORAGE_REFRESH);
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const raw = await res.json();

    // Handle both raw simplejwt response AND our renderer envelope:
    // { access, refresh }  OR  { data: { access, refresh } }
    const payload = raw.data ?? raw;
    const newAccess: string | undefined = payload.access;
    if (!newAccess) return null;

    localStorage.setItem(STORAGE_TOKEN, newAccess);

    if (payload.refresh) {
      localStorage.setItem(STORAGE_REFRESH, payload.refresh);
    }

    return newAccess;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_REFRESH);
}

// ---------------------------------------------------------------------------
// unwrap() — extracts inner payload from the renderer envelope
//
// Our CustomJSONRenderer wraps every response:
//   { success: true, message: "...", data: <actual payload>, error: null }
//
// Use this in every component that calls apiFetch():
//   const res  = await apiFetch("/courses/");
//   const body = await res.json();
//   const data = unwrap(body);   // → the actual courses array / object
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data:    T | null;
  error:   unknown;
}

export function unwrap<T = unknown>(body: ApiEnvelope<T>): T {
  if (!body.success) {
    const msg =
      typeof body.error === "string"
        ? body.error
        : body.message ?? "Request failed";
    throw new Error(msg);
  }
  return body.data as T;
}

// ---------------------------------------------------------------------------
// Main fetch wrapper
// ---------------------------------------------------------------------------

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token   = localStorage.getItem(STORAGE_TOKEN);
  const headers = buildHeaders(options, token);

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  // Happy path
  if (response.status !== 401) return response;

  // FIX D3 — a refresh is already in progress; join the queue.
  if (isRefreshing) {
    const newToken = await new Promise<string | null>((resolve) => {
      refreshQueue.push(resolve);
    });

    if (!newToken) return response;

    const retryHeaders = buildHeaders(options, newToken);
    return fetch(`${API_URL}${endpoint}`, { ...options, headers: retryHeaders });
  }

  // First 401 — own the refresh attempt.
  isRefreshing = true;
  try {
    const newToken = await tryRefresh();

    // BUG FIX #8 — drain BEFORE clearing isRefreshing so queued requests
    // see isRefreshing=false when they re-enter apiFetch(), not true.
    drainQueue(newToken);
    isRefreshing = false;   // <-- clear here, not in finally

    if (!newToken) {
      clearAuth();
      window.dispatchEvent(new Event("tilla:auth:expired"));
      return response;
    }

    const retryHeaders = buildHeaders(options, newToken);
    return fetch(`${API_URL}${endpoint}`, { ...options, headers: retryHeaders });
  } catch {
    isRefreshing = false;
    drainQueue(null);
    clearAuth();
    window.dispatchEvent(new Event("tilla:auth:expired"));
    return response;
  }
}
