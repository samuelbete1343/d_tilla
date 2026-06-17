import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseListingSection from '../components/CourseListingSection';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, GraduationCap, School, FlaskConical, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExploreCoursesUnified() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryFilter, setPrimaryFilter] = useState<'all' | 'freshman' | 'highschool'>('all');
  const [secondaryFilter, setSecondaryFilter] = useState<'all' | 'natural' | 'social'>('all');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 pb-12 md:pb-20 px-5 md:px-6">
        <div className="w-full max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-mango mb-6 md:mb-8 transition-colors font-black uppercase tracking-widest text-[10px] md:text-xs group"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-5xl font-display font-black mb-4 md:mb-6 text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
              {t('courses.explore.title')}
            </h1>
            <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 md:mb-10 font-bold max-w-2xl mx-auto">
              Explore our comprehensive catalog. We offer expertly crafted materials for both University Entrance preparation and Freshman success.
            </p>
            
            {/* Global Search Bar */}
            <div className="relative group max-w-2xl mx-auto mb-6 md:mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
              <input 
                type="text" 
                placeholder={t('courses.search.placeholder') || "Search all courses..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 py-3.5 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors shadow-sm font-black uppercase tracking-widest"
              />
            </div>

            {/* Primary Filters */}
            <div className="flex flex-wrap justify-center gap-2.5 md:gap-4 mb-4">
              <button
                onClick={() => { setPrimaryFilter('all'); setSecondaryFilter('all'); }}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all border ${
                  primaryFilter === 'all' 
                    ? 'bg-mango text-white border-mango shadow-md shadow-mango/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-mango/50'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => { setPrimaryFilter('freshman'); setSecondaryFilter('all'); }}
                className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all border ${
                  primaryFilter === 'freshman' 
                    ? 'bg-mango text-white border-mango shadow-md shadow-mango/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-mango/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Freshman
              </button>
              <button
                onClick={() => setPrimaryFilter('highschool')}
                className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest transition-all border ${
                  primaryFilter === 'highschool' 
                    ? 'bg-mango text-white border-mango shadow-md shadow-mango/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-mango/50'
                }`}
              >
                <School className="w-3.5 h-3.5 md:w-4 md:h-4" />
                High School
              </button>
            </div>

            {/* Secondary Filters for High School */}
            <AnimatePresence>
              {primaryFilter === 'highschool' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex flex-wrap justify-center gap-2 md:gap-4 overflow-hidden"
                >
                  <button
                    onClick={() => setSecondaryFilter('all')}
                    className={`px-3.5 py-1.5 md:px-5 md:py-2 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest transition-all border ${
                      secondaryFilter === 'all' 
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' 
                        : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Subjects
                  </button>
                  <button
                    onClick={() => setSecondaryFilter('natural')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 md:px-5 md:py-2 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest transition-all border ${
                      secondaryFilter === 'natural' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20' 
                        : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                    }`}
                  >
                    <FlaskConical className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    Natural
                  </button>
                  <button
                    onClick={() => setSecondaryFilter('social')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 md:px-5 md:py-2 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest transition-all border ${
                      secondaryFilter === 'social' 
                        ? 'bg-mango text-white border-mango shadow-sm shadow-mango/20' 
                        : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-mango/10 hover:text-mango'
                    }`}
                  >
                    <Globe2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    Social
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-12 md:space-y-24">
            {(primaryFilter === 'all' || primaryFilter === 'freshman') && (
              <motion.div layout>
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 overflow-hidden">
                  <h2 className="text-base md:text-3xl font-display font-black text-slate-900 dark:text-white shrink-0 uppercase tracking-tight">
                    Freshman Courses
                  </h2>
                  <div className="h-0.5 bg-slate-200 dark:bg-slate-800 flex-grow" />
                </div>
                <CourseListingSection type="freshman" hideHeader externalSearchQuery={searchQuery} hideSearch />
              </motion.div>
            )}

            {(primaryFilter === 'all' || primaryFilter === 'highschool') && (
              <motion.div layout>
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 overflow-hidden">
                  <h2 className="text-base md:text-3xl font-display font-black text-slate-900 dark:text-white shrink-0 uppercase tracking-tight">
                    High School Subjects
                  </h2>
                  <div className="h-0.5 bg-slate-200 dark:bg-slate-800 flex-grow" />
                </div>
                <CourseListingSection 
                  type="entrance" 
                  hideHeader 
                  externalSearchQuery={searchQuery} 
                  hideSearch 
                  subCategoryFilter={primaryFilter === 'highschool' ? secondaryFilter : 'all'}
                />
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
