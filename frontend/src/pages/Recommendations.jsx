import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api/recommendations.api';
import { jobsAPI } from '../api/jobs.api';
import Loader from '../components/Loader';

const Recommendations = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    loadRecommendations();
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
        setError('Please complete your profile to get personalized recommendations.');
      } else {
        setError('Failed to load recommendations. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (saving[jobId]) return;
    
    try {
      setSaving({ ...saving, [jobId]: true });
      await jobsAPI.saveJob(jobId);
      // Update local state to show saved status
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, isSaved: true } : job
      ));
    } catch (err) {
      console.error('Failed to save job:', err);
      alert('Failed to save job. Please try again.');
    } finally {
      setSaving({ ...saving, [jobId]: false });
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
          {error.includes('complete your profile') && (
            <a
              href="/profile"
              className="mt-2 inline-block text-sm text-yellow-600 hover:text-yellow-800 underline"
            >
              Go to Profile
            </a>
          )}
          {!error.includes('complete your profile') && (
            <button
              onClick={loadRecommendations}
              className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recommended Jobs</h1>
        <p className="mt-2 text-gray-600">
          Jobs matched to your profile and preferences
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete your profile with your course, skills, and preferences to get personalized job recommendations.
          </p>
          <a
            href="/profile"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Complete Profile
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    {job.match_score && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Match: {job.match_score}
                      </span>
                    )}
                  </div>
                  
                  {job.recommended_reason && job.recommended_reason.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900 mb-1">Why this matches:</p>
                      <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                        {job.recommended_reason.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                    onClick={() => handleSaveJob(job.id)}
                    disabled={saving[job.id] || job.isSaved}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      job.isSaved
                        ? 'border-green-300 text-green-700 bg-green-50 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {saving[job.id] ? (
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
                        Saving...
                      </>
                    ) : job.isSaved ? (
                      <>
                        <svg
                          className="-ml-1 mr-2 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Saved
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
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        Save Job
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

export default Recommendations;
