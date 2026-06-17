import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Youtube, Send, Zap, ZapOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-950 pt-12 md:pt-20 pb-8 md:pb-10 transition-colors relative">
      <div className="w-full px-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-mango rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">Tilla</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6 md:mb-8 text-sm md:text-base leading-relaxed font-bold">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-mango hover:text-white transition-all shadow-sm" title="Facebook">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-mango hover:text-white transition-all shadow-sm" title="TikTok">
                <TikTokIcon className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="https://t.me/Tilla_Register" target="_blank" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-mango hover:text-white transition-all shadow-sm" title="Telegram">
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-mango hover:text-white transition-all shadow-sm" title="YouTube">
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            <h4 className="font-bold mb-4 md:mb-6 text-slate-900 dark:text-white uppercase text-[10px] md:text-xs tracking-widest">{t('footer.platform')}</h4>
            <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold">
              <li><Link to="/courses" className="hover:text-mango transition-colors">{t('footer.platform') === 'Platform' ? 'Courses' : t('footer.platform') === 'መድረክ' ? 'ኮርሶች' : 'Koorsiiwwan'}</Link></li>
              <li><Link to="/predictor" className="hover:text-mango transition-colors">{t('footer.platform') === 'Platform' ? 'Predictor' : t('footer.platform') === 'መድረክ' ? 'ፕሪዲክተር' : 'Madaaltuu'}</Link></li>
              <li><Link to="/about" className="hover:text-mango transition-colors">{t('footer.platform') === 'Platform' ? 'Our Story' : t('footer.platform') === 'መድረክ' ? 'ስለ እኛ' : 'Waa\'ee Keenya'}</Link></li>
            </ul>
          </div>

          <div className="mt-4 sm:mt-0">
            <h4 className="font-bold mb-4 md:mb-6 text-slate-900 dark:text-white uppercase text-[10px] md:text-xs tracking-widest">{t('footer.legal')}</h4>
            <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold">
              <li><Link to="/privacy" className="hover:text-mango transition-colors">{t('footer.legal') === 'Legal' ? 'Privacy Policy' : t('footer.legal') === 'ሕጋዊ' ? 'የግላዊነት ፖሊሲ' : 'Iccitii'}</Link></li>
              <li><Link to="/terms" className="hover:text-mango transition-colors">{t('footer.legal') === 'Legal' ? 'Terms of Use' : t('footer.legal') === 'ሕጋዊ' ? 'የአጠቃቀም ውሎች' : 'Waliigaltee'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-8 md:pt-10 border-t border-slate-200 dark:border-white/10">
          <p className="text-[10px] md:text-xs text-slate-500 text-center font-bold">
            © 2026 Tilla EdTech. Ethiopia's Leading Digital Learning Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
