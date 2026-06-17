import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Download, GraduationCap, Search, Library } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Modules() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'highschool' | 'freshman'>('highschool');
  const [searchQuery, setSearchQuery] = useState('');

  const highSchoolModules = [
    { title: "Mathematics Grade 12 Module 1", size: "4.2 MB", format: "PDF", downloads: 12500, date: "Aug 2025" },
    { title: "Mathematics Grade 12 Module 2", size: "4.8 MB", format: "PDF", downloads: 11200, date: "Sep 2025" },
    { title: "Physics Grade 12 Advanced Mechanics", size: "5.1 MB", format: "PDF", downloads: 9800, date: "Aug 2025" },
    { title: "Chemistry Grade 12 Organic Structures", size: "3.7 MB", format: "PDF", downloads: 8400, date: "Sep 2025" },
    { title: "Biology Grade 12 Genetics & Evolution", size: "6.2 MB", format: "PDF", downloads: 7900, date: "Oct 2025" },
    { title: "English for University Entrance", size: "2.5 MB", format: "PDF", downloads: 14000, date: "Jul 2025" },
  ];

  const freshmanModules = [
    { title: "General Psychology (Psyc 1011)", size: "3.1 MB", format: "PDF", downloads: 8200, date: "Sep 2025" },
    { title: "Communicative English (EnLa 1011)", size: "2.8 MB", format: "PDF", downloads: 7500, date: "Sep 2025" },
    { title: "Mathematics for Social Sciences", size: "4.5 MB", format: "PDF", downloads: 6100, date: "Oct 2025" },
    { title: "Mathematics for Natural Sciences", size: "4.9 MB", format: "PDF", downloads: 6800, date: "Oct 2025" },
    { title: "Logic and Critical Thinking", size: "2.2 MB", format: "PDF", downloads: 9300, date: "Sep 2025" },
    { title: "Physical Fitness", size: "1.5 MB", format: "PDF", downloads: 4100, date: "Nov 2025" },
  ];

  const currentModules = activeTab === 'highschool' ? highSchoolModules : freshmanModules;
  const filteredModules = currentModules.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 pb-12 md:pb-20 px-5 md:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-mango/10 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
              <Library className="w-6 h-6 md:w-10 md:h-10 text-mango" />
            </div>
            <h1 className="text-xl md:text-5xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6 leading-tight">
              Official Study Modules
            </h1>
            <p className="text-xs md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 md:mb-10 font-black uppercase tracking-tight">
              Download comprehensive study materials, textbooks, and official curriculum modules.
            </p>

            {/* Search Bar */}
            <div className="relative group max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
              <input 
                type="text" 
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 py-3.5 md:py-4 text-[10px] md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors shadow-sm font-black uppercase tracking-widest"
              />
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 mb-10 md:mb-12">
            <button
              onClick={() => setActiveTab('highschool')}
              className={`flex items-center gap-2 md:gap-3 px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-sm shadow-sm transition-all border ${
                activeTab === 'highschool' 
                  ? 'bg-blue-600 text-white shadow-blue-600/20 border-blue-600' 
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 md:w-5 md:h-5" />
              High School
            </button>
            <button
              onClick={() => setActiveTab('freshman')}
              className={`flex items-center gap-2 md:gap-3 px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-sm shadow-sm transition-all border ${
                activeTab === 'freshman' 
                  ? 'bg-mango text-white shadow-mango/20 border-mango' 
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 md:w-5 md:h-5" />
              Freshman Portal
            </button>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredModules.map((module, idx) => (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-[32px] p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-mango/50 transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-5 md:mb-6">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 ${
                      activeTab === 'highschool' ? 'bg-blue-600/10 text-blue-600' : 'bg-mango/10 text-mango'
                    }`}>
                      <FileText className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] md:text-xs font-black rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                      {module.format}
                    </span>
                  </div>
                  
                  <h3 className="text-sm md:text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2 uppercase tracking-tight">
                    {module.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-sm text-slate-500 dark:text-slate-400 mb-6 md:mb-8 mt-auto pt-4 font-black uppercase tracking-tight">
                    <span>{module.size}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{module.downloads.toLocaleString()} DLs</span>
                  </div>
                  
                  <button className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px] md:text-sm group-hover:bg-mango group-hover:text-white transition-colors border border-transparent shadow-sm">
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    Download
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredModules.length === 0 && (
              <div className="col-span-full py-16 md:py-20 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-2xl md:rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-sm md:text-lg font-black uppercase tracking-widest">No results for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
