import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI } from '../api/recommendations.api';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import { ROUTES } from '../utils/constants';

const Recommendations = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [dismissing, setDismissing] = useState({});
  const [applicationsMap, setApplicationsMap] = useState({});

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    jobsAPI.getApplications().then((res) => {
      const list = res.data || [];
      const map = {};
      list.forEach((a) => { map[a.job?.id] = { id: a.id, status: a.status }; });
      setApplicationsMap(map);
    }).catch(() => {});
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recommendationsAPI.getRecommendations();
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      if (err.response?.status === 404) {
        setError('Complete your profile to get personalized recommendations.');
      } else {
        setError('Failed to load recommendations. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (saving[jobId]) return;
    setSaving((prev) => ({ ...prev, [jobId]: true }));
    try {
      await jobsAPI.saveJob(jobId);
      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, isSaved: true } : job)));
    } catch (err) {
      console.error('Failed to save job:', err);
      alert('Failed to save job. Please try again.');
    } finally {
      setSaving((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleNotInterested = async (jobId) => {
    if (dismissing[jobId]) return;
    setDismissing((prev) => ({ ...prev, [jobId]: true }));
    try {
      await recommendationsAPI.submitNotInterested(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to record feedback:', err);
      alert('Could not update recommendations. Please try again.');
    } finally {
      setDismissing((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) return <Loader />;

  if (error) {
    const isProfileError = error.includes('profile');
    return (
      <div className="py-4 sm:py-6 animate-fade-in">
        <BackButton className="mb-4" />
        <div className={`card p-4 sm:p-6 ${isProfileError ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'}`}>
          <p className={isProfileError ? 'text-amber-800 dark:text-amber-300' : 'text-red-800 dark:text-red-300'}>{error}</p>
          {isProfileError ? (
            <Link to={ROUTES.PROFILE} className="btn-primary mt-4 inline-flex">
              Complete profile
            </Link>
          ) : (
            <button onClick={loadRecommendations} className="btn-secondary mt-4">
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">For You</h1>
          <p className="mt-1 sm:mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Matched to your course, skills, and preferences — plus roles similar to jobs you&apos;ve saved or applied to. Use{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">Not interested</span> to tune future results.
          </p>
        </div>
        <span className="inline-flex w-fit px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {jobs.length} recommendation{jobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          type="recommendations"
          title="No recommendations yet"
          description="Complete your profile with course, skills, and preferences to get personalized job recommendations."
          actionLabel="Complete profile"
          actionHref={ROUTES.PROFILE}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSaveJob}
              onNotInterested={handleNotInterested}
              dismissing={dismissing[job.id]}
              onMarkApplied={async (jobId) => {
                if (saving[jobId]) return;
                setSaving((prev) => ({ ...prev, [jobId]: true }));
                try {
                  const res = await jobsAPI.createApplication(jobId, { status: 'applied' });
                  setApplicationsMap((prev) => ({ ...prev, [jobId]: { id: res.data.id, status: 'applied' } }));
                } catch (_) { alert('Failed to mark as applied.'); }
                finally { setSaving((prev) => ({ ...prev, [jobId]: false })); }
              }}
              saving={saving[job.id]}
              isSaved={job.isSaved}
              applicationStatus={applicationsMap[job.id]?.status}
              showMatchScore
              recommendedReason={job.recommended_reason}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
