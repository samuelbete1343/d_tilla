/**
 * Checkout.tsx — API-driven  (replaces static courseCatalogue version)
 *
 * Flow:
 *  1. Cart holds String(course.id) — the integer Django PK.
 *  2. On mount, fetch GET /api/courses/ to resolve PKs → display titles.
 *  3. On submit, POST /api/payments/request/ with { selected_course_ids: [pk, ...] }.
 *
 * No imports from courseCatalogue.ts / ALL_COURSES.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useCart, MAX_COURSE_SELECTION } from '../context/CartContext';
import { apiFetch, unwrap, type ApiEnvelope } from '../lib/api';
import {
  ArrowLeft, CheckCircle2, Clock, ExternalLink,
  Send, AlertCircle, BookOpen, Smartphone, Loader2, X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ApiCourseSummary {
  id:    number;
  title: string;
  slug:  string;
}

interface SubmitResponse {
  id:               number;
  status:           string;
  status_display:   string;
  amount:           string;
  selected_courses: { id: number; title: string; slug: string }[];
  created_at:       string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Checkout() {
  const navigate = useNavigate();
  const { selectedCourses, clearCart, selectionCount, toggleCourse } = useCart();

  const [submitting,      setSubmitting]      = useState(false);
  const [submitted,       setSubmitted]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // Pre-submission status check
  const [statusLoading,   setStatusLoading]   = useState(true);
  const [hasPending,      setHasPending]      = useState(false);
  const [hasMaxAccess,    setHasMaxAccess]    = useState(false);
  const [unlockedCount,   setUnlockedCount]   = useState(0);
  const [maxCourses,      setMaxCourses]      = useState(MAX_COURSE_SELECTION);

  // Resolved course data from the API
  const [cartCourses,     setCartCourses]     = useState<ApiCourseSummary[]>([]);
  const [loadingCart,     setLoadingCart]     = useState(true);

  // ── Pre-flight: check for existing pending/approved request ─────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatusLoading(true);
      try {
        const res  = await apiFetch('/payments/status/');
        if (!res.ok || cancelled) return;
        const body = await res.json();
        const data = unwrap<{
          has_pending_request:   boolean;
          has_approved_request:  boolean;
          unlocked_course_count: number;
          max_courses:           number;
        }>(body);
        if (!cancelled && data) {
          setHasPending(data.has_pending_request);
          setUnlockedCount(data.unlocked_course_count);
          setMaxCourses(data.max_courses);
          // Block if already at max unlocked courses
          setHasMaxAccess(data.unlocked_course_count >= data.max_courses && data.has_approved_request);
        }
      } catch {
        // non-fatal — we still allow submission attempt; backend will validate
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Resolve cart IDs → course details ────────────────────────────────────
  useEffect(() => {
    if (selectedCourses.length === 0) return;
    let cancelled = false;

    async function resolve() {
      setLoadingCart(true);
      try {
        const res  = await apiFetch('/courses/');
        const body = await res.json();

        // Same two-wrapper shape as CourseListingSection:
        //   { success, data: { count, next, previous, results: [...] } }
        const inner = Array.isArray(body) ? body : unwrap<unknown>(body);
        const all: ApiCourseSummary[] = Array.isArray(inner)
          ? inner
          : (inner as any)?.results ?? [];

        // selectedCourses stores String(pk)
        const pkSet = new Set(selectedCourses.map(Number));
        const matched = all.filter(c => pkSet.has(c.id));
        if (!cancelled) setCartCourses(matched);
      } catch {
        // non-fatal — we still have the PKs to submit
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [selectedCourses.join(',')]);

  // Guard: nothing selected
  const isEmpty = selectedCourses.length === 0 && !submitted;
  useEffect(() => {
    if (isEmpty) navigate('/explore-courses', { replace: true });
  }, [isEmpty, navigate]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    // ── Pre-submit guards (fast-fail before hitting the API) ────────────────
    if (hasPending) {
      setError(
        'You already have a pending payment request. ' +
        'Please wait for admin review before submitting another.'
      );
      return;
    }

    if (hasMaxAccess) {
      setError(
        `You already have access to the maximum allowed courses (${maxCourses}). ` +
        'No further submission is needed.'
      );
      return;
    }

    if (unlockedCount + selectionCount > maxCourses) {
      setError(
        `You already have ${unlockedCount} unlocked course(s). ` +
        `You can only select ${maxCourses - unlockedCount} more.`
      );
      return;
    }
    // ────────────────────────────────────────────────────────────────────────

    setSubmitting(true);

    try {
      const resolvedPks = selectedCourses.map(Number).filter(n => !isNaN(n) && n > 0);

      if (resolvedPks.length === 0) {
        setError('Could not resolve selected courses. Please go back and re-select.');
        return;
      }

      const res = await apiFetch('/payments/request/', {
        method: 'POST',
        body:   JSON.stringify({ selected_course_ids: resolvedPks }),
      });

      // Parse the response — always JSON from our backend
      let body: ApiEnvelope | Record<string, unknown> = {};
      try {
        body = await res.json();
      } catch {
        // Body was not JSON (e.g. 502/504 from reverse proxy)
        setError(
          res.status >= 500
            ? 'Server error. Please try again in a moment.'
            : 'Unexpected response from server. Please try again.'
        );
        return;
      }

      if (!res.ok) {
        // Our backend ALWAYS wraps errors: { success:false, error: { field: [msg] } }
        // We must read body.error, NOT body directly.
        const envelope = body as ApiEnvelope;
        const err      = envelope?.error;

        let msg: string;

        if (typeof err === 'string') {
          // Backend sent a plain string error
          msg = err;
        } else if (err && typeof err === 'object') {
          // DRF field errors — look in envelope.error for the real messages
          const errObj = err as Record<string, unknown>;
          msg =
            (errObj?.non_field_errors as string[])?.[0]
            ?? (errObj?.selected_course_ids as string[])?.[0]
            ?? (errObj?.detail as string)
            ?? envelope?.message
            ?? 'Something went wrong. Please try again.';
        } else {
          msg = (envelope as any)?.message ?? 'Something went wrong. Please try again.';
        }

        // Humanise the most common backend validation messages
        if (msg.includes('pending payment request')) {
          msg = 'You already have a pending request. Please wait for admin review.';
          setHasPending(true); // update local guard state
        } else if (msg.includes('at most 7') || msg.includes('at most')) {
          msg = 'You already selected the maximum allowed courses (7). Remove some and try again.';
        }

        setError(msg);
        return;
      }

      // Success — redirect to dashboard so it re-fetches updated status
      clearCart();
      setSubmitted(true);
      // Small delay so setSubmitted renders the success screen briefly,
      // then navigate. Or go immediately — both work.
      navigate('/dashboard?submitted=1', { replace: true });
    } catch (networkErr) {
      // Only true network failures (no internet, CORS block, etc.) reach here
      console.error('[Checkout] submission network error:', networkErr);
      setError('Network error. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
              Payment Request Submitted!
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8 font-bold leading-relaxed">
              Your payment request has been recorded. Now send your payment receipt to{' '}
              <a
                href="https://t.me/Tilla_Register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mango hover:underline"
              >
                @Tilla_Register
              </a>{' '}
              on Telegram. Access will be unlocked within 5 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://t.me/Tilla_Register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-mango text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-mango/90 transition-all shadow-lg shadow-mango/20"
              >
                <Send className="w-4 h-4" />
                Open Telegram
                <ExternalLink className="w-3 h-3" />
              </a>
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-mango mb-8 transition-colors font-black uppercase tracking-widest text-[10px] md:text-xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
            Checkout
          </h1>
          <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest mb-8">
            {selectionCount} / {MAX_COURSE_SELECTION} courses selected
          </p>

          {/* Order summary */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] p-6 md:p-8 mb-6">
            <h2 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-tight text-base md:text-xl mb-4">
              Order Summary
            </h2>

            {loadingCart ? (
              <div className="flex items-center gap-2 py-4 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCourses.map(pk => {
                  const course = cartCourses.find(c => String(c.id) === pk);
                  return (
                    <div
                      key={pk}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-mango/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-mango" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-xs md:text-sm uppercase tracking-tight">
                            {course?.title ?? `Course #${pk}`}
                          </p>
                          {course?.slug && (
                            <p className="text-[9px] text-slate-400 font-mono font-bold">{course.slug}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCourse(pk)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment instructions */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl md:rounded-[32px] p-6 md:p-8 mb-6">
            <h2 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-tight text-base md:text-xl mb-4">
              Payment Instructions
            </h2>
            <ol className="space-y-3 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-bold">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 bg-mango/20 text-mango rounded-full flex items-center justify-center font-black text-[10px]">1</span>
                Click "Submit Payment Request" below.
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 bg-mango/20 text-mango rounded-full flex items-center justify-center font-black text-[10px]">2</span>
                Transfer <strong>100 ETB per course</strong> via Telebirr / CBE to our registered number.
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 bg-mango/20 text-mango rounded-full flex items-center justify-center font-black text-[10px]">3</span>
                Send your payment screenshot to{' '}
                <a href="https://t.me/Tilla_Register" target="_blank" rel="noopener noreferrer" className="text-mango hover:underline">
                  @Tilla_Register
                </a>{' '}
                on Telegram.
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 bg-mango/20 text-mango rounded-full flex items-center justify-center font-black text-[10px]">4</span>
                Access is unlocked within 5 hours once verified.
              </li>
            </ol>
          </div>

          {/* Device note */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl mb-6">
            <Smartphone className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-tight">
              Access works on any device — mobile, tablet, and desktop.
            </p>
          </div>

          {/* Pending request warning */}
          {!statusLoading && hasPending && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-amber-700 dark:text-amber-400 font-bold">
                  You already have a pending payment request.
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold mt-0.5">
                  Please wait for admin review. You cannot submit another request while one is pending.
                </p>
              </div>
            </div>
          )}

          {/* Max access warning */}
          {!statusLoading && hasMaxAccess && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-green-700 dark:text-green-400 font-bold">
                You already have access to all {maxCourses} courses. No further payment is needed.
              </p>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-red-700 dark:text-red-400 font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || selectionCount === 0 || statusLoading || hasPending || hasMaxAccess}
            className="w-full py-4 bg-mango text-white font-black uppercase tracking-widest text-xs md:text-sm rounded-xl hover:bg-mango/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-mango/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Payment Request
              </>
            )}
          </button>

          <p className="text-center text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
            By submitting you agree to our{' '}
            <Link to="/terms" className="text-mango hover:underline">Terms of Service</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
