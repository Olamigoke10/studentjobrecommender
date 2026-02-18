import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import BackButton from '../components/BackButton';
import { ROUTES, APPLICATION_STATUSES } from '../utils/constants';

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsAPI.getApplications();
      setApplications(response.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    if (updating[appId]) return;
    setUpdating((prev) => ({ ...prev, [appId]: true }));
    try {
      const res = await jobsAPI.updateApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: res.data.status } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const startEditNotes = (app) => {
    setEditingNotes(app.id);
    setNotesDraft(app.notes || '');
  };

  const saveNotes = async (appId) => {
    if (updating[appId]) return;
    setUpdating((prev) => ({ ...prev, [appId]: true }));
    try {
      const res = await jobsAPI.updateApplication(appId, { notes: notesDraft });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, notes: res.data.notes } : a))
      );
      setEditingNotes(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setUpdating((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const cancelEditNotes = () => {
    setEditingNotes(null);
    setNotesDraft('');
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="py-4 sm:py-6 animate-fade-in">
        <BackButton className="mb-4" />
        <ErrorState message={error} onRetry={loadApplications} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
        <p className="mt-1 sm:mt-2 text-slate-600 text-sm sm:text-base">Track status and notes for each application</p>
      </div>

      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-6">
            <i className="bx bx-clipboard text-4xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No applications yet</h3>
          <p className="mt-2 text-slate-600 text-sm max-w-sm mx-auto">
            Mark jobs as applied from Browse Jobs or Saved to track them here.
          </p>
          <Link to={ROUTES.JOBS} className="btn-primary mt-6 inline-flex">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const job = app.job;
            if (!job) return null;
            const isEditingNotes = editingNotes === app.id;
            return (
              <article key={app.id} className="card card-hover p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{job.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                        {job.company && <span className="font-medium text-slate-700">{job.company}</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.job_type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
                            {job.job_type}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Applied {formatDate(app.applied_at)}
                        {app.updated_at !== app.applied_at && ` · Updated ${formatDate(app.updated_at)}`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[140px]">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updating[app.id]}
                        className="input-field w-full sm:w-auto min-w-0 py-2.5 text-sm min-h-[44px] sm:min-h-0"
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm py-2.5 min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center"
                        >
                          View job
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    {isEditingNotes ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Add notes…"
                          rows={2}
                          className="input-field resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveNotes(app.id)}
                            disabled={updating[app.id]}
                            className="btn-primary text-sm"
                          >
                            {updating[app.id] ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" onClick={cancelEditNotes} className="btn-secondary text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-600 flex-1">
                          {app.notes ? (
                            <span className="whitespace-pre-wrap">{app.notes}</span>
                          ) : (
                            <span className="text-slate-400">No notes</span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditNotes(app)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {app.notes ? 'Edit notes' : 'Add notes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
