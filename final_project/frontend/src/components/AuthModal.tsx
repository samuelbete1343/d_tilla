/**
 * AuthModal — Quick signup/login modal used from the landing page.
 * Calls the real API. No fake timeouts.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Lock, GraduationCap, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/api";

interface AuthModalProps {
  isOpen:           boolean;
  onClose:          () => void;
  onSuccess?:       () => void;
  initialProgram?:  string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialProgram = "entrance-prep",
}: AuthModalProps) {
  const { login }  = useAuth();
  const [tab,      setTab]      = useState<"signup" | "login">("signup");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Shared fields
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  // Signup-only fields
  const [name,     setName]     = useState("");
  const [gender,   setGender]   = useState("male");
  const [program,  setProgram]  = useState(initialProgram);

  const reset = () => {
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          password,
          confirm_password: password,
          gender,
          program,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        return;
      }
      login(data.user, data.access, data.refresh);
      reset();
      onClose();
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Invalid email or password.");
        return;
      }
      login(data.user, data.access, data.refresh);
      reset();
      onClose();
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[32px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-mango/10 rounded-2xl text-mango mb-4">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                {tab === "signup" ? "Join Tilla" : "Welcome Back"}
              </h2>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
              {(["signup", "login"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    tab === t
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                      : "text-slate-500"
                  }`}
                >
                  {t === "signup" ? "Sign Up" : "Login"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}

            {tab === "signup" ? (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 8 characters)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`p-3 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
                        gender === g
                          ? "border-mango bg-mango/5 text-mango"
                          : "border-slate-100 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {gender === g && <CheckCircle2 className="w-4 h-4" />}
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Program */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "entrance-prep",   label: "Entrance Prep" },
                    { id: "freshman-portal", label: "Freshman Portal" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProgram(p.id)}
                      className={`p-3 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
                        program === p.id
                          ? "border-mango bg-mango/5 text-mango"
                          : "border-slate-100 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {program === p.id && <CheckCircle2 className="w-4 h-4" />}
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-mango text-white text-sm font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-mango/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-mango text-white text-sm font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-mango/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
