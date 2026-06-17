import { motion } from 'motion/react';
import { Target, Zap, ShieldCheck, BookOpen, Users, CheckCircle, Search, Lightbulb, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WhyTilla() {
  const { t } = useLanguage();
  const mainFeatures = [
    {
      title: t('why.feature.1.title'),
      desc: t('why.feature.1.desc'),
      icon: Target,
      color: "bg-mango/10 text-mango"
    },
    {
      title: t('why.feature.2.title'),
      desc: t('why.feature.2.desc'),
      icon: Zap,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: t('why.feature.3.title'),
      desc: t('why.feature.3.desc'),
      icon: ShieldCheck,
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: t('why.feature.4.title'),
      desc: t('why.feature.4.desc'),
      icon: BookOpen,
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: t('why.feature.5.title'),
      desc: t('why.feature.5.desc'),
      icon: Users,
      color: "bg-pink-500/10 text-pink-500"
    },
    {
      title: t('why.feature.6.title'),
      desc: t('why.feature.6.desc'),
      icon: CheckCircle,
      color: "bg-teal-500/10 text-teal-500"
    },
    {
      title: t('why.feature.7.title'),
      desc: t('why.feature.7.desc'),
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-500"
    }
  ];

  return (
    <section className="py-12 md:py-24 lg:py-32 bg-slate-100 dark:bg-slate-900 transition-colors relative overflow-hidden" id="why-tilla">
      <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start mb-12 md:mb-24">
          <div className="relative">
            <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 overflow-hidden">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-black text-slate-900 dark:text-white shrink-0 uppercase tracking-tight">
                {t('why.title').split(' ').map((word, i) => i === 0 ? <span key={i} className="text-mango font-serif italic lowercase">{word} </span> : word + ' ')}
              </h2>
              <div className="h-1 md:h-1.5 flex-grow bg-mango rounded-full relative">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-slate-100 dark:to-slate-900 translate-x-1" />
              </div>
            </div>
            
            <h3 className="text-base md:text-2xl font-sans font-black text-slate-700 dark:text-slate-300 mb-4 md:mb-8 uppercase tracking-tight">
              {t('why.optimized')}
            </h3>
            
            <p className="text-xs md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
              {t('why.strategy')}
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative mt-2 md:mt-0"
          >
            <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl md:rounded-[32px] lg:rounded-[48px] overflow-hidden border-2 md:border-4 border-slate-50 dark:border-slate-800 shadow-xl group">
              <img 
                src="/images/Home-page-images/Home-page_why-section-image-1.png" 
                alt="Why Tilla Strategy" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-mango/20 rounded-full blur-3xl -z-10 animate-pulse" />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {mainFeatures.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`p-6 md:p-8 lg:p-10 rounded-xl md:rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-mango/50 transition-all flex flex-col items-start relative overflow-hidden ${i === 6 ? 'md:col-span-2 lg:col-span-3 lg:flex-row lg:items-center gap-6 lg:gap-12 lg:py-12' : ''}`}
            >
              {/* Static Decorative Background Element */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-16 -mt-16 rounded-full ${f.color.split(' ')[0]}`} />
              
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className={`w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 ${f.color.split(' ')[1]}`}>
                    <f.icon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <h3 className="text-base md:text-xl lg:text-2xl font-display font-black text-slate-900 dark:text-white italic uppercase tracking-tight">
                    {f.title}
                  </h3>
                </div>
                <div className="relative z-10 font-sans">
                  <p className="text-[10px] md:text-base lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
