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
  primary: 'bg-primary-100 text-primary-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
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
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'Student'}
        </h1>
        <p className="mt-1 sm:mt-2 text-slate-600 text-sm sm:text-base">
          Here’s your personalized job dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {statCards.map((card) => {
          const value = card.valueKey ? stats[card.valueKey] : card.value;
          const content = (
            <div className="card card-hover p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                <i className={`bx ${card.icon} text-2xl`} />
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

      <div className="card p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 sm:mb-5">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 min-h-[48px] rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            >
              <i className={`bx ${icon} text-xl text-slate-400`} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
