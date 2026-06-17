/**
 * CourseLearning.tsx — /learn/:courseId
 *
 * Architecture:
 *   1. Load course metadata   → GET /api/courses/:id/
 *   2. Load lesson list       → GET /api/courses/:id/lessons/
 *      Each lesson has: id, title, order_index, embed_url, is_locked, duration_display
 *   3. Load resume position   → GET /api/courses/:id/resume/
 *      → { next_lesson_id, last_watched_time }
 *   4. Sidebar renders flat lesson list (no chapters — the data model is flat)
 *   5. Video tab embeds lesson.embed_url
 *   6. Notes tab loads        → GET /api/notes/lesson/:id/
 *   7. Quiz tab navigates     → /quiz/:lessonId
 *   8. "Next Lesson" calls    → POST /api/courses/lesson/:id/complete/
 *      then advances to the next lesson
 *   9. Progress auto-saves    → POST /api/courses/lesson/:id/progress/
 *      every 30 seconds while a video is playing (via postMessage from iframe)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, ChevronRight, PlayCircle, CheckCircle2,
  FileQuestion, BookOpen, FileText, Menu, X,
  Lock, AlertCircle, Loader2,
} from 'lucide-react';
import { apiFetch, unwrap } from '../lib/api';

// ---------------------------------------------------------------------------
// Types — mirror the backend API shapes exactly
// ---------------------------------------------------------------------------

interface LessonSummary {
  id: number;
  title: string;
  description: string;
  order_index: number;
  is_free_preview: boolean;
  duration_seconds: number;
  duration_display: string;
  youtube_video_id: string;
  embed_url: string;
  thumbnail_url: string;
  is_locked: boolean;
}

interface CourseMeta {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  lesson_count: number;
}

interface ResumeInfo {
  next_lesson_id: number;
  last_watched_time: number;
}

interface NoteItem {
  id: number;
  title: string;
  content: string;
}

type TabId = 'video' | 'notes' | 'quiz';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CourseLearning() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────
  const [course,  setCourse]  = useState<CourseMeta | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Active lesson ────────────────────────────────────────────────────────
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab,      setActiveTab]      = useState<TabId>('video');
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [completedIds,   setCompletedIds]   = useState<Set<number>>(new Set());
  const [notes,          setNotes]          = useState<NoteItem[]>([]);
  const [notesLoading,   setNotesLoading]   = useState(false);

  // Progress auto-save timer ref
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeLesson = lessons.find(l => l.id === activeLessonId) ?? null;
  const activeLessonIndex = lessons.findIndex(l => l.id === activeLessonId);

  // ---------------------------------------------------------------------------
  // Load course + lessons + resume in parallel
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [metaRes, lessonsRes, resumeRes] = await Promise.all([
          apiFetch(`/courses/${courseId}/`),
          apiFetch(`/courses/${courseId}/lessons/`),
          apiFetch(`/courses/${courseId}/resume/`),
        ]);

        if (cancelled) return;

        // Course meta
        if (!metaRes.ok) {
          if (metaRes.status === 403) throw new Error('Access denied. Your course access may not have been approved yet.');
          if (metaRes.status === 404) throw new Error('Course not found.');
          throw new Error('Failed to load course.');
        }
        const metaBody = await metaRes.json();
        const meta: CourseMeta = unwrap(metaBody);

        // Lessons
        if (!lessonsRes.ok) {
          if (lessonsRes.status === 403) throw new Error('Access denied. Please complete the payment process.');
          throw new Error('Failed to load lessons.');
        }
        const lessonsBody = await lessonsRes.json();
        const lessonList: LessonSummary[] = unwrap(lessonsBody);

        if (cancelled) return;
        setCourse(meta);
        setLessons(lessonList);

        // Resume — determine which lesson to open first
        if (resumeRes.ok) {
          const resumeBody = await resumeRes.json();
          const resume: ResumeInfo = unwrap(resumeBody);
          setActiveLessonId(resume.next_lesson_id);
          lastSavedTimeRef.current = resume.last_watched_time;
        } else if (lessonList.length > 0) {
          // Fallback: first accessible lesson
          const first = lessonList.find(l => !l.is_locked) ?? lessonList[0];
          setActiveLessonId(first.id);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [courseId]);

  // ---------------------------------------------------------------------------
  // Load notes when Notes tab is opened for the active lesson
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'notes' || !activeLessonId) return;
    let cancelled = false;
    setNotesLoading(true);
    setNotes([]);

    apiFetch(`/notes/lesson/${activeLessonId}/`)
      .then(async res => {
        if (!res.ok) { setNotes([]); return; }
        const body = await res.json();
        if (!cancelled) setNotes(unwrap<NoteItem[]>(body));
      })
      .catch(() => { if (!cancelled) setNotes([]); })
      .finally(() => { if (!cancelled) setNotesLoading(false); });

    return () => { cancelled = true; };
  }, [activeTab, activeLessonId]);

  // ---------------------------------------------------------------------------
  // Auto-save progress every 30 seconds
  // ---------------------------------------------------------------------------
  const saveProgress = useCallback(async (lessonId: number, currentTime: number) => {
    if (currentTime === lastSavedTimeRef.current) return;
    lastSavedTimeRef.current = currentTime;
    try {
      await apiFetch(`/courses/lesson/${lessonId}/progress/`, {
        method: 'POST',
        body: JSON.stringify({ current_time: currentTime }),
      });
    } catch {
      // Non-critical — silently ignore
    }
  }, []);

  useEffect(() => {
    if (!activeLessonId) return;

    // Clear previous timer
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    // Poll every 30 seconds using a simple counter (no YouTube API dependency)
    let elapsedSeconds = lastSavedTimeRef.current;
    progressTimerRef.current = setInterval(() => {
      elapsedSeconds += 30;
      saveProgress(activeLessonId, elapsedSeconds);
    }, 30_000);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeLessonId, saveProgress]);

  // ---------------------------------------------------------------------------
  // Handle Next Lesson
  // ---------------------------------------------------------------------------
  const handleNextLesson = async () => {
    if (!activeLessonId) return;

    // 1. Mark current lesson complete
    try {
      await apiFetch(`/courses/lesson/${activeLessonId}/complete/`, { method: 'POST' });
      setCompletedIds(prev => new Set(prev).add(activeLessonId));
    } catch {
      // Non-critical — optimistically update UI anyway
      setCompletedIds(prev => new Set(prev).add(activeLessonId));
    }

    // 2. Advance to next lesson
    if (activeLessonIndex < lessons.length - 1) {
      const next = lessons[activeLessonIndex + 1];
      setActiveLessonId(next.id);
      setActiveTab('video');
      lastSavedTimeRef.current = 0;
      setIsSidebarOpen(false);
    }
  };

  const handleSelectLesson = (lesson: LessonSummary) => {
    if (lesson.is_locked) return;
    setActiveLessonId(lesson.id);
    setActiveTab('video');
    lastSavedTimeRef.current = 0;
    setIsSidebarOpen(false);
  };

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-mango animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {error || 'Course not found'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            If you believe this is a mistake, check your dashboard to confirm your payment was approved.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-mango text-white font-bold rounded-xl text-sm hover:bg-mango/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isLastLesson = activeLessonIndex === lessons.length - 1;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <main className="flex flex-col h-screen overflow-hidden">

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-mango"
              aria-label="Open lesson list"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-mango shrink-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                {course.title}
              </span>
              {activeLesson && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-mango font-medium truncate max-w-[200px]">
                    {activeLesson.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Progress pill */}
          <span className="text-xs font-black text-mango bg-mango/10 px-3 py-1.5 rounded-full border border-mango/20 shrink-0">
            {completedIds.size} / {lessons.length} done
          </span>
        </div>

        <div className="flex-grow flex overflow-hidden relative">

          {/* ── Sidebar overlay (mobile) ──────────────────────────────────── */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-80 shrink-0
              border-r border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900
              flex flex-col h-full overflow-y-auto
              transition-transform duration-300
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            {/* Mobile header */}
            <div className="lg:hidden p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-mango"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-mango"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lesson list */}
            <div className="p-4 space-y-1 overflow-y-auto flex-grow">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
                Course Content
              </p>

              {lessons.map((lesson, idx) => {
                const isActive    = lesson.id === activeLessonId;
                const isCompleted = completedIds.has(lesson.id);
                const isLocked    = lesson.is_locked;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    disabled={isLocked}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors
                      ${isActive
                        ? 'bg-mango/10 text-mango'
                        : isLocked
                          ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }
                    `}
                  >
                    {/* Index / lock indicator */}
                    <span className={`text-[10px] font-black w-5 shrink-0 text-center ${isActive ? 'text-mango' : 'text-slate-400'}`}>
                      {isLocked ? <Lock className="w-3 h-3 mx-auto" /> : idx + 1}
                    </span>

                    <span className="text-xs font-bold leading-tight flex-grow">
                      {lesson.title}
                    </span>

                    {/* Completion / duration */}
                    <span className="shrink-0">
                      {isCompleted
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : lesson.duration_display
                          ? <span className="text-[9px] font-mono text-slate-400">{lesson.duration_display}</span>
                          : <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-mango' : 'border-slate-300 dark:border-slate-700'}`} />
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ───────────────────────────────────────────────── */}
          <div className="flex-grow bg-slate-50 dark:bg-slate-950 p-4 md:p-8 h-full overflow-y-auto">
            {!activeLesson ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Select a lesson to begin.</p>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Tab bar ────────────────────────────────────────────── */}
                <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-0 sticky top-0 bg-slate-50 dark:bg-slate-950 z-20 pt-1">
                  {([
                    { id: 'video' as TabId, label: 'Video',  Icon: PlayCircle  },
                    { id: 'notes' as TabId, label: 'Notes',  Icon: FileText    },
                    { id: 'quiz'  as TabId, label: 'Quiz',   Icon: FileQuestion },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`
                        flex items-center gap-1.5 pb-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap
                        ${activeTab === id
                          ? 'border-mango text-mango'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── VIDEO TAB ──────────────────────────────────────────── */}
                {activeTab === 'video' && (
                  <div>
                    <div className="w-full aspect-video bg-slate-900 rounded-[28px] overflow-hidden relative shadow-2xl border border-slate-800">
                      {activeLesson.embed_url ? (
                        <iframe
                          key={activeLesson.id}
                          src={activeLesson.embed_url}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={activeLesson.title}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white/20 mb-4" />
                          <p className="text-white/40 text-sm font-medium">
                            Video not yet available for this lesson.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lesson meta */}
                    <div className="mt-6 bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {activeLesson.title}
                      </h2>
                      {activeLesson.description && (
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {activeLesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── NOTES TAB ──────────────────────────────────────────── */}
                {activeTab === 'notes' && (
                  <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-200 dark:border-slate-800 min-h-[320px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                      Lesson Notes
                    </h3>

                    {notesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-mango animate-spin" />
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No notes for this lesson yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {notes.map(note => (
                          <div key={note.id} className="space-y-2">
                            {note.title && (
                              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                {note.title}
                              </h4>
                            )}
                            {/* S1 FIX: note.content is plain text/Markdown stored by admin.
                                Never inject it as raw HTML. Render as pre-wrap text instead.
                                If rich HTML rendering is needed in the future, sanitize with
                                DOMPurify before setting innerHTML. */}
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── QUIZ TAB ───────────────────────────────────────────── */}
                {activeTab === 'quiz' && (
                  <div className="bg-white dark:bg-slate-900 rounded-[28px] p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-mango/10 rounded-3xl flex items-center justify-center text-mango mb-6">
                      <FileQuestion className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Lesson Quiz
                    </h3>
                    <p className="text-slate-500 text-sm mb-8">
                      Test your understanding of <strong>{activeLesson.title}</strong>.
                    </p>
                    <button
                      onClick={() => navigate(`/quiz/${activeLesson.id}`)}
                      className="w-full py-4 bg-mango hover:bg-mango/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-mango/20 transition-all hover:-translate-y-0.5"
                    >
                      Take Quiz
                    </button>
                  </div>
                )}

                {/* ── Next Lesson button ─────────────────────────────────── */}
                {!isLastLesson && activeTab === 'video' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextLesson}
                      className="px-6 py-3 bg-mango hover:bg-mango/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-mango/20 transition-all hover:-translate-y-0.5"
                    >
                      Next Lesson
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {isLastLesson && activeTab === 'video' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={async () => {
                        if (activeLessonId) {
                          await apiFetch(`/courses/lesson/${activeLessonId}/complete/`, { method: 'POST' });
                          setCompletedIds(prev => new Set(prev).add(activeLessonId));
                        }
                        navigate('/dashboard');
                      }}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Course
                    </button>
                  </div>
                )}

                <div className="h-16" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
