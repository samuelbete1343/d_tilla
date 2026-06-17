import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Sun, Moon, Menu, X, ChevronDown, Globe, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: 'EN' | 'AM' | 'OM'; label: string; fullName: string }[] = [
    { code: 'EN', label: 'EN', fullName: 'English' },
    { code: 'AM', label: 'አማ', fullName: 'Amharic' },
    { code: 'OM', label: 'AO', fullName: 'Afan Oromo' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 shadow-sm`}
      >
        <div className="w-full px-4 sm:px-6 flex items-center justify-between relative z-50">
        <Link to="/" className="flex items-center gap-1.5 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mango rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-mango/20 group-hover:scale-110 transition-transform">
            <BookOpen className="text-white w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <span className="font-bold text-xl sm:text-2xl tracking-tight transition-colors text-slate-900 dark:text-white">Tilla</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {location.pathname !== '/' && (
            <Link 
              to="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
          {user && (
            <Link to="/dashboard" className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white">
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
          {location.pathname !== '/about' && (
            <Link to="/about" className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
          {location.pathname !== '/explore-courses' && (
            <Link to="/explore-courses" className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white">
              Courses
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
          {location.pathname !== '/packages' && (
            <Link to="/packages" className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white">
              Packages
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
          {location.pathname !== '/modules' && (
            <Link to="/modules" className="text-sm font-bold transition-all relative group py-2 text-slate-600 dark:text-slate-300 hover:text-mango dark:hover:text-white">
              Modules
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mango transition-all group-hover:w-full"></span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-mango transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Expandable Language Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-mango"
            >
              <Globe className="w-4 h-4" />
              {currentLangObj.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        language === l.code ? 'text-mango' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {l.fullName}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile or Login Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-3 p-1 pr-4 rounded-full border transition-all group bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-mango">
                <div className="w-8 h-8 rounded-full bg-mango flex items-center justify-center border border-white dark:border-slate-800 text-white text-xs font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden lg:block text-xs font-bold transition-colors text-slate-900 dark:text-white group-hover:text-mango">
                  {user.full_name ? user.full_name.split(' ')[0] : user.email}
                </span>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link 
                to="/login"
                className="text-sm font-bold transition-colors text-slate-600 dark:text-slate-300 hover:text-mango"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="px-5 py-2.5 bg-mango text-white text-sm font-bold rounded-xl hover:bg-mango/90 transition-all shadow-lg shadow-mango/20"
              >
                Join for Free
              </Link>
            </div>
          )}

          <button 
            className="md:hidden transition-colors text-slate-900 dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

    </header>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="md:hidden fixed top-0 right-0 bottom-0 w-[80vw] sm:w-[350px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-y-auto no-scrollbar shadow-2xl z-40 pt-20"
          >
            <div className="px-6 pb-8 space-y-6">
              {/* Mobile User Profile or Login */}
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-12 h-12 rounded-xl bg-mango flex items-center justify-center text-white text-lg font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{user.full_name || user.email}</div>
                    <div className="text-xs text-slate-500">View Dashboard</div>
                  </div>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl text-center"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 bg-mango text-white font-bold rounded-xl text-center"
                  >
                    Join Free
                  </Link>
                </div>
              )}

              {location.pathname !== '/' && (
                <Link 
                  to="/" 
                  className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" 
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Home
                </Link>
              )}
              {user && (
                <Link to="/dashboard" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              )}
              {location.pathname !== '/about' && (
                <Link to="/about" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              )}
              {location.pathname !== '/explore-courses' && (
                <Link to="/explore-courses" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
              )}
              {location.pathname !== '/packages' && (
                <Link to="/packages" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Packages</Link>
              )}
              {location.pathname !== '/modules' && (
                <Link to="/modules" className="block text-lg font-bold text-slate-900 dark:text-white hover:text-mango transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Modules</Link>
              )}
              
              {/* Mobile Settings Group */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold transition-all"
                >
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5 text-mango" />
                    <span>Settings</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileSettingsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMobileSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 mt-2 space-y-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {/* Appearance settings */}
                        <div className="px-3 pt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Appearance</p>
                          <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between py-2 text-slate-900 dark:text-white font-bold"
                          >
                            <div className="flex items-center gap-2">
                              {theme === 'light' ? <Moon className="w-4 h-4 text-mango" /> : <Sun className="w-4 h-4 text-mango" />}
                              <span className="text-sm">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                            </div>
                            <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
                              <motion.div 
                                animate={{ x: theme === 'light' ? 0 : 20 }}
                                className="transition-all duration-300 absolute top-1 left-1 w-3 h-3 rounded-full bg-mango" 
                              />
                            </div>
                          </button>
                        </div>

                        {/* Language settings */}
                        <div className="px-3 pb-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Language</p>
                          <div className="grid grid-cols-1 gap-2">
                            {languages.map((l) => (
                              <button
                                key={l.code}
                                onClick={() => {
                                  setLanguage(l.code);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-bold rounded-xl transition-all flex items-center justify-between ${
                                  language === l.code ? 'bg-mango text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {l.fullName}
                                {language === l.code && <Globe className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
