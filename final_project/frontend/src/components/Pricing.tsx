/**
 * Pricing.tsx — Freshman Portal pricing section.
 *
 * New model: one plan, 100 ETB flat, any 7 courses.
 * The entrance prep tiers are unchanged (they are a separate product).
 *
 * Removed:
 *   - freshmanTiers (Essential / Premium at 100 / 180 ETB)
 *   - freshmanFlow state machine (semester → course selection modal)
 *   - setPurchaseType / purchaseType
 *   - RedemptionCode section
 *   - PaymentDetailsModal for freshman (flow now goes to /explore-courses)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, Star, Shield, BookOpen,
  ArrowRight, ExternalLink, X, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface PricingProps {
  hideHeader?: boolean;
}

export default function Pricing({ hideHeader = false }: PricingProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();

  type Portal = 'freshman' | 'entrance';
  const [activePortal, setActivePortal] = useState<Portal>('freshman');
  const [showAuthModal, setShowAuthModal]     = useState(false);
  const [showEntranceInfo, setShowEntranceInfo] = useState<string | null>(null);

  // ── Entrance prep tiers (unchanged product) ────────────────────────────
  const entranceTiers = [
    {
      id: 'standard',
      name: 'Standard Account',
      price: '399',
      period: 'Full Access',
      icon: Shield,
      description: 'Complete preparation package for the national entrance exam.',
      features: [
        'All Exam Questions',
        'Detailed Answer Keys',
        'Subject Summaries',
        'Progress Tracking',
        'Chapter-wise Quizzes',
        'Explanatory Audio Notes',
      ],
      buttonText: 'Join Now',
      highlight: false,
    },
    {
      id: 'premium',
      name: 'Premium Account',
      price: '599',
      period: 'Full Access + Support',
      icon: Star,
      description: 'The ultimate package with personalized support and extra resources.',
      features: [
        'Everything in Standard',
        'Unlimited Mock Exams',
        'AI Performance Analysis',
        'Priority Support',
        'PDF Downloads',
        'Direct Mentor Access',
        'Weekly Live Q&A',
      ],
      buttonText: 'Go Premium',
      highlight: true,
    },
  ];

  const handleFreshmanCTA = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/explore-courses');
  };

  const handleEntranceCTA = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/signup');
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">

        {/* ── Section header ────────────────────────────────────────── */}
        {!hideHeader && (
          <div className="text-center mb-14">
            <span className="inline-block mb-4 px-4 py-1.5 bg-mango/10 text-mango rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-mango/20">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-5">
              Simple, Honest Pricing
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              No hidden fees. No confusing tiers. Pay once, choose your courses.
            </p>
          </div>
        )}

        {/* ── Portal toggle ─────────────────────────────────────────── */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 gap-1 border border-slate-200 dark:border-slate-800">
            {(['freshman', 'entrance'] as const).map(p => (
              <button
                key={p}
                onClick={() => setActivePortal(p)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activePortal === p
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p === 'freshman' ? 'Freshman Portal' : 'Entrance Prep'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Freshman Portal — single flat plan ────────────────── */}
          {activePortal === 'freshman' && (
            <motion.div
              key="freshman"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-mango rounded-3xl p-8 md:p-10 shadow-xl shadow-mango/10 relative overflow-hidden">

                {/* Top badge */}
                <div className="absolute top-0 right-0 bg-mango text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl">
                  Freshman Portal
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  {/* Left column */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-mango/10 border border-mango/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-mango" />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                          Course Access
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Choose any 7 freshman courses</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {[
                        'Any 7 courses from our full catalogue',
                        'Video lessons by senior students',
                        'Chapter-by-chapter practice questions',
                        'Step-by-step written answers',
                        'Progress tracking dashboard',
                        'Access until course is complete',
                      ].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-mango flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleFreshmanCTA}
                      className="inline-flex items-center gap-2 px-7 py-4 bg-mango text-white font-black rounded-2xl hover:bg-mango/90 transition-all shadow-lg shadow-mango/25 text-sm uppercase tracking-widest"
                    >
                      Select Your Courses
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price column */}
                  <div className="md:text-right flex-shrink-0">
                    <div className="inline-block bg-mango/5 border border-mango/20 rounded-2xl px-8 py-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Flat Rate
                      </p>
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-5xl font-display font-black text-mango leading-none">100</span>
                        <span className="text-lg font-bold text-mango mb-1">ETB</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">any 7 courses · one-time</p>
                    </div>
                  </div>
                </div>

                {/* Telegram note */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 text-sm text-slate-500">
                  <AlertCircle className="w-4 h-4 text-mango flex-shrink-0 mt-0.5" />
                  <p>
                    Payment is verified manually via Telegram.
                    After submitting your request, send your receipt to{' '}
                    <a
                      href="https://t.me/Tilla_Register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-mango hover:underline inline-flex items-center gap-1"
                    >
                      @Tilla_Register <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    on Telegram. Courses unlock within 5 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Entrance Prep — unchanged two-tier layout ──────────── */}
          {activePortal === 'entrance' && (
            <motion.div
              key="entrance"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              {entranceTiers.map(tier => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.id}
                    className={`relative bg-white dark:bg-slate-900 rounded-3xl p-7 border-2 ${
                      tier.highlight
                        ? 'border-mango shadow-xl shadow-mango/10'
                        : 'border-slate-200 dark:border-slate-700 shadow-md'
                    }`}
                  >
                    {tier.highlight && (
                      <div className="absolute top-0 right-0 bg-mango text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl rounded-tr-3xl">
                        Popular
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.highlight ? 'bg-mango/10 border-mango/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} border`}>
                        <Icon className={`w-5 h-5 ${tier.highlight ? 'text-mango' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                        <p className="text-[10px] text-slate-500">{tier.period}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <span className="text-4xl font-display font-black text-slate-900 dark:text-white">{tier.price}</span>
                      <span className="text-slate-400 text-sm ml-1">ETB</span>
                    </div>

                    <ul className="space-y-2.5 mb-7">
                      {tier.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                          <Check className={`w-3.5 h-3.5 flex-shrink-0 ${tier.highlight ? 'text-mango' : 'text-green-500'}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleEntranceCTA}
                      className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        tier.highlight
                          ? 'bg-mango text-white hover:bg-mango/90 shadow-md shadow-mango/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tier.buttonText}
                    </button>

                    <button
                      onClick={() => setShowEntranceInfo(showEntranceInfo === tier.id ? null : tier.id)}
                      className="w-full mt-2 py-2 text-[10px] font-bold text-slate-400 hover:text-mango transition-colors"
                    >
                      {showEntranceInfo === tier.id ? 'Hide details' : 'See full details'}
                    </button>

                    <AnimatePresence>
                      {showEntranceInfo === tier.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-slate-500 leading-relaxed mt-2 overflow-hidden"
                        >
                          {tier.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Auth modal — shown when unauthenticated user clicks CTA */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  );
}
