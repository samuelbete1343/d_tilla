import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Play, TrendingUp, Users, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const images = [
    '/images/Home-page-images/Home-page_hero-section_image-1.png',
    '/images/Home-page-images/Home-page_hero-section_image-2.png'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Slightly longer for background feel

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative flex items-center pt-28 pb-20 md:pt-32 md:pb-52 overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24 relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            {/* Badge */}
            <div className="flex justify-start mb-4 lg:mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-mango/10 border border-mango/20 text-[9px] lg:text-sm font-black text-mango uppercase tracking-widest"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-mango animate-ping" />
                {t('hero.badge')}
              </motion.div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-4xl lg:text-5xl font-sans font-black tracking-tight mb-4 lg:mb-8 leading-tight text-slate-900 dark:text-white uppercase"
            >
              {t('hero.title.top')} <br />
              {t('hero.title.bottom')} <span className="text-mango font-serif italic lowercase">{t('hero.title.highlight')}.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs md:text-lg text-slate-600 dark:text-slate-400 mb-8 lg:mb-12 leading-relaxed max-w-lg font-medium"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
            >
              <Link to="/explore-courses" className="w-full sm:w-auto bg-slate-100 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white px-5 py-3.5 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-lg flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:scale-105 active:scale-95 group uppercase tracking-widest">
                <Compass className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                {t('courses.explore.title')}
              </Link>

              <Link to="/services/freshman-portal" className="w-full sm:w-auto bg-mango text-white px-5 py-3.5 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-mango/15 hover:shadow-mango/30 hover:bg-mango/90 hover:scale-105 active:scale-95 group uppercase tracking-widest">
                <Play className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current" />
                {t('hero.cta.freshman')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Carousel on Desktop */}
          <div className="hidden lg:block relative h-[300px] self-end">
            <div className="absolute -inset-10 bg-mango/10 blur-[100px] rounded-full" />
            <div className="relative h-full w-full p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[42px] border border-slate-200 dark:border-slate-800 shadow-[20px_-20px_60px_-15px_rgba(0,0,0,0.15),0_32px_64px_-16px_rgba(0,0,0,0.1)] group hover:shadow-[30px_-30px_80px_-15px_rgba(197,160,89,0.2),0_32px_64px_-16px_rgba(197,160,89,0.2)] transition-all duration-700">
              <div className="relative h-full w-full rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
                <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20, scale: 1.1 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1,
                    transition: { duration: 1 }
                  }}
                  exit={{ opacity: 0, x: -20, scale: 1, transition: { duration: 0.5 } }}
                  className="absolute inset-0"
                >
                  <img 
                    src={images[currentImageIndex]} 
                    alt="Education Spotlight" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-slate-950/60 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]"
        >
          <path 
            d="M0,60 C150,110 450,10 600,60 C750,110 1050,10 1200,60 V120 H0 Z" 
            className="fill-white dark:fill-slate-950"
          />
          <path 
            d="M0,60 C150,110 450,10 600,60 C750,110 1050,10 1200,60" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8"
            className="text-mango"
          />
        </svg>
      </div>
    </section>
  );
}
