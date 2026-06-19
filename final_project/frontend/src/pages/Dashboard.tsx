import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Menu,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  FileText,
  ClipboardList,
  Library,
  Lock,
  Search,
  Heart,
  Sun,
  Moon,
  PlayCircle,
  Flag,
  Check,
  X,
  AlertCircle,
  XCircle,
  Send,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch, unwrap } from '../lib/api';
import AuthModal from '../components/AuthModal';
import BulkCourseImport from '../components/BulkCourseImport';

// ---------------------------------------------------------------------------
// Types — aligned to new backend API shapes
// ---------------------------------------------------------------------------

interface UnlockedCourse {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    category: string;
    image: string | null;
  };
  approved_at: string;
}

type PaymentStatus = 'pending' | 'approved' | 'rejected';

interface PaymentStatusSummary {
  has_pending_request:   boolean;
  has_approved_request:  boolean;
  has_rejected_request:  boolean;
  unlocked_course_count: number;
  max_courses:           number;
  latest_request: {
    id: number;
    status: PaymentStatus;
    status_display: string;
    amount: string;
    selected_courses: { id: number; title: string; slug: string }[];
    admin_note: string;
    created_at: string;
    reviewed_at: string | null;
  } | null;
}

interface CourseProgress {
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

interface QuizAttempt {
  id: number;
  quiz_title: string;
  score_percentage: number;
  passed: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Small reusable: Payment status banner
// ---------------------------------------------------------------------------

function PaymentStatusBanner({ summary, onSelectCourses }: {
  summary: PaymentStatusSummary | null;
  onSelectCourses: () => void;
}) {
  if (!summary) return null;
  const req = summary.latest_request;

  if (!req) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">No course access yet</p>
          <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
            Select up to 7 courses and submit a payment request to get started.
          </p>
        </div>
        <button
          onClick={onSelectCourses}
          className="shrink-0 px-4 py-2.5 bg-mango text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-mango/90 transition-all"
        >
          Select Courses
        </button>
      </div>
    );
  }

