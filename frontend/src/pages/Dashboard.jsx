import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { jobsAPI } from '../api/jobs.api';
import { recommendationsAPI } from '../api/recommendations.api';
import { ROUTES } from '../utils/constants';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';

const statCards = [
  { key: 'applied', label: 'Jobs Applied', valueKey: 'applications', icon: 'bx-briefcase', color: 'primary', href: ROUTES.APPLICATIONS },
  { key: 'saved', label: 'Saved Jobs', valueKey: 'savedJobs', icon: 'bx-bookmark', color: 'emerald', href: ROUTES.SAVED_JOBS },
  { key: 'recommendations', label: 'For You', valueKey: 'recommendations', icon: 'bx-star', color: 'violet', href: ROUTES.RECOMMENDATIONS },
];

const quickActions = [
  { to: ROUTES.JOBS, label: 'Browse Jobs', icon: 'bx-search-alt' },
  { to: ROUTES.SAVED_JOBS, label: 'Saved Jobs', icon: 'bx-bookmark' },
  { to: ROUTES.APPLICATIONS, label: 'My Applications', icon: 'bx-clipboard' },
  { to: ROUTES.RECOMMENDATIONS, label: 'For You', icon: 'bx-star' },
  { to: ROUTES.CV, label: 'My CV', icon: 'bx-file-blank' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'bx-user' },
];

const colorClasses = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    savedJobs: 0,
    applications: 0,
    recommendations: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [savedResponse, applicationsResponse, recommendationsResponse] = await Promise.allSettled([
        jobsAPI.getSavedJobs(),
        jobsAPI.getApplications(),
        recommendationsAPI.getRecommendations(),
      ]);
      setStats({
        savedJobs: savedResponse.status === 'fulfilled' ? savedResponse.value.data.length : 0,
        applications: applicationsResponse.status === 'fulfilled' ? (applicationsResponse.value.data?.length ?? 0) : 0,
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
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 dark:text-primary-300">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Track your progress and jump into the next best action.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={ROUTES.JOBS} className="btn-primary">
              <i className="bx bx-search-alt text-lg mr-1.5" />
              Browse jobs
            </Link>
            <Link to={ROUTES.RECOMMENDATIONS} className="btn-secondary">
              <i className="bx bx-star text-lg mr-1.5" />
              See recommendations
            </Link>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Applied</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.applications}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.min((stats.applications / 10) * 100, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Saved</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.savedJobs}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((stats.savedJobs / 10) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {statCards.map((card) => {
          const value = card.valueKey ? stats[card.valueKey] : card.value;
          const content = (
            <div className="card card-hover p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                <i className={`bx ${card.icon} text-2xl`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
              </div>
              <i className="bx bx-chevron-right text-slate-300 dark:text-slate-600 text-xl" />
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

      <div className="card p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick actions</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Jump to any section</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 font-medium hover:border-primary-200 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            >
              <span className="inline-flex items-center gap-3">
                <i className={`bx ${icon} text-xl text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-300`} />
                {label}
              </span>
              <i className="bx bx-right-arrow-alt text-xl text-slate-300 group-hover:text-primary-600 dark:text-slate-600 dark:group-hover:text-primary-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
