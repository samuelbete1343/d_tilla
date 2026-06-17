/**
 * CourseListingSection.tsx — API-driven (replaces static courseCatalogue version)
 *
 * Fetches ALL published courses from GET /api/courses/ on mount.
 * No static imports from courseCatalogue.ts.
 *
 * Props
 * ─────
 * type               'freshman' | 'entrance'  — which category bucket to show
 * hideHeader         hide the section title/description
 * externalSearchQuery  search string from parent (ExploreCoursesUnified)
 * hideSearch         hide the local search bar
 * subCategoryFilter  'all' | 'natural' | 'social'  — entrance sub-filter
 */

import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, CheckCircle2, Atom, Globe2,
  BookOpen, Star, Video, FileText, Info, Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { apiFetch, unwrap } from '../lib/api';

// ---------------------------------------------------------------------------
// Shape returned by GET /api/courses/
// ---------------------------------------------------------------------------
export interface ApiCourse {
  id:           number;
  title:        string;
  slug:         string;
  description:  string;
  category:     string;   // e.g. "Common", "Natural Science", "Social Science", "Engineering"
  price:        string | null;
  image:        string | null;
  is_published: boolean;
  lesson_count: number;
  access_count: number;
  created_at:   string;
  updated_at:   string;
  // optional extra fields admin may add later
  chapters?:    number;
  videos?:      number;
}

// ---------------------------------------------------------------------------
// Category → freshman vs entrance mapping
// The backend uses free-text `category`; we map it to the two display buckets.
// Adjust these strings to match whatever you type in Django Admin.
// ---------------------------------------------------------------------------
const FRESHMAN_CATEGORIES = new Set([
  'common', 'natural science', 'engineering', 'social science',
  'freshman', 'university',
]);

const ENTRANCE_CATEGORIES = new Set([
  'entrance', 'high school', 'highschool',
  'entrance exam', 'entrance - natural science', 'entrance - social science',
]);

function isFreshman(course: ApiCourse): boolean {
  const cat = course.category?.toLowerCase() ?? '';
  // If explicitly tagged entrance, exclude from freshman
  if (ENTRANCE_CATEGORIES.has(cat)) return false;
  return FRESHMAN_CATEGORIES.has(cat) || !ENTRANCE_CATEGORIES.has(cat);
}

function isEntrance(course: ApiCourse): boolean {
  const cat = course.category?.toLowerCase() ?? '';
  return ENTRANCE_CATEGORIES.has(cat) ||
    cat.includes('entrance') ||
    cat.includes('high school');
}

function isNaturalScience(course: ApiCourse): boolean {
  const cat = course.category?.toLowerCase() ?? '';
  return cat.includes('natural') || cat === 'common';
}

