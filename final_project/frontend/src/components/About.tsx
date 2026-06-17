import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, ShieldCheck, GraduationCap, Compass, Heart, Users, Sparkles, Layout, BookOpen, PlayCircle, Check, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const universities = [
  { name: "Addis Ababa University", logo: "https://picsum.photos/seed/aau/120/120" },
  { name: "Jimma University", logo: "https://picsum.photos/seed/jimma/120/120" },
  { name: "Bahir Dar University", logo: "https://picsum.photos/seed/bahir/120/120" },
  { name: "Haramaya University", logo: "https://picsum.photos/seed/haramaya/120/120" },
  { name: "Hawassa University", logo: "https://picsum.photos/seed/hawassa/120/120" },
  { name: "Gondar University", logo: "https://picsum.photos/seed/gondar/120/120" },
  { name: "Mekelle University", logo: "https://picsum.photos/seed/mekelle/120/120" },
  { name: "Arba Minch University", logo: "https://picsum.photos/seed/amu/120/120" },
  { name: "Adama Science & Tech", logo: "https://picsum.photos/seed/astu/120/120" },
  { name: "Wachemo University", logo: "https://picsum.photos/seed/wcu/120/120" },
  { name: "Wolaita Sodo University", logo: "https://picsum.photos/seed/wsu/120/120" },
];

const faqVideos = [
  { id: "dQw4w9WgXcQ", title: "How to master exams?" },
  { id: "jfKfPfyJRdk", title: "Tilla Platform Guide" },
  { id: "fRh_vgS2dFE", title: "Freshman Study Strategy" }
];

