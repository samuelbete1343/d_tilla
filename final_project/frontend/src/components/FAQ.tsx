import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Send, MessageCircle, Facebook, Phone, ChevronRight, Globe, BookOpen, CreditCard, LifeBuoy, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type FAQItem = {
  q: string;
  a: string;
};

type FAQCategories = {
  [key: string]: {
    title: string;
    icon: any;
    questions: FAQItem[];
  };
};

export default function FAQ() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('tilla');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqData: FAQCategories = {
    tilla: {
      title: "Tilla",
      icon: Globe,
      questions: [
        {
          q: "What is Tilla exactly?",
          a: "It is a special learning platform built specifically for the new Ethiopian curriculum. We help Grade 12 students pass their entrance exams and Freshmen students secure the high GPA needed for their dream departments through expert content and a modern digital experience."
        },
        {
          q: "Why is Tilla different from other platforms?",
          a: "Most platforms just provide static PDFs. Tilla offers a comprehensive 'Strategy' combining short, focused notes, senior experience, and mock digital exams that mirror the real environment, all optimized for the latest curriculum changes."
        },
        {
          q: "Can I use Tilla on my phone?",
          a: "Yes! Tilla is fully responsive and optimized for mobile devices. You can study on your phone, tablet, or laptop anytime, anywhere, as long as you have an active internet connection."
        }
      ]
    },
    courses: {
      title: "Courses",
      icon: BookOpen,
      questions: [
        {
          q: "Is the content updated for the 2026 digital exams?",
          a: "Absolutely. We are the only platform prioritizing the new digital format. Our question banks, summaries, and predictive exams are updated in real-time to match the patterns of the 2026 national assessments."
        },
        {
          q: "How can I get a high GPA with Tilla?",
          a: "We focus on efficiency. Instead of overwhelming you with 500-page textbooks, we provide 'Tilla Logic'—curated summaries and senior tips that highlight exactly what appears on exams, allowing you to master concepts in half the time."
        },
        {
          q: "Who are the 'Seniors' mentoring us?",
          a: "Seniors are high-achieving students from top universities (like AAU and ASTU) who have already mastered the Freshman curriculum. They share their past papers, exclusive notes, and 'traps' to avoid."
        },
        {
          q: "Does Tilla support Grade 12 students?",
          a: "Yes. Our Entrance Prep service is designed specifically for Grade 12. We provide digital mock tests that help you get comfortable with the interface and time constraints of the real national exam."
        }
      ]
    },
    payments: {
      title: "Payments",
      icon: CreditCard,
      questions: [
        {
          q: "How do I pay for my subscription?",
          a: "We support all major local payment methods including Telebirr, CBE Birr, and direct bank transfers. Simply follow the instructions in the payment modal and send your proof of payment via Telegram."
        },
        {
          q: "How long does activation take?",
          a: "Our team verifies transactions almost immediately. Once you submit your screenshot to @Tilla_Register on Telegram, your courses are typically activated within 1 to 5 hours."
        },
        {
          q: "Are there multi-course discounts?",
          a: "Yes! Our Premium packages for both Entrance Prep and Freshman Portal offer bundled access to multiple subjects at a significantly reduced rate compared to buying courses individually."
        }
      ]
    },
    support: {
      title: "Support",
      icon: LifeBuoy,
      questions: [
        {
          q: "How do I contact technical support?",
          a: "For the fastest response, message us on Telegram at @Tilla_Support or use our official email support@tilla.edu.et. We are active 24/7 during exam seasons."
        },
        {
          // FIX C2 — removed false claim about email reset link.
          // Original said "receive a reset link via email" which is not implemented.
          // Password resets are manual (MVP Option 3 — Telegram support).
          q: "What if I forget my password?",
          a: "Click the 'Forgot Password?' link on the login page and contact our support team on Telegram. Include your registered email address in the message and we will verify your identity and reset your account manually, usually within a few hours."
        },
        {
          q: "How do I report a content error or bug?",
          a: "We value accuracy! If you find a typo or a technical bug, take a screenshot and send it to our Telegram support channel. We reward users who help us improve the platform."
        }
      ]
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setOpenIdx(null);
  };

  return (
    <section className="py-12 md:py-24 bg-slate-100 dark:bg-slate-900 transition-colors overflow-hidden" id="faq">
      <div className="w-full px-5 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-16 items-start">
          {/* FAQ Content - Left Side (2/3) */}
          <div className="lg:col-span-2 min-w-0 w-full">
            <div className="mb-8 md:mb-12 text-left">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight">
                Common <span className="text-mango font-serif italic lowercase">Questions</span>
              </h2>
              <p className="text-xs md:text-lg text-slate-600 dark:text-slate-400 font-medium">
                Find answers to frequently asked questions and get ready for your academic journey.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 md:mb-8 w-full">
              <div className="bg-white dark:bg-slate-950 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 flex overflow-x-auto no-scrollbar gap-1 shadow-sm w-full">
                {Object.entries(faqData).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-black uppercase tracking-widest transition-all relative text-[9px] md:text-sm whitespace-nowrap shrink-0 ${
                      activeCategory === key 
                        ? 'text-white' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {activeCategory === key && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-mango rounded-lg md:rounded-xl shadow-lg shadow-mango/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{category.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 md:space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 md:space-y-4"
                >
                  {faqData[activeCategory].questions.map((faq, i) => (
                    <motion.div 
                      key={`${activeCategory}-${i}`}
                      className={`rounded-xl md:rounded-2xl border transition-all overflow-hidden ${
                        openIdx === i 
                          ? 'border-mango bg-mango/5' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <button 
                        onClick={() => setOpenIdx(openIdx === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 md:p-6 text-left group gap-3 md:gap-4"
                      >
                        <span className={`text-xs md:text-base font-bold transition-colors min-w-0 flex-1 ${openIdx === i ? 'text-mango' : 'text-slate-900 dark:text-white'}`}>
                          {faq.q}
                        </span>
                        <div className={`shrink-0 p-1 rounded-md md:rounded-lg transition-all ${openIdx === i ? 'bg-mango text-white rotate-180' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                          <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                      </button>
                      <AnimatePresence>
                        {openIdx === i && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 md:px-6 pb-4 md:pb-6 text-slate-600 dark:text-slate-400 text-[10px] md:text-sm leading-relaxed font-medium">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Support Content - Right Side (1/3) */}
          <div className="lg:col-span-1 lg:sticky lg:top-32">
            <div className="p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg md:text-2xl font-display font-black text-slate-900 dark:text-white mb-2 md:mb-4 uppercase tracking-tight">Still have questions?</h3>
              <p className="text-[10px] md:text-base text-slate-500 dark:text-slate-400 mb-6 md:mb-8 font-medium leading-relaxed">Our support team is ready to help you succeed. Choose your preferred way to connect.</p>
              
              <div className="space-y-3 md:space-y-4">
                <a 
                  href="https://t.me/Tilla_Register" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl hover:border-mango transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0088cc] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                    <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase tracking-tight">Telegram Support</div>
                    <div className="text-[9px] md:text-xs text-slate-500 font-bold">@Tilla_Register</div>
                  </div>
                </a>

                <a 
                  href="mailto:support@tilla.edu.et" 
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl hover:border-mango transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-mango/10 rounded-lg md:rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-mango" />
                  </div>
                  <div>
                    <div className="font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase tracking-tight">Official Email</div>
                    <div className="text-[9px] md:text-xs text-slate-500 font-bold">support@tilla.edu.et</div>
                  </div>
                </a>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <a 
                    href="#" 
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl hover:border-mango transition-all"
                  >
                    <Facebook className="w-5 h-5 md:w-6 md:h-6 text-blue-700 mb-2" />
                    <span className="text-[8px] md:text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Facebook</span>
                  </a>
                  <a 
                    href="#" 
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl hover:border-mango transition-all"
                  >
                    <Phone className="w-5 h-5 md:w-6 md:h-6 text-green-500 mb-2" />
                    <span className="text-[8px] md:text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