function isSocialScience(course: ApiCourse): boolean {
  const cat = course.category?.toLowerCase() ?? '';
  return cat.includes('social') || cat === 'common';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CourseListingSectionProps {
  type:                 'freshman' | 'entrance';
  hideHeader?:          boolean;
  externalSearchQuery?: string;
  hideSearch?:          boolean;
  subCategoryFilter?:   'all' | 'natural' | 'social';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CourseListingSection({
  type,
  hideHeader       = false,
  externalSearchQuery,
  hideSearch       = false,
  subCategoryFilter = 'all',
}: CourseListingSectionProps) {
  const { t }      = useLanguage();
  const navigate   = useNavigate();
  const { selectedCourses, toggleCourse, isAtLimit } = useCart();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [courses,  setCourses]  = useState<ApiCourse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const searchQuery = externalSearchQuery !== undefined
    ? externalSearchQuery
    : localSearchQuery;

  // ── Fetch from API ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchErr(null);
      try {
        const res  = await apiFetch('/courses/');
        const body = await res.json();

        // Response shape (two wrappers stacked):
        //
        //   CustomJSONRenderer envelope (always):
        //   { success: true, message: "Success", data: <inner>, error: null }
        //
        //   PageNumberPagination inner (because DEFAULT_PAGINATION_CLASS is set):
        //   { count: N, next: "...", previous: null, results: [...courses] }
        //
        // So the full wire shape is:
        //   { success, data: { count, next, previous, results: [...] } }
        //
        // unwrap(body) → body.data → { count, next, previous, results: [...] }
        // We must then pull .results to get the actual array.

        console.log('[CourseListingSection] raw API body:', body);

        // Step 1: unwrap the CustomJSONRenderer envelope
        const inner = Array.isArray(body) ? body : unwrap<unknown>(body);

        console.log('[CourseListingSection] after unwrap:', inner);

        // Step 2: handle DRF pagination — extract .results if present
        let data: ApiCourse[];
        if (Array.isArray(inner)) {
          data = inner;
        } else if (inner && typeof inner === 'object' && Array.isArray((inner as any).results)) {
          data = (inner as any).results;
        } else {
          console.error('[CourseListingSection] Unexpected API shape:', inner);
          throw new Error('Unexpected response shape from /api/courses/');
        }

        console.log('[CourseListingSection] final courses array:', data);

        if (!cancelled) setCourses(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setFetchErr(
            err instanceof Error ? err.message : 'Failed to load courses.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Filter by type + search ────────────────────────────────────────────
  const typedCourses = courses.filter(c =>
    type === 'freshman' ? isFreshman(c) : isEntrance(c),
  );

  const filteredCourses = typedCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Entrance sub-buckets
  const naturalScienceCourses = filteredCourses.filter(isNaturalScience);
  const socialScienceCourses  = filteredCourses.filter(isSocialScience);

  // ── Shared loading / error states ──────────────────────────────────────
  if (loading) {
    return (
      <section className="mt-8 md:mt-16 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-mango" />
        <span className="ml-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
          Loading courses…
        </span>
      </section>
    );
  }

  if (fetchErr) {
    return (
      <section className="mt-8 md:mt-16">
        <div className="py-12 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/50">
          <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
            {fetchErr}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section className="mt-8 md:mt-16">
      {!hideHeader && (
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-3xl font-display font-black text-slate-900 dark:text-white mb-2 md:mb-4 uppercase tracking-tight">
            {type === 'freshman'
              ? t('courses.explore.title')
              : t('courses.entrance.title')}
          </h3>
          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            {type === 'freshman'
              ? t('courses.explore.desc')
              : t('courses.entrance.desc')}
          </p>
        </div>
      )}

      {/* Local Search Bar */}
      {!hideSearch && (
        <div className="mb-8 md:mb-10 w-full">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-mango transition-colors" />
            <input
              type="text"
              placeholder={t('courses.search.placeholder')}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 py-3 md:py-4 text-xs md:text-base text-slate-900 dark:text-white focus:outline-none focus:border-mango transition-colors shadow-sm font-black uppercase tracking-widest"
            />
          </div>
        </div>
      )}

      {type === 'entrance' ? (
        <div className="space-y-10 md:space-y-20">
          {/* Natural Science */}
          {(subCategoryFilter === 'all' || subCategoryFilter === 'natural') && (
            <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl md:rounded-[48px] p-5 md:p-12 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="w-9 h-9 md:w-14 md:h-14 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Atom className="w-5 h-5 md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="text-lg md:text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                    {t('courses.natural')}
                  </h4>
                  <div className="h-1 w-10 md:h-1.5 md:w-24 bg-blue-600 rounded-full mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {naturalScienceCourses.map(course => (
                  <ApiCourseCard
                    key={course.id}
                    course={course}
                    onNavigate={() => navigate(`/courses/${course.id}`)}
                    onToggle={() => toggleCourse(String(course.id))}
                    isSelected={selectedCourses.includes(String(course.id))}
                    isAtLimit={isAtLimit}
                    accentColor="blue"
                    suffix={t('courses.natural')}
                    moreInfoText={t('services.more')}
                  />
                ))}
              </div>
              {naturalScienceCourses.length === 0 && (
                <EmptyState query={searchQuery} color="blue" />
              )}
            </div>
          )}

          {/* Social Science */}
          {(subCategoryFilter === 'all' || subCategoryFilter === 'social') && (
            <div className="bg-mango/5 dark:bg-mango/10 rounded-2xl md:rounded-[48px] p-5 md:p-12 border border-mango/20 dark:border-mango/10">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="w-9 h-9 md:w-14 md:h-14 bg-mango rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mango/20">
                  <Globe2 className="w-5 h-5 md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="text-lg md:text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                    {t('courses.social')}
                  </h4>
                  <div className="h-1 w-10 md:h-1.5 md:w-24 bg-mango rounded-full mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {socialScienceCourses.map(course => (
                  <ApiCourseCard
                    key={course.id}
                    course={course}
                    onNavigate={() => navigate(`/courses/${course.id}`)}
                    onToggle={() => toggleCourse(String(course.id))}
                    isSelected={selectedCourses.includes(String(course.id))}
                    isAtLimit={isAtLimit}
                    accentColor="mango"
                    suffix={t('courses.social')}
                    moreInfoText={t('services.more')}
                  />
                ))}
              </div>
              {socialScienceCourses.length === 0 && (
                <EmptyState query={searchQuery} color="mango" />
              )}
            </div>
          )}
        </div>
      ) : (
        /* Freshman grid */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredCourses.map(course => (
              <ApiCourseCard
                key={course.id}
                course={course}
                onNavigate={() => navigate(`/courses/${course.id}`)}
                onToggle={() => toggleCourse(String(course.id))}
                isSelected={selectedCourses.includes(String(course.id))}
                isAtLimit={isAtLimit}
                accentColor="mango"
                moreInfoText={t('services.more')}
              />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <EmptyState query={searchQuery} color="slate" />
          )}
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ApiCourseCard — renders one course from the backend
// ---------------------------------------------------------------------------
interface ApiCourseCardProps {
  course:       ApiCourse;
  onNavigate:   () => void;
  onToggle:     () => void;
  isSelected:   boolean;
  isAtLimit:    boolean;
  accentColor?: 'mango' | 'blue';
  suffix?:      string;
  moreInfoText?: string;
}

function ApiCourseCard({
  course, onNavigate, onToggle,
  isSelected, isAtLimit,
  accentColor = 'mango', suffix, moreInfoText,
}: ApiCourseCardProps) {
  const iconColor  = accentColor === 'blue' ? 'text-blue-600' : 'text-mango';
  const badgeColor = accentColor === 'blue'
    ? 'text-blue-600 bg-blue-600/10'
    : 'text-mango bg-mango/10';

  const placeholder = '/images/Courses-Profile/Communicative English Skills I.png';
  const imgSrc      = course.image || placeholder;

  return (
    <motion.div
      layout
      className={`group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[28px] overflow-hidden transition-all flex flex-col shadow-sm hover:shadow-xl ${
        accentColor === 'blue'
          ? 'hover:border-blue-400/50'
          : 'hover:border-mango/50'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imgSrc}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <div className="text-[8px] md:text-[10px] text-slate-500 mb-1.5 font-mono font-black uppercase tracking-widest">
            {course.slug}
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight min-h-[2.4rem] text-xs md:text-sm mb-3 uppercase tracking-tight">
            {course.title} {suffix ? `(${suffix})` : ''}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <div className={`${badgeColor} text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest`}>
              {course.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 gap-y-1.5 md:gap-y-2 mb-4 px-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400">
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className={`w-2.5 h-2.5 md:w-3 md:h-3 ${iconColor}`} />
                <span>{course.chapters ?? '—'} Chapters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-2.5 h-2.5 md:w-3 md:h-3 ${iconColor}`} />
                <span>{course.lesson_count} Lessons</span>
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-1.5">
                <Video className={`w-2.5 h-2.5 md:w-3 md:h-3 ${iconColor}`} />
                <span>{course.videos ?? course.lesson_count} Videos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className={`w-2.5 h-2.5 md:w-3 md:h-3 ${iconColor}`} />
                <span>PDF Notes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 mb-2 px-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 fill-current ${i < 4 ? iconColor : 'text-slate-300'}`} />
            ))}
            <span className="text-[8px] md:text-[10px] text-slate-400 ml-1 font-bold">4.0</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto space-y-2">
          {/* Cart toggle */}
          <button
            onClick={onToggle}
            disabled={!isSelected && isAtLimit}
            className={`w-full px-3 py-2 md:py-2.5 rounded-xl border-2 font-black uppercase tracking-widest text-[9px] md:text-xs transition-all flex items-center justify-center gap-1.5 ${
              isSelected
                ? 'bg-green-500 border-green-500 text-white hover:bg-red-500 hover:border-red-500'
                : isAtLimit
                  ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : accentColor === 'blue'
                    ? 'border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-600 hover:text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-mango/50 hover:text-mango'
            }`}
          >
            <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {isSelected ? 'Remove' : isAtLimit ? 'Cart Full' : 'Add to Cart'}
          </button>

          {/* Detail link */}
          <button
            onClick={onNavigate}
            className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[9px] md:text-xs text-slate-500 hover:text-mango hover:border-mango/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Info className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {moreInfoText || 'View Details'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ query, color }: { query: string; color: 'blue' | 'mango' | 'slate' }) {
  const icon = color === 'blue' ? 'text-blue-300 dark:text-blue-700'
    : color === 'mango' ? 'text-mango/40 dark:text-mango/30'
    : 'text-slate-300 dark:text-slate-700';
  return (
    <div className="py-8 md:py-12 mt-6 text-center text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
      <Search className={`w-8 h-8 md:w-10 md:h-10 ${icon} mx-auto mb-3`} />
      <p className="text-xs md:text-base font-bold uppercase tracking-widest">
        {query ? `No results for "${query}"` : 'No courses available yet.'}
      </p>
    </div>
  );
}
