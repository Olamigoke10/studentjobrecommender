import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROUTES } from '../utils/constants';

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

  if (!isAuthenticated()) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-10 min-w-0">
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
              >
                <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 font-extrabold text-sm sm:text-base">
                  S
                </span>
                <span className="truncate">StudentJobRec</span>
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
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
                <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <i className={`bx text-2xl ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`} />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200 min-h-[44px] sm:min-h-0"
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
          className="fixed inset-0 z-40 pt-14 sm:pt-16 bg-white/95 backdrop-blur-sm md:hidden"
          aria-hidden="false"
        >
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1 overflow-auto">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-50 sm:hidden">
              <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold shadow-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">
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
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-700 hover:bg-slate-100'
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