  if (req.status === 'pending') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <p className="font-bold text-blue-700 dark:text-blue-300 text-sm">Payment Pending Review</p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5 leading-relaxed">
              Your payment request is being verified. Make sure you've sent your receipt to{' '}
              <a
                href="https://t.me/Tilla_Register"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline underline-offset-2 inline-flex items-center gap-1"
              >
                @Tilla_Register <ExternalLink className="w-3 h-3" />
              </a>{' '}
              on Telegram. Courses unlock within 5 hours.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {req.selected_courses.slice(0, 5).map(c => (
                <span key={c.id} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold">
                  {c.title}
                </span>
              ))}
              {req.selected_courses.length > 5 && (
                <span className="text-[10px] text-blue-500 font-bold self-center">
                  +{req.selected_courses.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (req.status === 'rejected') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <p className="font-bold text-red-700 dark:text-red-300 text-sm">Payment Request Rejected</p>
            {req.admin_note && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1 leading-relaxed">
                Reason: {req.admin_note}
              </p>
            )}
            <p className="text-red-500 text-xs mt-2">
              Please contact us on Telegram or submit a new request.
            </p>
            <button
              onClick={onSelectCourses}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
        <CheckCircle2 className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-green-700 dark:text-green-300 text-sm">
          {summary.unlocked_course_count} / {summary.max_courses} Courses Unlocked
        </p>
        <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">
          Your payment was verified. All selected courses are now active.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, isReady } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab]     = useState(searchParams.get('tab') || 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- Data state ---
  const [paymentStatus, setPaymentStatus]   = useState<PaymentStatusSummary | null>(null);
  const [unlockedCourses, setUnlockedCourses] = useState<UnlockedCourse[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<number, CourseProgress>>({});
  const [quizAttempts, setQuizAttempts]     = useState<QuizAttempt[]>([]);
  const [dataLoading, setDataLoading]       = useState(true);
  const [dataError, setDataError]           = useState<string | null>(null);

  // --- UI state ---
  const [courseSearchQuery, setCourseSearchQuery]   = useState('');
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('tilla_fav_courses') || '[]'); }
    catch { return []; }
  });
  const [selectedResourceCourse, setSelectedResourceCourse] = useState<number | null>(null);
  const [selectedExamCourse, setSelectedExamCourse]         = useState<number | null>(null);
  const [expandedResourceCategory, setExpandedResourceCategory] = useState<string | null>(null);
  const [expandedExamCategory, setExpandedExamCategory]         = useState<string | null>(null);
  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '', phone: '', gender: '', program: '',
  });

  useEffect(() => {
    if (authUser) {
      setProfileForm({
        full_name: authUser.full_name || '',
        phone:     authUser.phone     || '',
        gender:    authUser.gender    || '',
        program:   authUser.program   || '',
      });
    }
  }, [authUser?.id]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('tilla_fav_courses', JSON.stringify(favorites));
  }, [favorites]);

  // --- Load dashboard data ---
  // FIX: All three API calls now unwrap the CustomJSONRenderer envelope.
  // Previously: setPaymentStatus(await statusRes.json())
  //   → stored { success, message, data: {...}, error: null }
  //   → paymentStatus.has_pending_request was always undefined
  //   → dashboard showed "No course access yet" even when access was granted
  //
  // Now: setPaymentStatus(unwrap(await statusRes.json()))
  //   → stores the actual { has_pending_request, ... } object
  // Re-fetch whenever the user lands on the dashboard after a course submission.
  // Checkout.tsx redirects to /dashboard?submitted=1 after a successful POST.
  // Without this, the dashboard data is stale (authUser hasn't changed).
  const submittedParam = searchParams.get('submitted');

  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    (async () => {
      try {
        const [statusRes, accessRes, attemptsRes] = await Promise.all([
          apiFetch('/payments/status/'),
          apiFetch('/payments/my-access/'),
          apiFetch('/quizzes/my-attempts/'),
        ]);
        if (cancelled) return;

        // FIX: unwrap envelope before storing
        if (statusRes.ok) {
          const body = await statusRes.json();
          setPaymentStatus(unwrap<PaymentStatusSummary>(body));
        }

        let accesses: UnlockedCourse[] = [];
        if (accessRes.ok) {
          const body = await accessRes.json();
          accesses = unwrap<UnlockedCourse[]>(body) ?? [];
          if (Array.isArray(accesses)) setUnlockedCourses(accesses);
        }

        if (attemptsRes.ok) {
          const body = await attemptsRes.json();
          const attempts = unwrap<QuizAttempt[]>(body);
          setQuizAttempts(Array.isArray(attempts) ? attempts : []);
        }

        // Fetch per-course progress for all unlocked courses in parallel
        if (accesses.length > 0) {
          const progressEntries = await Promise.all(
            accesses.map(async (access) => {
              try {
                const res = await apiFetch(`/courses/${access.course.id}/progress/`);
                if (!res.ok) return null;
                const body = await res.json();
                const p = unwrap<CourseProgress>(body);
                return [access.course.id, p] as [number, CourseProgress];
              } catch { return null; }
            })
          );
          if (!cancelled) {
            const progressMap: Record<number, CourseProgress> = {};
            for (const entry of progressEntries) {
              if (entry) progressMap[entry[0]] = entry[1];
            }
            setCourseProgress(progressMap);
          }
        }
      } catch {
        if (!cancelled) setDataError('Could not load dashboard data. Check your connection.');
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authUser, submittedParam]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSave = async () => {
    if (!authUser) return;
    setIsSaving(true); setSaveError(null);
    try {
      const res = await apiFetch('/auth/profile/', { method: 'PATCH', body: JSON.stringify(profileForm) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // FIX: DRF errors are in envelope.error, detail messages in envelope.error.detail
        const errDetail =
          (typeof err.error === 'object' && err.error?.detail) ||
          (typeof err.error === 'string' && err.error) ||
          err.message ||
          'Failed to save profile.';
        setSaveError(errDetail);
        return;
      }
      const body = await res.json();
      // FIX: unwrap envelope before merging — previously stored the entire
      // { success, message, data, error } object into auth state
      const updated = unwrap(body);
      updateUser({ ...authUser, ...(updated as object) });
    } catch { setSaveError('Network error.'); }
    finally { setIsSaving(false); }
  };

  const toggleFav = (id: number) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const accessLabel = paymentStatus?.has_approved_request
    ? `${paymentStatus.unlocked_course_count} courses unlocked`
    : paymentStatus?.has_pending_request
      ? 'Pending Review'
      : 'No Access Yet';

  const renderSidebarItem = (id: string, Icon: any, label: string) => (
    <button
      key={id}
      onClick={() => { setActiveTab(id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
      className={`group flex items-center w-full px-4 py-2.5 rounded-lg transition-all outline-none ${
        activeTab === id
          ? 'bg-mango/10 text-mango font-medium'
          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon className={`flex-shrink-0 w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-mango' : 'text-slate-500 dark:text-slate-400'}`} />
      {isSidebarOpen && (
        <motion.span
          key={`label-${id}`}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}
          className="ml-3 text-[14.28px] whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </button>
  );

  if (!isReady) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-mango/30 border-t-mango rounded-full animate-spin" />
    </div>
  );

  if (!authUser) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-mango/10 rounded-3xl flex items-center justify-center text-mango mb-8">
        <Lock className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">Dashboard Locked</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-10 text-lg">
        Please login first to access your courses and track your progress.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button onClick={() => setIsAuthModalOpen(true)} className="flex-1 px-8 py-4 bg-mango text-white font-bold rounded-2xl shadow-xl shadow-mango/20 hover:scale-105 transition-all">
          Login Now
        </button>
        <Link to="/" className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
          Back Home
        </Link>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );

  const displayName = authUser.full_name || authUser.email;
  const userGender  = authUser.gender || 'male';
  const userProgram = authUser.program || 'freshman-portal';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors">
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : (window.innerWidth < 1024 ? 0 : 80), x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -240 : 0) }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className={`fixed lg:relative flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 h-full ${!isSidebarOpen ? 'items-center overflow-hidden' : ''}`}
      >
        <div className="flex items-center h-16 px-6 mt-4 mb-2">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-mango flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}
                className="font-bold text-xl whitespace-nowrap tracking-tighter text-slate-900 dark:text-white">
                Tilla
              </motion.span>
            )}
          </Link>
        </div>

        <div className="flex-1 px-4 py-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
          <nav className="space-y-1">
            {renderSidebarItem('overview',  LayoutDashboard, 'Overview')}
            {renderSidebarItem('courses',   BookOpen,        'My Courses')}
            {renderSidebarItem('resources', Library,         'Resource Center')}
            {renderSidebarItem('exams',     ClipboardList,   'Exam Bank')}
            {renderSidebarItem('profile',   User,            'My Profile')}
            <div className="pt-4 pb-2"><div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" /></div>
            {renderSidebarItem('settings',  Settings,        'Settings')}
            {authUser?.is_admin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
                  {isSidebarOpen && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 px-4 mt-3 mb-1">
                      Admin
                    </p>
                  )}
                </div>
                {renderSidebarItem('admin-import', Upload, 'Import Courses')}
              </>
            )}
          </nav>

          {isSidebarOpen && (
            <motion.div
              className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-mango/80 to-orange-600 p-4 border border-mango/30 group mb-6 shrink-0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen size={14} className="text-white/80" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Your Access</span>
                </div>
                {paymentStatus?.has_approved_request ? (
                  <>
                    <h4 className="text-white font-bold text-sm mb-1">{paymentStatus.unlocked_course_count} courses active</h4>
                    <p className="text-white/70 text-[11px]">Keep learning and stay on track.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-white font-bold text-sm mb-1">Get Course Access</h4>
                    <p className="text-white/70 text-[11px] mb-3">Select 7 courses for 100 ETB flat.</p>
                    <button onClick={() => navigate('/explore-courses')}
                      className="w-full bg-white text-mango font-black uppercase tracking-widest text-[10px] py-1.5 rounded-lg hover:bg-white/90 transition-colors shadow-sm"
                    >
                      Select Courses
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="relative p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout}
            className={`w-full flex items-center justify-between rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group ${isSidebarOpen ? 'p-2' : 'p-2 justify-center text-slate-400 hover:text-red-500'}`}
            title="Sign Out"
          >
            <div className="flex items-center gap-3 text-left overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 group-hover:border-red-500 flex-shrink-0 shadow-sm overflow-hidden flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-400 transition-colors group-hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate leading-none mb-1 text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">Sign Out</p>
                  <p className="text-[12px] text-slate-500 truncate capitalize">{userProgram.replace('-', ' ')}</p>
                </div>
              )}
            </div>
          </button>
        </div>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all z-50 focus:outline-none hidden lg:flex">
          {isSidebarOpen ? <X size={10} /> : <Menu size={10} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-grow min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors w-0">

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 leading-none mb-0.5">{displayName}</div>
                <div className="text-[9px] font-black text-mango uppercase tracking-widest leading-none">{accessLabel}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm">
                <img src={userGender === 'female' ? 'https://avatar.iran.liara.run/public/girl' : 'https://avatar.iran.liara.run/public/boy'} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 no-scrollbar">
          {dataError && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />{dataError}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ─────────────── OVERVIEW ─── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6 md:space-y-8 pb-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Hello, {displayName.split(' ')[0] || 'Student'}! 👋
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">Ready to crush your goals today?</p>
                  </div>
                </div>

                <PaymentStatusBanner
                  summary={paymentStatus}
                  onSelectCourses={() => navigate('/explore-courses')}
                />

                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">
                      My Unlocked Courses
                    </h3>
                    {paymentStatus && (
                      <span className="text-xs font-black text-mango bg-mango/10 px-2 py-1 rounded-full border border-mango/20">
                        {paymentStatus.unlocked_course_count} / {paymentStatus.max_courses}
                      </span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="py-8 flex justify-center"><div className="w-8 h-8 border-4 border-mango/30 border-t-mango rounded-full animate-spin" /></div>
                  ) : unlockedCourses.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-xs font-medium mb-4">No courses unlocked yet.</p>
                      <button onClick={() => navigate('/explore-courses')} className="px-4 py-2 bg-mango text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                        Select Courses
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unlockedCourses.map(access => {
                        const progress = courseProgress[access.course.id];
                        return (
                          <button key={access.id} onClick={() => navigate(`/learn/${access.course.id}`)}
                            className="text-left p-4 md:p-5 rounded-[20px] bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:border-mango/20">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[70%]">{access.course.title}</h4>
                              <span className="text-base font-black text-mango">{progress?.progress_percentage ?? 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-mango transition-all duration-1000" style={{ width: `${progress?.progress_percentage ?? 0}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">
                              {progress?.completed_lessons ?? 0} / {progress?.total_lessons ?? '—'} lessons
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-5">Recent Quiz Results</h3>
                  {dataLoading ? (
                    <div className="py-8 flex justify-center"><div className="w-8 h-8 border-4 border-mango/30 border-t-mango rounded-full animate-spin" /></div>
                  ) : quizAttempts.length === 0 ? (
                    <div className="py-10 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400 text-xs font-medium">No quiz attempts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizAttempts.slice(0, 5).map(attempt => (
                        <div key={attempt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{attempt.quiz_title}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(attempt.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-black tabular-nums ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>{Math.round(attempt.score_percentage)}%</span>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{attempt.passed ? 'Passed' : 'Failed'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─────────────── COURSES ─── */}
            {activeTab === 'courses' && (
              <motion.div key="courses" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6 pb-32">
                <div className="h-2 lg:hidden" />
                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-5">My Unlocked Courses</h3>
                  <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search courses…" value={courseSearchQuery}
                      onChange={e => setCourseSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-mango/30 transition-all" />
                  </div>

                  {dataLoading ? (
                    <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-mango/30 border-t-mango rounded-full animate-spin" /></div>
                  ) : (() => {
                    const filtered = unlockedCourses.filter(a =>
                      a.course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) return (
                      <div className="py-16 text-center bg-slate-50 dark:bg-slate-950 rounded-[20px] border border-dashed border-slate-200 dark:border-slate-800">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 font-medium text-xs">
                          {unlockedCourses.length === 0 ? 'No unlocked courses yet.' : 'No courses match your search.'}
                        </p>
                        {unlockedCourses.length === 0 && (
                          <button onClick={() => navigate('/explore-courses')} className="mt-4 px-4 py-2 bg-mango text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                            Select Courses
                          </button>
                        )}
                      </div>
                    );
                    return (
                      <div className="grid grid-cols-1 gap-4">
                        {filtered.map(access => {
                          const progress = courseProgress[access.course.id];
                          return (
                            <div key={access.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-mango transition-colors">{access.course.title}</h3>
                                    <button onClick={() => toggleFav(access.course.id)} className="p-1.5 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                                      <Heart className={`w-4 h-4 transition-colors ${favorites.includes(access.course.id) ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
                                    </button>
                                  </div>
                                  <span className="px-2 py-0.5 bg-mango/10 text-mango rounded-md text-[9px] font-black uppercase tracking-widest">{access.course.category}</span>
                                </div>
                                <button onClick={() => navigate(`/learn/${access.course.id}`)}
                                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-mango transition-all shadow-sm">
                                  Continue Learning
                                </button>
                              </div>
                              <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                  <span className="text-slate-400">Progress</span>
                                  <span className="text-mango">{progress?.progress_percentage ?? 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress?.progress_percentage ?? 0}%` }} transition={{ duration: 1, ease: 'circOut' }} className="h-full bg-green-500 rounded-full" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* ─────────────── RESOURCES ─── */}
            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6 pb-32">
                <div className="h-2 lg:hidden" />
                {!selectedResourceCourse ? (
                  <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-5">My Courses Collection</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {dataLoading ? (
                        <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-mango/30 border-t-mango rounded-full animate-spin" /></div>
                      ) : unlockedCourses.length === 0 ? (
                        <div className="py-16 text-center bg-slate-50 dark:bg-slate-950 rounded-[20px] border border-dashed border-slate-200 dark:border-slate-800">
                          <Library className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                          <p className="text-slate-400 font-medium text-xs">No unlocked courses. Select courses to access resources.</p>
                        </div>
                      ) : unlockedCourses.map(access => (
                        <div key={access.id} onClick={() => setSelectedResourceCourse(access.course.id)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 rounded-[20px] hover:bg-white dark:hover:bg-slate-900 hover:border-mango/30 transition-all cursor-pointer flex items-center gap-6">
                          <div className="flex-grow min-w-0">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate">{access.course.title}</h4>
                            <p className="text-slate-500 text-xs mb-3">Access all modules, notes, and supplementary materials.</p>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-mango">
                              <span>Enter Repository</span><ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <button onClick={() => setSelectedResourceCourse(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-mango transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {unlockedCourses.find(a => a.course.id === selectedResourceCourse)?.course.title}
                    </h3>
                    {[
                      { id: 'short-notes', title: 'Short Notes', desc: 'Summary and key points by chapter.', icon: ClipboardList, color: 'text-green-500', bg: 'bg-green-50/50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-900/30' },
                      { id: 'additional-notes', title: 'Additional Notes', desc: 'Extended explanations.', icon: Library, color: 'text-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-purple-100 dark:border-purple-900/30' },
                      { id: 'suggested-materials', title: 'Suggested Materials', desc: 'Reference books and external links.', icon: FileText, color: 'text-mango', bg: 'bg-mango/5', border: 'border-mango/20' },
                    ].map(section => (
                      <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm">
                        <button onClick={() => setExpandedResourceCategory(expandedResourceCategory === section.id ? null : section.id)}
                          className="w-full p-5 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl border ${section.bg} ${section.border} flex items-center justify-center ${section.color} shadow-sm`}>
                              <section.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{section.title}</h4>
                              <p className="text-slate-500 text-[11px] mt-0.5">{section.desc}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedResourceCategory === section.id ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedResourceCategory === section.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 dark:border-slate-800">
                              <div className="p-6 text-center py-10 bg-slate-50 dark:bg-slate-950">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content coming soon</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─────────────── EXAMS ─── */}
            {activeTab === 'exams' && (
              <motion.div key="exams" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 pb-32">
                <div className="h-2 lg:hidden" />
                {!selectedExamCourse ? (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-5">Your Course Collections</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {dataLoading ? (
                          <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-mango/30 border-t-mango rounded-full animate-spin" /></div>
                        ) : unlockedCourses.length === 0 ? (
                          <div className="py-16 text-center bg-slate-50 dark:bg-slate-950 rounded-[20px] border border-dashed border-slate-200 dark:border-slate-800">
                            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                            <p className="text-slate-400 font-medium text-xs">No unlocked courses. Select courses to access exams.</p>
                          </div>
                        ) : unlockedCourses.map(access => (
                          <div key={access.id} onClick={() => setSelectedExamCourse(access.course.id)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 rounded-[20px] hover:bg-white dark:hover:bg-slate-900 hover:border-mango/30 transition-all cursor-pointer">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{access.course.title}</h4>
                            <p className="text-slate-500 text-xs mb-3">Access quizzes for this course.</p>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-mango">
                              <span>Enter Exam Bank</span><ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-5">Review Material</h3>
                      <Link to="/flagged"
                        className="flex items-center justify-between p-5 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[24px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 shadow-sm">
                            <Flag className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Flagged Questions</h4>
                            <p className="text-slate-500 text-[11px]">Review questions you've marked as difficult.</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-red-300 shrink-0" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <button onClick={() => { setSelectedExamCourse(null); setExpandedExamCategory(null); }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-mango transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to Collections
                    </button>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {unlockedCourses.find(a => a.course.id === selectedExamCourse)?.course.title} — Quiz Bank
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm text-slate-500 mb-4">Navigate to a lesson to take its quiz.</p>
                      <button onClick={() => navigate(`/learn/${selectedExamCourse}`)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-mango text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-mango/90 transition-all">
                        <PlayCircle className="w-4 h-4" /> Open Course Lessons
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─────────────── PROFILE ─── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl">
                <div className="h-2 lg:hidden" />
                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-8">My Profile</h3>
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[20px] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-950">
                      <img src={userGender === 'female' ? 'https://avatar.iran.liara.run/public/girl' : 'https://avatar.iran.liara.run/public/boy'} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">{displayName}</h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-mango/10 text-mango rounded-lg text-[9px] font-black uppercase tracking-widest">{accessLabel}</span>
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {userProgram === 'entrance-prep' ? 'Entrance Prep' : 'Freshman Portal'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-400 dark:text-slate-500 text-xs font-bold">{authUser.email}</div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-mango transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <input type="text" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-mango transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                      <select value={profileForm.gender} onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-mango transition-colors">
                        <option value="">— Select —</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Learning Track</label>
                      <select value={profileForm.program} onChange={e => setProfileForm(p => ({ ...p, program: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-mango transition-colors">
                        <option value="freshman-portal">Freshman Portal (University)</option>
                        <option value="entrance-prep">Entrance Prep (Grade 12)</option>
                      </select>
                    </div>
                  </div>
                  {saveError && <p className="mt-4 text-xs text-red-500 font-bold">{saveError}</p>}
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving}
                      className="px-8 py-3 bg-mango text-white font-bold rounded-xl hover:bg-mango/90 transition-all shadow-lg shadow-mango/20 disabled:opacity-50 flex items-center gap-2 text-sm">
                      {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─────────────── SETTINGS ─── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-32">
                <div className="h-2 lg:hidden" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm">
                    <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-6">Appearance</h3>
                    <div className="space-y-3">
                      {(['light', 'dark'] as const).map(mode => (
                        <button key={mode} onClick={toggleTheme}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${theme === mode ? 'border-mango bg-mango/5 text-mango' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                          <div className="flex items-center gap-3">
                            {mode === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="font-bold text-xs uppercase tracking-widest">{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          {theme === mode && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] shadow-sm opacity-60">
                    <h3 className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 mb-6">Notifications</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center py-10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available in next update</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

            {/* ─── ADMIN: BULK IMPORT ─── */}
            {activeTab === 'admin-import' && authUser?.is_admin && (
              <BulkCourseImport />
            )}

        </div>
      </main>
    </div>
  );
}
