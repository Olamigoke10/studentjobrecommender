import React, { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import JobCard from '../components/JobCard';
import { JOB_TYPES } from '../utils/constants';

const PAGE_SIZE = 20;

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [applicationsMap, setApplicationsMap] = useState({});

  const loadJobs = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const params = { page: pageNum, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (jobType) params.job_type = jobType;
      const response = await jobsAPI.getJobs(params);
      const data = response.data;
      const list = data.results ?? data;
      const count = data.count ?? list.length;
      setTotalCount(count);
      setPage(pageNum);
      if (append) setJobs((prev) => [...prev, ...list]);
      else setJobs(list);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, location, jobType]);

  useEffect(() => {
    loadJobs(1);
  }, [loadJobs]);

  const loadApplications = useCallback(async () => {
    try {
      const res = await jobsAPI.getApplications();
      const list = res.data || [];
      const map = {};
      list.forEach((a) => { map[a.job?.id] = { id: a.id, status: a.status }; });
      setApplicationsMap(map);
    } catch (_) { /* ignore */ }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleSearch = (e) => {
    e?.preventDefault();
    loadJobs(1);
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const body = {};
      if (search.trim()) body.search = search.trim();
      if (location.trim()) body.location = location.trim();
      const res = await jobsAPI.refreshJobs(body);
      const newJobs = res.data?.jobs ?? [];
      if (newJobs.length === 0) {
        const hint = res.data?.hint || 'No jobs returned. Check that Adzuna keys (ADZUNA_APP_ID, ADZUNA_APP_KEY) are set in Render and your app is for UK (gb).';
        setRefreshError(hint);
      }
      await loadJobs(1);
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

  const handleMarkApplied = async (jobId) => {
    if (saving[jobId]) return;
    setSaving((prev) => ({ ...prev, [jobId]: true }));
    try {
      const res = await jobsAPI.createApplication(jobId, { status: 'applied' });
      setApplicationsMap((prev) => ({ ...prev, [jobId]: { id: res.data.id, status: 'applied' } }));
    } catch (err) {
      console.error('Failed to mark as applied:', err);
      alert('Failed to mark as applied. Please try again.');
    } finally {
      setSaving((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const hasMore = page < totalPages;

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Browse Jobs</h1>
        <p className="mt-2 text-slate-600">Discover opportunities that match your interests</p>
      </div>

      <form onSubmit={handleSearch} className="card p-4 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Keyword</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. graduate, software"
            className="input-field"
          />
        </div>
        <div className="w-48 min-w-[140px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. London"
            className="input-field"
          />
        </div>
        <div className="w-40 min-w-[120px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Job type</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="input-field"
          >
            <option value="">All</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {jobs.length === 0 && !loading ? (
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
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              {totalCount > 0 ? `${totalCount} job${totalCount !== 1 ? 's' : ''} found` : 'No jobs match your filters'}
            </p>
            {totalCount > 0 && (
              <button
                type="button"
                onClick={handleRefreshJobs}
                disabled={refreshing}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
              >
                {refreshing ? 'Loading…' : 'Load latest from feed'}
              </button>
            )}
          </div>
          <div className="space-y-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSaveJob}
                onMarkApplied={handleMarkApplied}
                saving={saving[job.id]}
                isSaved={job.isSaved}
                applicationStatus={applicationsMap[job.id]?.status}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => loadJobs(page - 1)}
                disabled={page <= 1 || loading}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => loadJobs(page + 1)}
                disabled={!hasMore || loading}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
