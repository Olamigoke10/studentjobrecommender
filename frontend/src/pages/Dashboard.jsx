import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { jobsAPI } from '../api/jobs.api';
import { recommendationsAPI } from '../api/recommendations.api';
import { ROUTES } from '../utils/constants';
import Loader from '../components/Loader';

const statCards = [
  {
    key: 'applied',
    label: 'Jobs Applied',
    value: 0,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
    color: 'primary',
    href: null,
  },
  {
    key: 'saved',
    label: 'Saved Jobs',
    valueKey: 'savedJobs',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    ),
    color: 'emerald',
    href: ROUTES.SAVED_JOBS,
  },
  {
    key: 'recommendations',
    label: 'For You',
    valueKey: 'recommendations',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    ),
    color: 'violet',
    href: ROUTES.RECOMMENDATIONS,
  },
];

const quickActions = [
  { to: ROUTES.JOBS, label: 'Browse Jobs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: ROUTES.SAVED_JOBS, label: 'Saved Jobs', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { to: ROUTES.RECOMMENDATIONS, label: 'For You', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    savedJobs: 0,
    recommendations: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [savedResponse, recommendationsResponse] = await Promise.allSettled([
        jobsAPI.getSavedJobs(),
        recommendationsAPI.getRecommendations(),
      ]);
      setStats({
        savedJobs: savedResponse.status === 'fulfilled' ? savedResponse.value.data.length : 0,
        recommendations: recommendationsResponse.status === 'fulfilled' ? recommendationsResponse.value.data.length : 0,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) return <Loader />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}
        </h1>
        <p className="mt-2 text-slate-600">
          Here’s your personalized job dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((card) => {
          const value = card.valueKey ? stats[card.valueKey] : card.value;
          const content = (
            <div className="card card-hover p-6 flex items-center gap-5">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {card.icon}
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
              </div>
            </div>
          );
          return card.href ? (
            <Link key={card.key} to={card.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={card.key}>{content}</div>
          );
        })}
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
