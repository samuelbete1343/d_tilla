import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, BookOpen,
  FileText, Download, Search, Layers,
  AlertCircle, Lock, ChevronDown
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import Header from '../components/Header';

// ── Types ──────────────────────────────────────────────────────────────────

interface Note {
  id: number;
  title: string;
  content: string;          // plain text or markdown — rendered as-is
  note_type: 'text' | 'pdf';
  pdf_url?: string;
  order_index: number;
  created_at: string;
}

interface Lesson {
  id: number;
  title: string;
  order_index: number;
  is_locked: boolean;
  notes: Note[];
}

interface Course {
  id: number;
  title: string;
  lessons: Lesson[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function NotesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate     = useNavigate();

  const [course,         setCourse]         = useState<Course | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeNoteId,   setActiveNoteId]   = useState<number | null>(null);
  const [search,         setSearch]         = useState('');
  const [sidebarOpen,    setSidebarOpen]    = useState(true);

  // ── Load course + lessons + notes ────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    apiFetch(`/notes/course/${courseId}/`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json();
          setError(d.detail ?? 'Could not load notes.');
          return;
        }
        const data: Course = await res.json();
        setCourse(data);
        // Auto-select first available lesson + note
        const firstLesson = data.lessons.find(l => !l.is_locked && l.notes.length > 0);
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
          setActiveNoteId(firstLesson.notes[0].id);
        }
      })
      .catch(() => setError('Network error. Please try again.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeLesson = course?.lessons.find(l => l.id === activeLessonId);
  const activeNote   = activeLesson?.notes.find(n => n.id === activeNoteId);

  const filteredLessons = course?.lessons.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.notes.some(n => n.title.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  const allNotes     = activeLesson?.notes ?? [];
  const currentNoteIdx = allNotes.findIndex(n => n.id === activeNoteId);

  const goToPrevNote = () => {
    if (currentNoteIdx > 0) setActiveNoteId(allNotes[currentNoteIdx - 1].id);
  };
  const goToNextNote = () => {
    if (currentNoteIdx < allNotes.length - 1) setActiveNoteId(allNotes[currentNoteIdx + 1].id);
  };

  // ── States ───────────────────────────────────────────────────────────────
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
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{error}</h2>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-mango text-white font-black text-xs uppercase tracking-widest rounded-xl">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  if (!course) return null;

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

      {/* Top header */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-mango transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Study Notes
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.title}</p>
            </div>
          </div>

          {/* Toggle sidebar on mobile */}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="md:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-mango transition-colors"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(sidebarOpen) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 absolute md:relative z-30 h-full md:h-auto"
              style={{ minWidth: 260, maxWidth: 300 }}
            >
              {/* Search */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors"
                  />
                </div>
              </div>

              {/* Lesson list */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredLessons.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8 font-bold uppercase tracking-widest">No results</p>
                ) : (
                  filteredLessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isActive={activeLessonId === lesson.id}
                      activeNoteId={activeNoteId}
                      onSelectLesson={() => {
                        if (lesson.is_locked) return;
                        setActiveLessonId(lesson.id);
                        if (lesson.notes.length > 0) setActiveNoteId(lesson.notes[0].id);
                        setSidebarOpen(window.innerWidth >= 768);
                      }}
                      onSelectNote={(noteId) => {
                        setActiveLessonId(lesson.id);
                        setActiveNoteId(noteId);
                        setSidebarOpen(window.innerWidth >= 768);
                      }}
                    />
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          {!activeNote ? (
            <EmptyState />
          ) : (
            <motion.div
              key={activeNote.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Note header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[32px] p-6 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-mango uppercase tracking-widest px-3 py-1 bg-mango/10 rounded-full">
                        {activeLesson?.title}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Note {currentNoteIdx + 1} of {allNotes.length}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {activeNote.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">{formatDate(activeNote.created_at)}</p>
                  </div>

                  {activeNote.note_type === 'pdf' && activeNote.pdf_url && (
                    <a
                      href={activeNote.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-mango text-white font-black text-[10px] uppercase tracking-widest rounded-xl shrink-0 shadow-lg shadow-mango/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  )}
                </div>

                {/* Note content */}
                {activeNote.note_type === 'pdf' && activeNote.pdf_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <iframe
                      src={activeNote.pdf_url}
                      className="w-full h-[600px]"
                      title={activeNote.title}
                    />
                  </div>
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-body">
                      {activeNote.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Prev / Next note */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={goToPrevNote}
                  disabled={currentNoteIdx === 0}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-30 hover:border-mango transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Note
                </button>
                <button
                  onClick={goToNextNote}
                  disabled={currentNoteIdx === allNotes.length - 1}
                  className="flex items-center gap-2 px-5 py-3.5 bg-mango text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-mango/20 disabled:opacity-30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Next Note <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LessonItem({
  lesson, isActive, activeNoteId, onSelectLesson, onSelectNote
}: {
  lesson: Lesson;
  isActive: boolean;
  activeNoteId: number | null;
  onSelectLesson: () => void;
  onSelectNote: (id: number) => void;
}) {
  const [open, setOpen] = useState(isActive);

  useEffect(() => { if (isActive) setOpen(true); }, [isActive]);

  return (
    <div className="mb-1">
      <button
        onClick={() => { onSelectLesson(); setOpen(p => !p); }}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
          isActive
            ? 'bg-mango/5 text-mango'
            : lesson.is_locked
            ? 'opacity-50 cursor-not-allowed text-slate-400'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-mango/10 text-mango' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {lesson.is_locked ? <Lock className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
        </div>
        <span className="flex-1 text-xs font-black uppercase tracking-tight line-clamp-1">{lesson.title}</span>
        {!lesson.is_locked && lesson.notes.length > 0 && (
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
        {!lesson.is_locked && (
          <span className="text-[9px] font-black text-slate-400 shrink-0">{lesson.notes.length}</span>
        )}
      </button>

      <AnimatePresence>
        {open && !lesson.is_locked && lesson.notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-4"
          >
            {lesson.notes.map(note => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${
                  activeNoteId === note.id
                    ? 'bg-mango text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] font-bold line-clamp-1">{note.title}</span>
                {note.note_type === 'pdf' && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ml-auto shrink-0 ${activeNoteId === note.id ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                    PDF
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
          <BookOpen className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
          Select a Note
        </h3>
        <p className="text-sm text-slate-400 font-bold">
          Choose a lesson from the sidebar to view its study notes.
        </p>
      </div>
    </div>
  );
}
