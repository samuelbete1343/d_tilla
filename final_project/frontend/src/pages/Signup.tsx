/**
 * Signup.tsx
 *
 * BUG FIX #9 — Redirect already-logged-in users away from /signup.
 *
 * BUG FIX #10 — Better DRF error parsing.
 *   Old: Object.values(data)[0]  — grabbed first value regardless of key,
 *   could show internal field names or array objects as raw strings.
 *   New: iterates known error keys in priority order, falls back to message.
 *
 * ADDED — renderer envelope handling.
 *   CustomJSONRenderer wraps the response: { success, message, data, error }.
 *   Success: tokens at body.data.access / body.data.refresh / body.data.user
 *   Error:   validation errors at body.error (a field→messages dict from DRF)
 */

import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, User, Phone, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ---------------------------------------------------------------------------
// Error parsing
// ---------------------------------------------------------------------------

/**
 * DRF validation errors come back as:
 *   { email: ["already exists"], password: ["too common"], non_field_errors: [...] }
 *
 * We pick the first human-readable message in a sensible priority order.
 */
function extractDrfError(errorObj: unknown): string {
  if (typeof errorObj === "string") return errorObj;
  if (!errorObj || typeof errorObj !== "object") return "Registration failed. Please try again.";

  const err = errorObj as Record<string, unknown>;

  // Priority order: non_field_errors first (general), then specific fields
  const priority = ["non_field_errors", "email", "password", "confirm_password", "phone", "full_name"];

  for (const key of priority) {
    const val = err[key];
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === "string" && val) return val;
  }

  // Fall back to first value from any remaining key
  for (const val of Object.values(err)) {
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === "string" && val) return val;
  }

  return "Registration failed. Please try again.";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Signup() {
  const navigate          = useNavigate();
  const { login, user, isReady } = useAuth();

  const [form, setForm] = useState({
    full_name:        "",
    email:            "",
    phone:            "",
    gender:           "male",
    program:          "freshman-portal",
    password:         "",
    confirm_password: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // BUG FIX #9 — already logged in
  if (isReady && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const body = await res.json();

      if (!res.ok) {
        // BUG FIX #10 — renderer puts DRF field errors in body.error
        setError(extractDrfError(body.error ?? body));
        return;
      }

      // Renderer envelope: { data: { access, refresh, user } }
      const payload = body.data ?? body;
      login(payload.user, payload.access, payload.refresh);
      navigate("/dashboard");
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
        <div className="w-full max-w-xl">
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
                Create Account
              </h1>
              <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-bold">
                Join thousands of students succeeding with Tilla
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-[11px] md:text-sm font-bold text-center">
                  {error}
                </div>
              )}

              {/* Full name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={form.full_name}
                      onChange={set("full_name")}
                      placeholder="Abebe Bikila"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                    Phone
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+251 9..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, gender: g }))}
                        className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${
                          form.gender === g
                            ? "border-mango bg-mango/5 text-mango"
                            : "border-slate-100 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        {form.gender === g && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Program */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                  Your Program
                </label>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { id: "entrance-prep",   label: "Entrance Prep" },
                    { id: "freshman-portal", label: "Freshman Portal" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, program: p.id }))}
                      className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-1.5 ${
                        form.program === p.id
                          ? "border-mango bg-mango/5 text-mango"
                          : "border-slate-100 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {form.program === p.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {(
                  [
                    { field: "password",         label: "Password",         complete: "new-password" },
                    { field: "confirm_password",  label: "Confirm Password", complete: "new-password" },
                  ] as const
                ).map(({ field, label, complete }) => (
                  <div key={field} className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">
                      {label}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
                      <input
                        type="password"
                        required
                        autoComplete={complete}
                        value={form[field]}
                        onChange={set(field)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-11 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mango text-white text-xs md:text-sm font-black uppercase tracking-widest py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-xl shadow-mango/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-bold">
                Already have an account?{" "}
                <Link to="/login" className="text-mango font-black ml-1 hover:underline">
                  Login here
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
