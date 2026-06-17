/**
 * ForgotPasswordPage.tsx — MVP Option 3
 *
 * No email infrastructure. No SMTP. No OTP. No reset tokens.
 * Password resets are handled manually by admin via Django Admin.
 * Users are directed to contact support on Telegram.
 *
 * Route: /forgot-password  (registered in App.tsx)
 * Linked from: Login.tsx "Forgot password?" link
 *
 * Before launch: update TELEGRAM_SUPPORT to your real support handle.
 */
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MessageCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ---------------------------------------------------------------------------
// Update to your actual Telegram support username before launch
// ---------------------------------------------------------------------------
const TELEGRAM_SUPPORT = "https://t.me/Tilla_Support";
const TELEGRAM_HANDLE  = "@Tilla_Support";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-5 sm:px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-[#0088cc]/10 rounded-xl md:rounded-2xl text-[#0088cc] mb-5 md:mb-7">
              <MessageCircle className="w-7 h-7 md:w-10 md:h-10" />
            </div>

            {/* Heading */}
            <h1 className="text-xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
              Reset Your Password
            </h1>

            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 md:mb-10">
              Password resets are handled by our support team.
              Message us on Telegram with your registered email address and
              we'll reset your account — usually within a few hours.
            </p>

            {/* Primary CTA */}
            <a
              href={TELEGRAM_SUPPORT}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#0088cc] text-white text-xs md:text-sm font-black uppercase tracking-widest py-3 md:py-4 rounded-xl md:rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              Contact Support on Telegram
            </a>

            <p className="mt-3 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wide">
              {TELEGRAM_HANDLE}
            </p>

            {/* What to include */}
            <div className="mt-6 md:mt-8 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-3">
                <ShieldCheck className="w-4 h-4 text-mango shrink-0" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                  Include in your message
                </span>
              </div>
              {[
                "Your registered email address",
                "Your full name on the account",
                "A brief description of the issue",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-mango text-xs mt-0.5 shrink-0">•</span>
                  <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Back to login */}
            <div className="mt-7 md:mt-9 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[11px] md:text-xs text-slate-400 dark:text-slate-500 hover:text-mango dark:hover:text-mango transition-colors font-bold uppercase tracking-widest"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
