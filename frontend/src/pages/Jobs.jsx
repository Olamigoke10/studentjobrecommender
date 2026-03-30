import React, { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import JobCard from '../components/JobCard';
import ErrorState from '../components/ErrorState';
import BackButton from '../components/BackButton';
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

  const loadJobs = useCallback(async (pageNum = 1, append = false, filterOverride = null) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const params = { page: pageNum, page_size: PAGE_SIZE };
      const s = filterOverride ? filterOverride.search ?? '' : search.trim();
      const l = filterOverride ? filterOverride.location ?? '' : location.trim();
      const jt = filterOverride ? (filterOverride.job_type ?? '') : jobType;
      if (s) params.search = s;
      if (l) params.location = l;
      if (jt) params.job_type = jt;
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

  // Load jobs only on mount; Search button and job-type change also run search
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    loadJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user picks a job type, run search (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobType]);

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

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    loadJobs(1, false, { search: '', location: '', job_type: '' });
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
      <div className="py-4 sm:py-6 animate-fade-in">
        <BackButton className="mb-4" />
        <ErrorState message={error} onRetry={() => loadJobs(1)} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Browse Jobs</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base">Simple search. Better results.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <span className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70">
            {totalCount} result{totalCount !== 1 ? 's' : ''}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70">
            Page {page}/{totalPages}
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Keyword</label>
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Graduate, software, analyst..."
                className="input-field pl-11"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Job type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="input-field"
            >
              <option value="">All types</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
          <button type="submit" className="btn-primary">
            <i className="bx bx-search text-base mr-1.5" />
            Search
          </button>
          <button type="button" onClick={handleClearFilters} className="btn-secondary">
            Clear
          </button>
          <button
            type="button"
            onClick={handleRefreshJobs}
            disabled={refreshing}
            className="btn-secondary disabled:opacity-60"
          >
            {refreshing ? (
              <>
                <i className="bx bx-loader-alt bx-spin text-lg mr-1.5" />
                Loading...
              </>
            ) : (
              <>
                <i className="bx bx-refresh text-lg mr-1.5" />
                Refresh feed
              </>
            )}
          </button>
        </div>
      </form>

      {refreshError && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
          {refreshError}
        </div>
      )}

      {jobs.length === 0 && !loading ? (
        <div className="card p-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-5">
            <i className="bx bx-briefcase text-3xl" />
          </div>
          {search.trim() || location.trim() || jobType ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No jobs match these filters</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto">
                Try broader keywords, or clear filters and refresh the feed.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={handleRefreshJobs}
                  disabled={refreshing}
                  className="btn-primary inline-flex disabled:opacity-60"
                >
                  {refreshing ? (
                    'Loading...'
                  ) : (
                    'Load latest jobs'
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No jobs loaded yet</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto">
                Load the latest opportunities from the partner feed.
              </p>
              <button
                type="button"
                onClick={handleRefreshJobs}
                disabled={refreshing}
                className="btn-primary mt-6 inline-flex disabled:opacity-60"
              >
                {refreshing ? (
                  'Loading jobs...'
                ) : (
                  'Load latest jobs'
                )}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Showing {jobs.length} of {totalCount} jobs
          </div>
          <div className="space-y-4">
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
            <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => loadJobs(page - 1)}
                disabled={page <= 1 || loading}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
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
