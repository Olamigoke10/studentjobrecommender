import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROUTES } from '../utils/constants';
import talentPathLogo from '../../logo/logo.png';

const navLinks = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.JOBS, label: 'Browse Jobs' },
  { to: ROUTES.SAVED_JOBS, label: 'Saved' },
  { to: ROUTES.APPLICATIONS, label: 'Applications' },
  { to: ROUTES.RECOMMENDATIONS, label: 'For You' },
  { to: ROUTES.PROFILE, label: 'Profile' },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Close mobile menu on route change or resize to desktop
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme =
      savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('theme', nextTheme);
  };

  if (!isAuthenticated()) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/70 shadow-soft dark:bg-slate-950/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-10 min-w-0">
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary-700 hover:text-primary-800 transition-colors shrink-0 dark:text-primary-300 dark:hover:text-primary-200"
              >
                <img src={talentPathLogo} alt="Talent Path" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-cover shadow-sm" />
                <span className="truncate">Talent Path</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label }) => {
                  const isActive = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 border border-primary-100'
                          : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-slate-100'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-slate-200/70 dark:bg-slate-900/60 dark:border-slate-700/70">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate dark:text-slate-200">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-900/80"
              >
                <i className={`bx text-xl ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-900/80"
              >
                <i className={`bx text-2xl ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`} />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300 min-h-[44px] sm:min-h-0"
              >
                <i className="bx bx-log-out text-xl" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 pt-14 sm:pt-16 bg-white/90 backdrop-blur-md md:hidden dark:bg-slate-950/90"
          aria-hidden="false"
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1 overflow-auto">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/80 border border-slate-200/70 sm:hidden dark:bg-slate-900/80 dark:border-slate-700/80">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate dark:text-slate-200">
                {user?.name || user?.email || 'User'}
              </span>
            </div>
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 border border-primary-100'
                      : 'text-slate-700 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-900/80'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
