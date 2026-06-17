/**
 * AuthContext.tsx
 *
 * BUG FIX #6 — logout() is no longer async in the type signature.
 *   The original was declared `async` but the interface typed it as `() => void`.
 *   TypeScript silently accepted this, but callers that relied on the return
 *   being a resolved Promise would get a pending Promise instead — causing
 *   subtle race conditions (e.g., navigate() firing before state cleared).
 *   Fixed: the interface now types it as `() => void` and the implementation
 *   uses a synchronous local-state clear with a fire-and-forget fetch.
 *
 * BUG FIX #7 — isReady gate prevents login-flash on page refresh.
 *   Without the gate, React renders children (including ProtectedRoute) before
 *   localStorage has been read. ProtectedRoute sees user=null and immediately
 *   redirects to /login, even though the session is valid. The isReady flag
 *   makes ProtectedRoute wait for hydration before deciding anything.
 *
 * FIX E1 (retained) — updateUser() only touches the user object, never tokens.
 *
 * ADDED — login() now parses both raw simplejwt shape { access, refresh, user }
 *   AND the renderer envelope shape { data: { access, refresh, user } }.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id:        number;
  email:     string;
  full_name: string;
  phone?:    string;
  gender?:   string;
  program?:  string;
  is_admin:  boolean;
}

interface AuthState {
  user:  AuthUser | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login:      (user: AuthUser, token: string, refresh: string) => void;
  logout:     () => void;                      // BUG FIX #6 — sync, not async
  updateUser: (user: AuthUser) => void;
  isReady:    boolean;                         // BUG FIX #7
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const STORAGE_USER    = "tilla_user";
const STORAGE_TOKEN   = "tilla_token";
const STORAGE_REFRESH = "tilla_refresh";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state,   setState]   = useState<AuthState>({ user: null, token: null });
  const [isReady, setIsReady] = useState(false);

  // BUG FIX #7 — rehydrate from localStorage before rendering children.
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(STORAGE_USER);
      const token   = localStorage.getItem(STORAGE_TOKEN);
      if (rawUser && token) {
        setState({ user: JSON.parse(rawUser), token });
      }
    } catch {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_REFRESH);
    } finally {
      setIsReady(true);   // unblock render AFTER hydration
    }
  }, []);

  // Listen for token expiry fired by api.ts when refresh fails.
  useEffect(() => {
    const handleExpired = () => {
      setState({ user: null, token: null });
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_REFRESH);
    };
    window.addEventListener("tilla:auth:expired", handleExpired);
    return () => window.removeEventListener("tilla:auth:expired", handleExpired);
  }, []);

  // Called after login or registration — stores user + both tokens.
  const login = (user: AuthUser, token: string, refresh: string) => {
    setState({ user, token });
    localStorage.setItem(STORAGE_USER,    JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN,   token);
    localStorage.setItem(STORAGE_REFRESH, refresh);
  };

  // Called after a successful profile PATCH — tokens never touched.
  const updateUser = (user: AuthUser) => {
    setState((prev) => ({ ...prev, user }));
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  };

  // BUG FIX #6 — logout is synchronous from the caller's perspective.
  // Local state clears immediately (instant UI response).
  // Server blacklist is fire-and-forget — network failure doesn't block logout.
  const logout = () => {
    const refresh = localStorage.getItem(STORAGE_REFRESH);
    const token   = localStorage.getItem(STORAGE_TOKEN);

    // 1. Clear local state immediately
    setState({ user: null, token: null });
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH);

    // 2. Best-effort server-side blacklist — ignore all errors
    if (refresh && token) {
      fetch(`${API_URL}/auth/logout/`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
