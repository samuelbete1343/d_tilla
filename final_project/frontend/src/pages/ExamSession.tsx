/**
 * ExamSession — DISABLED
 *
 * The previous implementation used 5 hardcoded Physics mock questions
 * shown to every student regardless of course, chapter, or lesson.
 * This created fake exam perception and has been removed.
 *
 * Students should take quizzes via the real quiz system:
 *   /quiz/:lessonId  →  served by the backend quiz engine
 */
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

export default function ExamSession() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[32px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-20 h-20 bg-mango/10 rounded-3xl flex items-center justify-center text-mango mx-auto mb-6">
          <ClipboardList className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
          Exam Bank Coming Soon
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The full exam system is under development. In the meantime, take
          lesson quizzes directly from your course pages.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard?tab=courses')}
            className="w-full py-4 bg-mango text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-mango/20 hover:bg-mango/90 transition-all"
          >
            Go to My Courses
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
