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
        <EmptyState
          type="jobs"
          title="No jobs right now"
          description="There are no jobs available at the moment. Check back later or try again."
          actionLabel="Try again"
          onAction={loadJobs}
        />
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
