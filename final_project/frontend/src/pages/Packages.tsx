/**
 * Packages.tsx — /packages route (the public-facing "How to Pay" page).
 *
 * Updated for the new model:
 *  - "Choose your package" → "Select your 7 courses"
 *  - Screenshot requirement removed from Step 2 (Telegram receipt only)
 *  - Step 3 activation time updated to "within 5 hours"
 *  - "The package you want to unlock" → courses are chosen on the platform
 *  - Step 1 CTA navigates to /explore-courses, not a plan modal
 */
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pricing from '../components/Pricing';
import { CreditCard, CheckCircle2, ShieldCheck, Banknote, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Packages() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-24">
      <Header />

      <div className="flex-grow">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto px-5 pt-4 md:pt-12 pb-2 md:pb-6">
          <h1 className="text-2xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3 md:mb-6 tracking-tight">
            Our{' '}
            <span className="text-mango underline underline-offset-4 decoration-mango/30 italic lowercase font-serif">
              Packages
            </span>
          </h1>
          <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
            One flat price. Any 7 courses. Choose what you need and unlock your potential.
          </p>
        </div>

        {/* Pricing Component */}
        <div className="mt-0 md:mt-4 mb-12 md:mb-24">
          <Pricing hideHeader={true} />
        </div>

        {/* How to Pay & Unlock Courses */}
        <section className="py-12 md:py-24 px-5 md:px-6 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20">
              <h2 className="text-xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-tight tracking-tight">
                How to Pay &{' '}
                <span className="text-mango underline underline-offset-4 decoration-mango/30 italic lowercase font-serif">
                  Unlock
                </span>
              </h2>
              <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 font-medium">
                Three simple steps to get your courses activated.
              </p>
            </div>

            <div className="space-y-10 md:space-y-16 lg:space-y-24 relative before:absolute before:inset-0 before:ml-4 md:before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 md:before:w-1 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">

              {/* ── Step 1: Select & Transfer ── */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-mango text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="font-black text-xs md:text-sm">1</span>
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 hover:border-mango transition-colors">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 text-mango">
                    <div className="p-2 md:p-3 bg-mango/10 rounded-xl md:rounded-2xl">
                      <Banknote className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                      Select & Transfer
                    </h3>
                  </div>
                  <p className="text-[10px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                    Select any 7 courses on the platform, then transfer <strong className="text-slate-900 dark:text-white">100 ETB</strong> to one of our accounts below. Keep your receipt.
                  </p>

                  {/* Account details */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <p className="text-[9px] md:text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-widest text-center md:text-left">
                      Official Accounts
                    </p>
                    <div className="space-y-2 md:space-y-3 font-bold">
                      {/* TeleBirr */}
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 md:p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-400 capitalize tracking-tight font-bold mb-1">TeleBirr</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-white text-[10px] md:text-base">0911 23 45 67</p>
                          <p className="text-[7px] md:text-[10px] text-slate-500 font-bold mt-0.5 uppercase truncate">Tilla Education</p>
                        </div>
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-sky-500 text-white rounded-full flex items-center justify-center font-black text-[8px] md:text-xs shadow-sm uppercase shrink-0 ml-2">
                          Tele
                        </div>
                      </div>
                      {/* CBE */}
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 md:p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">CBE Account</p>
                          <p className="font-mono font-black text-slate-900 dark:text-white text-[10px] md:text-base">1000 1234 5678 9</p>
                          <p className="text-[7px] md:text-[10px] text-slate-500 font-black mt-0.5 uppercase truncate">Tilla Education PLC</p>
                        </div>
                        <div className="bg-white p-1 rounded-lg shrink-0 ml-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Commercial_Bank_of_Ethiopia_logo.svg/1200px-Commercial_Bank_of_Ethiopia_logo.svg.png"
                            alt="CBE" className="h-4 md:h-8 object-contain"
                          />
                        </div>
                      </div>
                      {/* Abyssinia */}
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 md:p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Abyssinia</p>
                          <p className="font-mono font-black text-slate-900 dark:text-white text-[10px] md:text-base">3214 5678 9012</p>
                          <p className="text-[7px] md:text-[10px] text-slate-500 font-black mt-0.5 uppercase truncate">Tilla Education PLC</p>
                        </div>
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-black text-[8px] md:text-xs leading-tight text-center p-1 shadow-sm uppercase shrink-0 ml-2">
                          BOA
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2">
                    <li className="flex items-start gap-2 text-[9px] md:text-sm text-slate-600 dark:text-slate-400 font-black uppercase tracking-tight">
                      <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 text-green-500 mt-0.5 shrink-0" />
                      Mobile banking is recommended.
                    </li>
                    <li className="flex items-start gap-2 text-[9px] md:text-sm text-slate-600 dark:text-slate-400 font-black uppercase tracking-tight">
                      <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 text-green-500 mt-0.5 shrink-0" />
                      Keep your transaction reference number.
                    </li>
                  </ul>

                  <button
                    onClick={() => navigate('/explore-courses')}
                    className="mt-6 w-full py-3 bg-mango hover:bg-mango/90 text-white text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl transition-colors shadow-md shadow-mango/20"
                  >
                    Select My Courses
                  </button>
                </div>
              </div>

              {/* ── Step 2: Submit Receipt via Telegram ── */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="font-black text-xs md:text-sm">2</span>
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 text-blue-500">
                    <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl">
                      <ShieldCheck className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
                      Send Receipt via Telegram
                    </h3>
                  </div>
                  <p className="text-[10px] md:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                    Message <strong className="text-slate-900 dark:text-white">@Tilla_Register</strong> on Telegram with your payment receipt. Our team verifies transactions and activates your courses.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-3 md:p-6 rounded-xl md:rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[9px] md:text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-center md:text-left">
                      What to Send
                    </p>
                    <ul className="space-y-2 md:space-y-3 font-black uppercase tracking-tight">
                      <li className="flex items-start gap-3 text-[9px] md:text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0 font-black text-blue-600 dark:text-blue-300 text-[8px] md:text-[10px] mt-0.5">1</div>
                        Screenshot or photo of your payment receipt.
                      </li>
                      <li className="flex items-start gap-3 text-[9px] md:text-sm text-slate-700 dark:text-slate-300">
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0 font-black text-blue-600 dark:text-blue-300 text-[8px] md:text-[10px] mt-0.5">2</div>
                        Your registered email address.
                      </li>
                    </ul>
                  </div>

                  <a
                    href="https://t.me/Tilla_Register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full py-3 md:py-4 bg-[#0088cc] hover:bg-[#0077b3] text-white text-[10px] md:text-base font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.833.94z"/>
                    </svg>
                    @Tilla_Register
                  </a>
                </div>
              </div>

              {/* ── Step 3: Unlock & Learn ── */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white dark:border-slate-950 bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="font-black text-xs md:text-sm">3</span>
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-3rem)] bg-gradient-to-br from-green-500 to-emerald-600 p-5 md:p-8 rounded-2xl md:rounded-[32px] shadow-xl shadow-green-500/20 text-white">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl backdrop-blur-sm">
                      <CheckCircle2 className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base md:text-2xl font-bold font-display tracking-tight">Unlock & Learn</h3>
                  </div>
                  <p className="text-green-50 leading-relaxed text-xs md:text-lg mb-6 font-medium">
                    ACTIVATION TIME:{' '}
                    <span className="text-white underline decoration-white/30 decoration-2">
                      WITHIN 5 HOURS
                    </span>{' '}
                    after receipt is verified. Get ready to excel!
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/20">
                    <h4 className="font-black text-[9px] md:text-sm uppercase tracking-widest mb-2">Next Steps</h4>
                    <p className="text-[8px] md:text-xs text-green-50 mb-4 font-bold uppercase">
                      Your selected courses will appear on your dashboard automatically.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-2.5 md:py-3 bg-white text-green-600 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-lg md:rounded-xl shadow-lg hover:bg-slate-50 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Need help? */}
            <div className="mt-12 md:mt-16 bg-white dark:bg-slate-900 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white tracking-tight text-sm md:text-base">Need help with payment?</h4>
                  <p className="text-[10px] md:text-sm text-slate-500 font-medium tracking-tight">
                    Our team is active on Telegram for assistance.
                  </p>
                </div>
              </div>
              <a
                href="https://t.me/Tilla_Register"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl whitespace-nowrap hover:bg-mango dark:hover:bg-mango hover:text-white transition-colors text-center"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
