import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const universities = [
  "Addis Ababa University",
  "Jimma University",
  "Bahir Dar University",
  "Haramaya University",
  "Hawassa University",
  "Gondar University",
  "Mekelle University",
  "Arba Minch University"
];

export default function UniversityTicker() {
  const { t } = useLanguage();
  return (
    <div className="py-8 md:py-12 bg-white dark:bg-slate-950 overflow-hidden relative transition-colors">
      <div className="w-full px-6 mb-6 md:mb-8 text-center">
        <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
          {t('universities.trusted')}
        </p>
      </div>
      
      <div className="relative flex">
        <motion.div 
          className="flex whitespace-nowrap gap-8 md:gap-12 items-center"
          animate={{ x: [0, -1000] }} // Approximated value, will still work fine with repeat
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...universities, ...universities].map((uni, i) => (
            <div key={i} className="flex items-center gap-2.5 md:gap-3 group">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-mango opacity-20 group-hover:opacity-100 transition-opacity" />
              <span className="text-lg md:text-2xl font-display font-black text-slate-400 dark:text-slate-600 group-hover:text-mango transition-colors cursor-default tracking-tight">
                {uni}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fades */}
      <div className="absolute top-0 left-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