export default function About() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [purchaseStep, setPurchaseStep] = useState(0);
  const [purchaseData, setPurchaseData] = useState({
    program: '',
    semester: '',
    courses: [] as string[]
  });
  
  const [showGrade12Tooltip, setShowGrade12Tooltip] = useState(false);

  const handleGrade12Click = () => {
    setShowGrade12Tooltip(true);
    setTimeout(() => {
      setShowGrade12Tooltip(false);
    }, 2000); // Hide after 2 seconds
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/packages');
    }
  };

  const nextStep = () => setPurchaseStep(prev => prev + 1);
  const prevStep = () => setPurchaseStep(prev => Math.max(0, prev - 1));

  return (
    <section className="py-12 md:py-24 bg-white dark:bg-slate-950 transition-colors" id="about">
      <div className="w-full px-5 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Hero Section of About */}
        <div className="max-w-4xl mb-12 md:mb-20 px-0">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl lg:text-6xl font-sans font-bold mb-4 md:mb-8 text-slate-900 dark:text-white leading-tight tracking-tight"
          >
            {t('about.title.part1')} <span className="text-mango font-serif italic lowercase">{t('about.title.highlight')}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
          >
            {t('about.description')}
          </motion.p>
        </div>

        {/* Bento Grid Layout - Focus Card (Goal Card removed) */}
        <div className="grid grid-cols-1 gap-6 mb-16 md:mb-20 px-0">
          {/* Main Focus Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 md:p-10 rounded-2xl md:rounded-[40px] bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 md:gap-10 items-center shadow-sm"
          >
            <div className="flex-1 order-2 md:order-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-mango/10 rounded-xl md:rounded-2xl flex items-center justify-center text-mango mb-5 md:mb-6">
                <Target className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-2xl font-sans font-bold mb-3 md:mb-4 text-slate-900 dark:text-white tracking-tight">{t('about.focus.title')}</h3>
              <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                {t('about.focus.desc')}
              </p>
              <div className="flex flex-wrap gap-2.5 md:gap-3">
                {/* Grade 12 Prep Button */}
                <div className="group relative">
                  <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap pointer-events-none transition-all duration-300 z-10 shadow-lg ${showGrade12Tooltip ? 'opacity-100 visible -translate-y-1' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-1'}`}>
                    Coming soon
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
                  </div>
                  <button 
                    onClick={handleGrade12Click}
                    className="px-4 py-2.5 md:px-6 md:py-3 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[9px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white text-center cursor-not-allowed shadow-sm"
                  >
                    {t('about.focus.tag1')}
                  </button>
                </div>

                {/* Freshman Success Button */}
                <button 
                  onClick={() => navigate('/services/freshman-portal')}
                  className="px-4 py-2.5 md:px-6 md:py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 text-[9px] md:text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white transition-colors flex items-center gap-2 shadow-sm"
                >
                  {t('about.focus.tag2')}
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2 relative aspect-video rounded-xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 w-full">
              <img src="https://picsum.photos/seed/focus/800/600" alt="Focus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>

        {/* Grade 12 Entrance Exam Preparation Section */}
        <div className="mb-16 md:mb-24 -mx-5 md:-mx-16 lg:-mx-24 px-5 md:px-16 lg:px-24 py-16 md:py-24 bg-blue-50/50 dark:bg-blue-900/10 transition-colors">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-bold text-slate-900 dark:text-white mb-6 md:mb-8 leading-tight tracking-tight">
                Grade 12 Entrance <br className="hidden sm:block" /> <span className="text-mango font-serif italic lowercase underline decoration-blue-500/30">Preparation</span>
              </h2>
              <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                {t('about.entrance.desc')}
              </p>
            </motion.div>

            {/* Beautiful Image Layout */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="aspect-[4/5] rounded-xl md:rounded-3xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden border border-blue-100 dark:border-blue-900 shadow-xl"
              >
                <img src="https://picsum.photos/seed/exam1/600/800" alt="Exam Mockup" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <div className="flex flex-col gap-3 md:gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="aspect-square rounded-xl md:rounded-3xl bg-blue-50 dark:bg-blue-900/20 overflow-hidden border border-blue-100 dark:border-blue-900 shadow-lg"
                >
                  <img src="https://picsum.photos/seed/exam2/600/600" alt="Interface" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="aspect-square rounded-xl md:rounded-[32px] bg-blue-600 p-4 md:p-8 flex flex-col justify-end text-white shadow-xl">
                  <Sparkles className="w-5 h-5 md:w-8 md:h-8 mb-2 md:mb-4" />
                  <div className="font-bold uppercase tracking-widest text-[8px] md:text-lg text-center leading-tight">2026 Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Freshman Success Portal Section */}
        <div className="mb-16 md:mb-32 -mx-5 md:-mx-16 lg:-mx-24 px-5 md:px-16 lg:px-24 py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center mb-12 md:mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-last lg:order-first"
              >
                <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-bold text-slate-900 dark:text-white mb-6 md:mb-8 leading-tight tracking-tight">
                  {t('about.freshman.title').split(' ').map((word, i) => i === 0 ? <span key={i} className="text-mango font-serif italic lowercase">{word} </span> : word + ' ')}
                </h2>
                <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                  {t('about.freshman.desc')}
                </p>
              </motion.div>
            
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-800 w-full"
              >
                <img src="https://picsum.photos/seed/freshman/1200/800" alt="University Campus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4 md:p-8">
                  <div className="text-white font-bold uppercase tracking-widest text-xs md:text-xl">Top Universities</div>
                </div>
              </motion.div>
            </div>

            {/* University Logo Ticker */}
            <div className="relative py-8 md:py-12 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors overflow-hidden rounded-2xl md:rounded-[40px]">
              <motion.div 
                className="flex gap-10 md:gap-16 items-center whitespace-nowrap"
                animate={{ x: [0, -1800] }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              >
                {[...universities, ...universities].map((uni, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 md:gap-4 shrink-0 transition-grayscale hover:grayscale-0 grayscale opacity-60 hover:opacity-100 duration-300">
                    <div className="w-12 h-12 md:w-24 md:h-24 rounded-lg md:rounded-2xl bg-white dark:bg-slate-800 p-2 md:p-3 shadow-lg border border-slate-100 dark:border-slate-700 font-bold">
                      <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{uni.name.split(' ')[0]}</span>
                  </div>
                ))}
              </motion.div>
              
              <div className="absolute top-0 left-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10" />
              <div className="absolute top-0 right-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10" />
            </div>
          </div>
        </div>

        {/* YouTube Videos Section */}
        <div className="mb-16 md:mb-32">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-bold text-slate-900 dark:text-white mb-8 md:mb-12 text-center leading-tight tracking-tight">
              Education <span className="text-red-600 font-serif italic lowercase">Insights</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {faqVideos.map((video, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="aspect-video rounded-xl md:rounded-3xl overflow-hidden bg-slate-900 border-2 md:border-4 border-slate-100 dark:border-slate-800 hover:border-red-600/50 shadow-xl transition-all relative">
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h4 className="mt-3 md:mt-4 font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors uppercase text-[8px] md:text-xs tracking-widest text-center italic">
                    {video.title}
                  </h4>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Message & Redesigned Dynamic CTA Section */}
        <div className="relative py-8 md:py-32 px-6 md:px-12 rounded-3xl md:rounded-[80px] bg-white dark:bg-slate-900 overflow-hidden border-2 md:border-4 border-mango shadow-2xl shadow-mango/10">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-mango/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1 text-center md:text-left">
              <AnimatePresence mode="wait">
                {purchaseStep === 0 && (
                  <motion.div
                    key="cta-content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <h2 className="text-xl md:text-5xl lg:text-6xl font-sans font-bold text-slate-950 dark:text-white leading-tight mb-4 md:mb-8 tracking-tight">
                      Start Your <br />
                      <span className="text-mango font-serif italic lowercase">Journey</span> Today
                    </h2>
                    <p className="text-[10px] md:text-xl text-slate-600 dark:text-slate-400 font-medium mb-8 md:mb-12 max-w-lg mx-auto md:mx-0">
                      Join the community of students who are already mastering their curriculum with Tilla's elite resources.
                    </p>
                    <button 
                      onClick={handleGetStarted}
                      className="group relative flex items-center justify-center md:justify-start gap-4 md:gap-6 px-6 py-4 md:px-12 md:py-7 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black rounded-xl md:rounded-3xl shadow-2xl hover:bg-mango dark:hover:bg-mango dark:hover:text-white transition-all group overflow-hidden w-full md:w-auto"
                    >
                      <span className="relative z-10 text-[10px] md:text-xl tracking-widest uppercase">GET STARTED</span>
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6 relative z-10 group-hover:translate-x-3 transition-transform duration-500" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 hidden md:block">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-mango/20 blur-3xl rounded-full" />
                <img 
                  src="https://picsum.photos/seed/cta/800/800" 
                  alt="Ready" 
                  className="relative z-10 w-full aspect-square object-cover rounded-[60px] shadow-2xl skew-y-3"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
