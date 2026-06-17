import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Flag, Timer,
  CheckCircle2, AlertCircle, Trophy, RefreshCcw,
  Home, BookOpen, ArrowRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import Header from '../components/Header';

interface Choice {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  order_index: number;
  choices: Choice[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  lesson: number;
  questions: Question[];
}

export default function QuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [quiz,        setQuiz]        = useState<Quiz | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [answers,     setAnswers]     = useState<Record<number, number>>({});   // questionId → choiceId
  const [flagged,     setFlagged]     = useState<Set<number>>(new Set());
  const [revealed,    setRevealed]    = useState(false);   // show selected answer highlight
  const [finished,    setFinished]    = useState(false);
  const [result,      setResult]      = useState<{ score_percentage: number; passed: boolean } | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(0);

  // ── Load quiz ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    apiFetch(`/quizzes/${lessonId}/`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json();
          setError(d.detail ?? 'Could not load quiz.');
          return;
        }
        const data: Quiz = await res.json();
        setQuiz(data);
        // 2 minutes per question, capped at 30 min
        setTimeLeft(Math.min(data.questions.length * 120, 1800));
      })
      .catch(() => setError('Network error. Please try again.'))
      .finally(() => setLoading(false));
  }, [lessonId]);

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished || timeLeft <= 0 || !quiz) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [finished, timeLeft, quiz]);

  useEffect(() => {
    if (timeLeft === 0 && quiz && !finished) handleSubmit();
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const selectChoice = (questionId: number, choiceId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    setRevealed(true);
  };

  const toggleFlag = (questionId: number) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qId, cId]) => ({
          question_id: Number(qId),
          choice_id:   cId,
        })),
      };
      const res  = await apiFetch(`/quizzes/${quiz.id}/submit/`, {
        method: 'POST',
        body:   JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      setFinished(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-mango/30 border-t-mango rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
            {error}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-mango text-white font-black text-xs uppercase tracking-widest rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  if (!quiz) return null;

  // ── Results screen ─────────────────────────────────────────────────────
  if (finished && result) {
    const passed = result.passed;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] p-6 md:p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-mango/10 text-mango' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
            <Trophy className="w-8 h-8 md:w-12 md:h-12" />
          </div>

          <h2 className="text-2xl md:text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
            {passed ? 'Passed!' : 'Not Passed'}
          </h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">
            {quiz.title} — Result
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-3xl font-mono font-black text-slate-900 dark:text-white">
                {Math.round(result.score_percentage)}%
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Your Score</div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-3xl font-mono font-black text-slate-900 dark:text-white">
                {quiz.passing_score}%
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Passing Score</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setFinished(false); setAnswers({}); setCurrentIdx(0); setRevealed(false); setResult(null); setTimeLeft(Math.min(quiz.questions.length * 120, 1800)); }}
              className="w-full py-4 bg-mango text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-mango/20 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Retake Quiz
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Back to Lesson
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question    = quiz.questions[currentIdx];
  const isAnswered  = question.id in answers;
  const isFlagged   = flagged.has(question.id);
  const answeredCount = Object.keys(answers).length;

  // ── Quiz session ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 md:px-6 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-mango transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {quiz.title}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {quiz.questions.length} Questions • Pass at {quiz.passing_score}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-mono font-black text-xs tabular-nums ${timeLeft < 60 ? 'border-red-200 dark:border-red-800 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950'}`}>
              <Timer className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2.5 md:px-6 md:py-3 bg-mango text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-mango/20 disabled:opacity-70"
            >
              {submitting ? '...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <motion.div
            className="h-full bg-mango"
            animate={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6 md:px-6 md:py-10 space-y-6">

        {/* Progress info */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {answeredCount} / {quiz.questions.length} Answered
          </span>
          <span className="text-xs font-black text-mango uppercase tracking-widest">
            {Math.round((answeredCount / quiz.questions.length) * 100)}% Complete
          </span>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] p-5 md:p-10 shadow-sm"
          >
            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-mango uppercase tracking-widest px-3 py-1.5 bg-mango/10 rounded-full">
                Question {currentIdx + 1}
              </span>
              <button
                onClick={() => toggleFlag(question.id)}
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isFlagged ? 'text-red-500' : 'text-slate-300 hover:text-slate-400'}`}
              >
                <Flag className={`w-4 h-4 ${isFlagged ? 'fill-red-500' : ''}`} />
                <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Question text */}
            <h3 className="text-base md:text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-relaxed mb-8">
              {question.text}
            </h3>

            {/* Choices */}
            <div className="space-y-3">
              {question.choices.map((choice, idx) => {
                const isSelected = answers[question.id] === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => selectChoice(question.id, choice.id)}
                    className={`w-full p-4 text-left rounded-xl md:rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'border-mango bg-mango/5 text-mango'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 transition-all ${
                      isSelected ? 'bg-mango text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight">{choice.text}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto text-mango flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => { setCurrentIdx(p => p - 1); setRevealed(false); }}
            disabled={currentIdx === 0}
            className="px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-30 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                  idx === currentIdx
                    ? 'bg-mango text-white scale-110'
                    : q.id in answers
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : flagged.has(q.id)
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIdx === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 disabled:opacity-70"
            >
              Finish <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { setCurrentIdx(p => p + 1); setRevealed(false); }}
              className="px-5 py-3.5 bg-mango text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-mango/20 flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
