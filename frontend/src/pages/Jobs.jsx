import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getJobs();
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await jobsAPI.refreshJobs();
      const newJobs = res.data?.jobs ?? [];
      setJobs(newJobs);
      if (newJobs.length === 0) {
        const hint = res.data?.hint || 'No jobs returned. Check that Adzuna keys (ADZUNA_APP_ID, ADZUNA_APP_KEY) are set in Render and your app is for UK (gb).';
        setRefreshError(hint);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.hint || 'Failed to load jobs. Check back later.';
      setRefreshError(msg);
    } finally {
      setRefreshing(false);
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

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="py-6 animate-fade-in">
        <div className="card p-6 border-red-200 bg-red-50">
          <p className="text-red-800 font-medium">{error}</p>
          <button onClick={loadJobs} className="btn-secondary mt-4 border-red-200 text-red-700 hover:bg-red-100">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Browse Jobs</h1>
        <p className="mt-2 text-slate-600">Discover opportunities that match your interests</p>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Load graduate jobs</h3>
          <p className="mt-2 text-slate-600 text-sm max-w-sm mx-auto">
            Jobs are pulled from our partner feed. Click below to load the latest opportunities.
          </p>
          {refreshError && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-2 inline-block">
              {refreshError}
            </p>
          )}
          <button
            type="button"
            onClick={handleRefreshJobs}
            disabled={refreshing}
            className="btn-primary mt-6 inline-flex disabled:opacity-60"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading jobs…
              </>
            ) : (
              'Load latest jobs'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSaveJob}
              saving={saving[job.id]}
              isSaved={job.isSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
