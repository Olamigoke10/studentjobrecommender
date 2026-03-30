import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import BackButton from '../components/BackButton';
import { ROUTES } from '../utils/constants';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unsaving, setUnsaving] = useState({});
  const [saving, setSaving] = useState({});
  const [applicationsMap, setApplicationsMap] = useState({});

  useEffect(() => {
    loadSavedJobs();
  }, []);

  useEffect(() => {
    jobsAPI.getApplications().then((res) => {
      const list = res.data || [];
      const map = {};
      list.forEach((a) => { map[a.job?.id] = { id: a.id, status: a.status }; });
      setApplicationsMap(map);
    }).catch(() => {});
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getSavedJobs();
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
      setError('Failed to load saved jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    if (unsaving[jobId]) return;
    setUnsaving((prev) => ({ ...prev, [jobId]: true }));
    try {
      await jobsAPI.unsaveJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
      alert('Failed to remove job. Please try again.');
    } finally {
      setUnsaving((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="py-4 sm:py-6 animate-fade-in">
        <BackButton className="mb-4" />
        <ErrorState message={error} onRetry={loadSavedJobs} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Saved Jobs</h1>
          <p className="mt-1 sm:mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">Your saved opportunities</p>
        </div>
        <span className="inline-flex w-fit px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {jobs.length} saved
        </span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          type="saved"
          title="No saved jobs yet"
          description="Save jobs from Browse or For You to see them here."
          actionLabel="Browse jobs"
          actionHref={ROUTES.JOBS}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onUnsave={handleUnsaveJob}
              onMarkApplied={async (jobId) => {
                if (saving[jobId]) return;
                setSaving((prev) => ({ ...prev, [jobId]: true }));
                try {
                  const res = await jobsAPI.createApplication(jobId, { status: 'applied' });
                  setApplicationsMap((prev) => ({ ...prev, [jobId]: { id: res.data.id, status: 'applied' } }));
                } catch (_) { alert('Failed to mark as applied.'); }
                finally { setSaving((prev) => ({ ...prev, [jobId]: false })); }
              }}
              saving={unsaving[job.id] || saving[job.id]}
              variant="saved"
              applicationStatus={applicationsMap[job.id]?.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
