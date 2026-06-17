/**
 * Login.tsx
 *
 * BUG FIX #9 — Redirect already-logged-in users away from /login.
 *   Previously, a logged-in user could navigate to /login, the form would
 *   render normally, and if they submitted they'd overwrite their existing
 *   session with a new one. Now we check isReady + user and immediately
 *   redirect to /dashboard (or the ?next= param).
 *
 * ADDED — renderer envelope handling.
 *   Since CustomJSONRenderer wraps responses, the token payload is at
 *   data.access / data.refresh / data.user (not raw.access etc.).
 *   BUT: login/register views return { access, refresh, user } directly as
 *   the response body — the renderer then puts that in "data". So the
 *   frontend reads body.data.access, body.data.refresh, body.data.user.
 *
 * FIX C3 (retained) — ?next= redirect consumed after login.
 * FIX C1 (retained) — "Forgot password?" link.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Login() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, isReady } = useAuth();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  // BUG FIX #9 — redirect already-authenticated users
  if (isReady && user) {
    const next = searchParams.get("next") || "/dashboard";
    return <Navigate to={next} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const body = await res.json();

      if (!res.ok) {
        // Renderer puts error details in body.error; detail messages in body.error.detail
        const errDetail =
          (typeof body.error === "object" && body.error?.detail) ||
          (typeof body.error === "string" && body.error) ||
          body.message ||
          "Login failed. Please try again.";
        setError(errDetail);
        return;
      }

      // CustomJSONRenderer envelope: { success, message, data: { access, refresh, user } }
      const payload = body.data ?? body;
      login(payload.user, payload.access, payload.refresh);

      const next = searchParams.get("next") || "/dashboard";
      navigate(next, { replace: true });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-5 sm:px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none"
          >
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-mango/10 rounded-xl md:rounded-2xl text-mango mb-4 md:mb-6">
                <GraduationCap className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h1 className="text-xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-bold">
                Login to continue your learning journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800/30">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-11 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mango text-white text-xs md:text-sm font-black uppercase tracking-widest py-3 md:py-4 rounded-xl md:rounded-2xl shadow-xl shadow-mango/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Login Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </>
                )}
              </button>

              {/* Forgot password */}
              <div className="text-center pt-1">
                <Link
                  to="/forgot-password"
                  className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 hover:text-mango dark:hover:text-mango transition-colors font-bold"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-bold">
                Don't have an account?{" "}
                <Link to="/signup" className="text-mango font-black ml-1 hover:underline">
                  Join Tilla
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
