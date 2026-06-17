/**
 * CourseDetail.tsx — API-driven (replaces static courseCatalogue version)
 *
 * Route: /courses/:courseId   (courseId is the Django slug, e.g. "general-physics")
 *
 * Fetches GET /api/courses/<slug>/ on mount.
 * Cart stores String(course.id) — the integer Django PK — so Checkout
 * can POST selected_course_ids without a second slug→pk lookup.
 *
 * No imports from courseCatalogue.ts.
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { apiFetch, unwrap } from '../lib/api';
import {
  ArrowLeft, BookOpen, Clock, Users, Star,
  CheckCircle2, PlayCircle, FileText, Award,
  ShoppingCart, Smartphone, ShieldCheck, ChevronDown,
  FileEdit, Target, Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// API shape  (GET /api/courses/<slug>/ returns CourseWithLessonsSerializer)
// ---------------------------------------------------------------------------
interface ApiLesson {
  id:               number;
  title:            string;
  description:      string;
  order_index:      number;
  is_free_preview:  boolean;
  duration_seconds: number;
  duration_display: string;
  youtube_video_id: string;
  embed_url:        string;
  thumbnail_url:    string;
  is_locked:        boolean;
}

interface ApiCourse {
  id:           number;
  title:        string;
  slug:         string;
  description:  string;
  category:     string;
  price:        string | null;
  image:        string | null;
  is_published: boolean;
  lesson_count: number;
  access_count: number;
  lessons:      ApiLesson[];
  created_at:   string;
  updated_at:   string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate     = useNavigate();
  const { toggleCourse, selectedCourses } = useCart();

  const [course,     setCourse]    = useState<ApiCourse | null>(null);
  const [loading,    setLoading]   = useState(true);
  const [fetchErr,   setFetchErr]  = useState<string | null>(null);
  const [activeTab,  setActiveTab] = useState('Overview');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  // ── Fetch course ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchErr(null);
      try {
        const res  = await apiFetch(`/courses/${courseId}/`);
        if (res.status === 404) {
          if (!cancelled) setFetchErr('not_found');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const body   = await res.json();
        const data: ApiCourse = Array.isArray(body) || typeof body.id === 'number'
          ? body
          : unwrap<ApiCourse>(body);

        if (!cancelled) setCourse(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setFetchErr(
            err instanceof Error ? err.message : 'Failed to load course.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [courseId]);

  // Cart uses String(pk) so Checkout can POST integer IDs directly
  const cartKey    = course ? String(course.id) : '';
  const isSelected = selectedCourses.includes(cartKey);

  const handleToggleSelect = () => {
    if (course) toggleCourse(String(course.id));
  };

  const handleGoToCheckout = () => navigate('/checkout');
  const handleBrowseMore   = () => navigate('/explore-courses');

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-mango" />
          <span className="ml-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
            Loading…
          </span>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not found / error ─────────────────────────────────────────────────────
  if (fetchErr || !course) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {fetchErr === 'not_found' ? 'Course not found' : 'Failed to load course'}
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {fetchErr !== 'not_found' && fetchErr}
            </p>
            <Link
              to="/explore-courses"
              className="text-mango font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const placeholder = '/images/Courses-Profile/Communicative English Skills I.png';
  const imgSrc      = course.image || placeholder;

  // Group lessons into pseudo-chapters (4 lessons each) for display
  const LESSONS_PER_CHAPTER = 4;
  const chapterGroups: ApiLesson[][] = [];
  for (let i = 0; i < course.lessons.length; i += LESSONS_PER_CHAPTER) {
    chapterGroups.push(course.lessons.slice(i, i + LESSONS_PER_CHAPTER));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <Header />

      <main className="flex-grow pt-24">
        {/* Back button */}
        <div className="w-full px-6 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-mango transition-colors font-bold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div className="relative">
          {/* Cover */}
          <div className="h-48 md:h-80 w-full relative overflow-hidden">
            <img
              src="/images/Courses-Profile/Courses-cover-image.png"
              alt="Cover"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="w-full px-5 md:px-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-5 md:gap-6 mb-4">
              {/* Course image */}
              <div className="relative group shrink-0 -mt-12 md:-mt-20">
                <div className="w-28 h-28 md:w-44 md:h-44 rounded-2xl border-4 border-white dark:border-slate-950 overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
                  <img
                    src={imgSrc}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                  />
                </div>
              </div>

              {/* Title block */}
              <div className="flex-grow pb-2 md:pb-4 pt-4 md:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-mango/10 text-mango text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-mango/20">
                    {course.category}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                    {course.slug}
                  </span>
                </div>
                <h1 className="text-xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">
                  {course.title}
                </h1>
                {course.price && (
                  <p className="text-mango font-black text-sm md:text-lg">
                    {course.price} ETB
                  </p>
                )}
              </div>

              {/* Cart action */}
              <div className="pb-2 md:pb-4 w-full md:w-auto flex flex-col gap-2 md:items-end">
                <button
                  onClick={handleToggleSelect}
                  className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-red-500 hover:shadow-red-500/20'
                      : 'bg-mango text-white shadow-mango/20 hover:bg-mango/90'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  {isSelected ? '✓ In Cart' : 'Add to Cart'}
                </button>

                {isSelected && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={handleGoToCheckout}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-mango dark:hover:bg-mango hover:text-white transition-all"
                    >
                      Go to Checkout
                    </button>
                    <button
                      onClick={handleBrowseMore}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-mango/50 hover:text-mango transition-all"
                    >
                      Add More
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 mb-8 md:mb-12 mt-6 md:mt-8">
              {['Overview', 'Curriculum'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black uppercase tracking-widest transition-colors relative whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-mango'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-mango rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content grid */}
            <div className="grid lg:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-20">
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* ── Overview ── */}
                    {activeTab === 'Overview' && (
                      <div className="space-y-10 md:space-y-12">
                        <section>
                          <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight">
                            About this Course
                          </h3>
                          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                            {course.description ||
                              `This comprehensive course on ${course.title} is designed to help you master the subject from fundamentals to advanced topics. Our curriculum is aligned with the latest Ministry of Education standards.`}
                          </p>
                        </section>

                        <section>
                          <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight">
                            What you'll learn
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                            {[
                              'Master core theoretical concepts',
                              'Solve complex practical problems',
                              'Prepare for final examinations',
                              'Access exclusive study materials',
                              'Learn from top-tier instructors',
                              'Collaborate with fellow students',
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800"
                              >
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-[10px] md:text-base text-slate-700 dark:text-slate-300 font-black uppercase tracking-tight">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    )}

                    {/* ── Curriculum ── */}
                    {activeTab === 'Curriculum' && (
                      <section>
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight">
                          Course Curriculum
                        </h3>

                        {course.lessons.length === 0 ? (
                          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                            No lessons added yet.
                          </p>
                        ) : (
                          <div className="space-y-3 md:space-y-4">
                            {chapterGroups.map((group, i) => {
                              const isExpanded = expandedChapter === i;
                              return (
                                <div
                                  key={i}
                                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl overflow-hidden"
                                >
                                  <div
                                    onClick={() => setExpandedChapter(isExpanded ? null : i)}
                                    className="p-4 md:p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 md:gap-4">
                                      <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 dark:bg-slate-800 rounded-lg md:rounded-xl flex items-center justify-center text-slate-500 group-hover:text-mango transition-colors">
                                        <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                          Chapter {i + 1}
                                        </h4>
                                        <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                                          {group.length} Lesson{group.length !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronDown
                                      className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-mango transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100 dark:border-slate-800"
                                      >
                                        <div className="p-3 md:p-4">
                                          <div className="space-y-1.5 md:space-y-2 ml-2 md:ml-4 mb-4">
                                            {group.map((lesson) => (
                                              <div
                                                key={lesson.id}
                                                className="flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/20"
                                              >
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-mango shadow-sm border border-slate-100 dark:border-slate-600 shrink-0">
                                                  {lesson.is_locked
                                                    ? <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                                                    : <PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                  }
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                  <h5 className="text-[10px] md:text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight truncate">
                                                    {lesson.title}
                                                  </h5>
                                                  {lesson.duration_display && (
                                                    <span className="text-[8px] md:text-[10px] text-slate-400 font-bold">
                                                      {lesson.duration_display}
                                                    </span>
                                                  )}
                                                </div>
                                                {lesson.is_free_preview && (
                                                  <span className="shrink-0 text-[8px] md:text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                    Free
                                                  </span>
                                                )}
                                                {lesson.is_locked && (
                                                  <span className="shrink-0 text-[8px] md:text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                    Locked
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>

                                          {/* Exam-Cracker callout per chapter */}
                                          <div className="flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 mt-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                              <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            </div>
                                            <div>
                                              <h5 className="text-[10px] md:text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
                                                Exam-Cracker
                                              </h5>
                                              <span className="text-[8px] md:text-[10px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-black">
                                                Question Bank
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Exam cards */}
                        <div className="mt-8 space-y-3 md:space-y-4">
                          <div className="p-5 md:p-6 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-800/50 rounded-lg md:rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                              <FileEdit className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Mid Term Exam
                              </h4>
                              <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-bold">
                                Comprehensive practice questions covering the first half.
                              </p>
                            </div>
                          </div>
                          <div className="p-5 md:p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-800/50 rounded-lg md:rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                              <Award className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Final Term Exam
                              </h4>
                              <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-bold">
                                Complete course simulation practice exam with detailed answers.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 md:space-y-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[32px]">
                  <h3 className="text-base md:text-xl font-display font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tight">
                    Course Includes
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { icon: PlayCircle,  text: `${course.lesson_count} lessons` },
                      { icon: FileText,    text: 'Downloadable PDF resources' },
                      { icon: Award,       text: 'Certificate of completion' },
                      { icon: Smartphone,  text: 'Access on mobile and web' },
                      { icon: ShieldCheck, text: 'Lifetime access to materials' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 md:gap-3 text-slate-600 dark:text-slate-400">
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 text-mango" />
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-tight">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-mango/5 border border-mango/20 p-6 md:p-8 rounded-2xl md:rounded-[32px] text-center">
                  <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                    How to get access
                  </h4>
                  <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-400 mb-5 md:mb-6 font-bold">
                    Add courses to your cart, submit a payment request, then send your receipt to @Tilla_Register on Telegram. Access unlocks within 5 hours.
                  </p>
                  <button
                    onClick={handleToggleSelect}
                    className={`w-full py-3 font-black uppercase tracking-widest text-[9px] md:text-xs rounded-xl transition-all shadow-sm ${
                      isSelected
                        ? 'bg-green-500 text-white hover:bg-red-500'
                        : 'bg-mango text-white hover:bg-mango/90'
                    }`}
                  >
                    {isSelected ? '✓ In Cart — Remove?' : 'Add to Cart'}
                  </button>
                  {isSelected && (
                    <button
                      onClick={handleGoToCheckout}
                      className="mt-2 w-full py-3 font-black uppercase tracking-widest text-[9px] md:text-xs rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-mango dark:hover:bg-mango hover:text-white transition-all"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
