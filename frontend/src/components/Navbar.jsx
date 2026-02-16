import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROUTES } from '../utils/constants';

const navLinks = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.JOBS, label: 'Browse Jobs' },
  { to: ROUTES.SAVED_JOBS, label: 'Saved' },
  { to: ROUTES.RECOMMENDATIONS, label: 'For You' },
  { to: ROUTES.PROFILE, label: 'Profile' },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (!isAuthenticated()) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-10">
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 font-extrabold">
                S
              </span>
              StudentJobRec
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[140px] truncate">
                {user?.name || user?.email || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-200 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
