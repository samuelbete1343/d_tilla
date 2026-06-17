/**
 * ExamSetup — Coming Soon
 *
 * Previously depended on CartContext (localStorage purchasedCourses)
 * and hardcoded courseDetailsData for chapter lists.
 * Both have been removed. This page will be re-wired to the real
 * backend chapter API once the exam engine is ready.
 */
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import Header from '../components/Header';

export default function ExamSetup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      <main className="flex-grow pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
            Exam Setup Coming Soon
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            The custom exam configurator is under development. Lesson quizzes are available now from within your course.
          </p>
          <button
            onClick={() => navigate('/dashboard?tab=courses')}
            className="w-full py-4 bg-mango text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-mango/20 hover:bg-mango/90 transition-all"
          >
            Go to My Courses
          </button>
        </div>
      </main>
    </div>
  );
}
