import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Flag, 
  ChevronRight,
  BookOpen,
  Trash2,
  Layers,
  Zap,
  Target,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlaggedQuestion {
  questionId: number;
  text: string;
  chapter?: string;
  lesson?: string;
}

interface AllFlags {
  [type: string]: {
    [courseId: string]: FlaggedQuestion[];
  };
}

export default function FlaggedQuestions() {
  const navigate = useNavigate();
  const [flaggedData, setFlaggedData] = useState<AllFlags>({});
  const [activeType, setActiveType] = useState('quiz');

  useEffect(() => {
    const savedFlags = JSON.parse(localStorage.getItem('flagged_questions') || '{}');
    setFlaggedData(savedFlags);
  }, []);

  const removeFlag = (type: string, courseId: string, questionId: number) => {
    const newData = { ...flaggedData };
    if (newData[type] && newData[type][courseId]) {
      newData[type][courseId] = newData[type][courseId].filter(q => q.questionId !== questionId);
      if (newData[type][courseId].length === 0) {
        delete newData[type][courseId];
      }
      if (Object.keys(newData[type]).length === 0) {
        delete newData[type];
      }
    }
    setFlaggedData(newData);
    localStorage.setItem('flagged_questions', JSON.stringify(newData));
  };

  const types = [
    { id: 'quiz', label: 'Quiz', icon: Zap, color: 'text-mango', bgColor: 'bg-mango/10' },
    { id: 'practice', label: 'Practice', icon: Layers, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { id: 'mid', label: 'Mid-term', icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'final', label: 'Final Exam', icon: Trophy, color: 'text-purple-500', bgColor: 'bg-purple-500/10' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-slate-50 dark:bg-slate-950 rounded-[12px] text-slate-400 hover:text-mango transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Flagged Questions
              </h1>
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                Review and master your bookmarked items
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-10 space-y-10">
        {/* Type Selector */}
        <div className="flex flex-wrap gap-4">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
                activeType === type.id 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl' 
                  : 'bg-transparent border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${type.bgColor} flex items-center justify-center ${type.color}`}>
                <type.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className={`block text-[10px] font-black uppercase tracking-widest ${activeType === type.id ? 'text-slate-400' : 'text-slate-400'}`}>Session Type</span>
                <span className={`block font-bold ${activeType === type.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{type.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {!flaggedData[activeType] || Object.keys(flaggedData[activeType]).length === 0 ? (
            <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-800">
                 <Flag className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-display font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">No flagged questions in {activeType}</h3>
               <p className="text-slate-400 text-sm max-w-sm mx-auto">
                 Questions you flag during {activeType} sessions will appear here for dedicated review.
               </p>
            </div>
          ) : (
            Object.entries(flaggedData[activeType]).map(([courseId, questions]) => (
              <div key={courseId} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{courseId.replace('-', ' ')}</h3>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {(questions as FlaggedQuestion[]).map((question) => (
                    <motion.div 
                      key={question.questionId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[32px] shadow-sm group hover:border-mango transition-all"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-mango uppercase tracking-widest px-3 py-1 bg-mango/10 rounded-full">Question #{question.questionId}</span>
                            {question.chapter && (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{question.chapter}</span>
                            )}
                          </div>
                          <h4 className="text-lg md:text-xl font-display font-black text-slate-900 dark:text-white leading-relaxed">
                            {question.text}
                          </h4>
                        </div>
                        <button 
                          onClick={() => removeFlag(activeType, courseId, question.questionId)}
                          className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                        <div className="flex items-center gap-4">

                        </div>
                        <button 
                          onClick={() => navigate(`/exam/${activeType}/${courseId}`)}
                          className="flex items-center gap-2 text-[10px] font-black text-mango uppercase tracking-widest hover:translate-x-2 transition-transform"
                        >
                          Retry Session
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
