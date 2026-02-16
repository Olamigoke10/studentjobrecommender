import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unsaving, setUnsaving] = useState({});

  useEffect(() => {
    loadSavedJobs();
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
    
    try {
      setUnsaving({ ...unsaving, [jobId]: true });
      await jobsAPI.unsaveJob(jobId);
      // Remove from list
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
      alert('Failed to remove job. Please try again.');
    } finally {
      setUnsaving({ ...unsaving, [jobId]: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadSavedJobs}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="mt-2 text-gray-600">
          Your saved job opportunities
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No saved jobs</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't saved any jobs yet. Start browsing jobs to save your favorites!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="space-y-2">
                    {job.company && (
                      <p className="text-gray-700">
                        <span className="font-medium">Company:</span> {job.company}
                      </p>
                    )}
                    {job.location && (
                      <p className="text-gray-700">
                        <span className="font-medium">Location:</span> {job.location}
                      </p>
                    )}
                    {job.job_type && (
                      <p className="text-gray-700">
                        <span className="font-medium">Type:</span>{' '}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.job_type}
                        </span>
                      </p>
                    )}
                    {job.posted_date && (
                      <p className="text-sm text-gray-500">
                        Posted: {formatDate(job.posted_date)}
                      </p>
                    )}
                    {job.description && (
                      <p className="text-gray-600 mt-3 line-clamp-3">
                        {job.description.substring(0, 200)}
                        {job.description.length > 200 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Job
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => handleUnsaveJob(job.id)}
                    disabled={unsaving[job.id]}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unsaving[job.id] ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Removing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
