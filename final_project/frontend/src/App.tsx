import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

import Home                  from './pages/Home';
import Dashboard             from './pages/Dashboard';
import Checkout              from './pages/Checkout';
import CourseDetail          from './pages/CourseDetail';
import CourseLearning        from './pages/CourseLearning';
import ServiceDetail         from './pages/ServiceDetail';
import AboutPage             from './pages/AboutPage';
import Login                 from './pages/Login';
import Signup                from './pages/Signup';
import ForgotPasswordPage    from './pages/ForgotPasswordPage';
import ExploreCoursesUnified from './pages/ExploreCoursesUnified';
import PricingPage           from './pages/PricingPage';
import Modules               from './pages/Modules';
import Packages              from './pages/Packages';
import ExamSession           from './pages/ExamSession';
import ExamSetup             from './pages/ExamSetup';
import FlaggedQuestions      from './pages/FlaggedQuestions';
import QuizPage              from './pages/QuizPage';
import NotesPage             from './pages/NotesPage';
import PrivacyPage           from './pages/PrivacyPage';
import TermsPage             from './pages/TermsPage';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className={`${theme} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ThemeWrapper>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* ── Public ──────────────────────────────── */}
                  <Route path="/"                element={<Home />} />
                  <Route path="/login"           element={<Login />} />
                  <Route path="/signup"          element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/about"           element={<AboutPage />} />
                  <Route path="/pricing"         element={<PricingPage />} />
                  <Route path="/privacy"         element={<PrivacyPage />} />
                  <Route path="/terms"           element={<TermsPage />} />

                  {/* ── Course browsing ──────────────────────── */}
                  <Route path="/explore-courses"     element={<ExploreCoursesUnified />} />
                  <Route path="/courses/:courseId"   element={<CourseDetail />} />
                  <Route path="/services/:serviceId" element={<ServiceDetail />} />

                  {/* Redirect old routes */}
                  <Route path="/courses"          element={<Navigate to="/explore-courses" replace />} />
                  <Route path="/entrance-courses" element={<Navigate to="/explore-courses" replace />} />

                  {/* ── Student portal (protected) ───────────── */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/modules" element={
                    <ProtectedRoute><Modules /></ProtectedRoute>
                  } />
                  <Route path="/packages" element={
                    <ProtectedRoute><Packages /></ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute><Checkout /></ProtectedRoute>
                  } />
                  <Route path="/learn/:courseId" element={
                    <ProtectedRoute><CourseLearning /></ProtectedRoute>
                  } />

                  {/* ── Quiz & Notes (protected) ─────────────── */}
                  <Route path="/quiz/:lessonId" element={
                    <ProtectedRoute><QuizPage /></ProtectedRoute>
                  } />
                  <Route path="/notes/:courseId" element={
                    <ProtectedRoute><NotesPage /></ProtectedRoute>
                  } />

                  {/* ── Exam (protected) ─────────────────────── */}
                  <Route path="/exam/:type/:courseId" element={
                    <ProtectedRoute><ExamSession /></ProtectedRoute>
                  } />
                  <Route path="/exam/:type/:courseId/:chapterId" element={
                    <ProtectedRoute><ExamSession /></ProtectedRoute>
                  } />
                  <Route path="/exam/:type/:courseId/:chapterId/:lessonId" element={
                    <ProtectedRoute><ExamSession /></ProtectedRoute>
                  } />
                  <Route path="/exam-setup/:type/:courseId" element={
                    <ProtectedRoute><ExamSetup /></ProtectedRoute>
                  } />
                  <Route path="/flagged" element={
                    <ProtectedRoute><FlaggedQuestions /></ProtectedRoute>
                  } />

                  {/* ── Removed routes ───────────────────────── */}
                  <Route path="/predictor" element={<Navigate to="/" replace />} />

                  {/* ── Catch-all ────────────────────────────── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
