import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Shield, Star, CreditCard } from 'lucide-react';

export default function Services() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; program: string }>({
    isOpen: false,
    program: 'entrance-prep'
  });

  const [unauthModalOpen, setUnauthModalOpen] = useState(false);
  const [subChoiceModal, setSubChoiceModal] = useState<{isOpen: boolean, targetProgramId: string, targetProgramTitle: string}>({
    isOpen: false, targetProgramId: '', targetProgramTitle: ''
  });

  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const cards = [
    {
      id: "entrance-prep",
      title: t('services.entrance.title'),
      image: "/images/Home-page-images/Home-page_services-section_entranceprep-card.png",
      description: t('services.entrance.desc'),
      color: "bg-blue-600",
      link: "/services/entrance-prep",
      standardPrice: "399",
      premiumPrice: "599"
    },
    {
      id: "freshman-portal",
      title: t('services.freshman.title'),
      image: "/images/Home-page-images/Home-page_services-section_freshman-card.png",
      description: t('services.freshman.desc'),
      color: "bg-mango",
      link: "/services/freshman-portal",
      standardPrice: "499",
      premiumPrice: "749"
    }
  ];

  const handleRegisterClick = (card: typeof cards[0]) => {
    if (user) {
      setSelectedTier(null);
      setSubChoiceModal({
        isOpen: true,
        targetProgramId: card.id,
        targetProgramTitle: card.title
      });
    } else {
      setUnauthModalOpen(true);
    }
  };

  const handleSubChoiceNext = () => {
    if (!selectedTier) return;
    const card = cards.find(c => c.id === subChoiceModal.targetProgramId);
    if (!card) return;
    
    let price = "0";
    let name = "";
    if (selectedTier === "standard") {
      name = "Standard Account";
      price = card.standardPrice;
    } else {
      name = "Premium Account";
      price = card.premiumPrice;
    }

    setSubChoiceModal(prev => ({ ...prev, isOpen: false }));
    // Navigate to course selection for freshman, packages for entrance
    if (subChoiceModal.targetProgramTitle?.toLowerCase().includes('freshman')) {
      navigate('/explore-courses');
    } else {
      navigate('/packages');
    }
  };

  return (
    <section id="services" className="py-12 md:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-black text-slate-900 dark:text-white mb-3 md:mb-4 leading-tight uppercase tracking-tight">
            {t('services.title').split(' ').map((word, i) => i === 1 ? <span key={i} className="text-mango font-serif italic lowercase">{word} </span> : word + ' ')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-[10px] md:text-lg font-medium">
            {t('services.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              className="group relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] overflow-hidden h-full transition-all shadow-md hover:shadow-xl hover:border-mango/50 flex flex-col"
            >
              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent opacity-60`} />
              </div>

              <div className="p-6 md:p-8 lg:p-10 pt-5 md:pt-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-2xl lg:text-3xl font-display font-black mb-3 md:mb-4 text-slate-900 dark:text-white italic uppercase tracking-tight">{card.title}</h3>
                <p className="text-[10px] md:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 md:mb-8 font-medium">
                  {card.description}
                </p>

                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-5 md:pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
                  {card.id === 'entrance-prep' ? (
                    <button 
                      onClick={() => setShowComingSoon(true)}
                      className="col-span-2 flex items-center justify-center py-3.5 md:py-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-widest cursor-default hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Coming soon
                    </button>
                  ) : (
                    <>
                      <Link 
                        to={card.link}
                        className="flex items-center justify-center py-3 md:py-4 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] md:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        {t('services.more')}
                      </Link>
                      <button 
                        onClick={() => handleRegisterClick(card)}
                        className="flex items-center justify-center py-3 md:py-4 rounded-xl bg-mango text-white text-[9px] md:text-sm font-black uppercase tracking-widest hover:bg-mango/90 transition-colors shadow-lg shadow-mango/15"
                      >
                        {t('services.register')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Left side line hover effect - starts from bottom and goes to top */}
              <div className="absolute bottom-0 left-0 w-1 bg-mango h-0 group-hover:h-full transition-all duration-500 ease-in-out" />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowComingSoon(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-mango/10 rounded-full flex items-center justify-center mx-auto text-mango">
                  <span className="text-4xl">🏗️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4 italic">Get Ready, Grade 12 Students!</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                    We are currently developing a new section for Grade 12 students. This page will include everything you need to pass the 2019 E.C. National Exam. We will launch soon!
                  </p>
                </div>
                <button 
                  onClick={() => setShowComingSoon(false)}
                  className="w-full py-4 rounded-2xl bg-mango text-white font-bold hover:bg-mango/90 transition-colors shadow-lg shadow-mango/20"
                >
                  Got it!
                </button>
              </div>
              <button 
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}

        {unauthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setUnauthModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-mango/10 rounded-full flex items-center justify-center mx-auto text-mango">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Account Required</h3>
                  <p className="text-slate-600 dark:text-slate-400">Please sign in or sign up for free to register for this service.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link 
                    to="/login"
                    className="flex items-center justify-center py-3.5 rounded-xl border-2 border-mango text-mango font-bold hover:bg-mango/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className="flex items-center justify-center py-3.5 rounded-xl bg-mango text-white font-bold hover:bg-mango/90 transition-colors shadow-lg shadow-mango/20"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
              <button 
                onClick={() => setUnauthModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}

        {subChoiceModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSubChoiceModal(prev => ({...prev, isOpen: false}))}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Choose Subscription</h3>
                  <p className="text-slate-600 dark:text-slate-400">Select an account type for {subChoiceModal.targetProgramTitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  {/* Standard Option */}
                  <button 
                    onClick={() => setSelectedTier('standard')}
                    className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col h-full ${
                      selectedTier === 'standard' 
                        ? 'border-mango bg-mango/5 shadow-md shadow-mango/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-mango/50 bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl \${selectedTier === 'standard' ? 'bg-mango text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Standard Account</h4>
                        <div className="text-sm font-bold text-mango">
                          {cards.find(c => c.id === subChoiceModal.targetProgramId)?.standardPrice} ETB
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-auto">Complete access to materials, practices, and progress tracking.</p>
                  </button>

                  {/* Premium Option */}
                  <button 
                    onClick={() => setSelectedTier('premium')}
                    className={`relative text-left p-6 rounded-2xl border-2 transition-all flex flex-col h-full ${
                      selectedTier === 'premium' 
                        ? 'border-mango bg-mango/5 shadow-md shadow-mango/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-mango/50 bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="absolute -top-3 right-4 bg-mango text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Recommended
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl \${selectedTier === 'premium' ? 'bg-mango text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Premium Account</h4>
                        <div className="text-sm font-bold text-mango">
                          {cards.find(c => c.id === subChoiceModal.targetProgramId)?.premiumPrice} ETB
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-auto">Everything in Standard, plus mock exams, AI analysis, and mentorship.</p>
                  </button>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setSubChoiceModal(prev => ({...prev, isOpen: false}))}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!selectedTier}
                    onClick={handleSubChoiceNext}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-mango text-white font-bold hover:bg-mango/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-mango/20"
                  >
                    Next <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </section>
  );
}
