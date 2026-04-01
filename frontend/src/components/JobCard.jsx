import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function JobCard({
  job,
  onSave,
  onUnsave,
  onMarkApplied,
  onNotInterested,
  saving = false,
  dismissing = false,
  isSaved = false,
  applicationStatus = null,
  showMatchScore = false,
  recommendedReason = null,
  variant = 'default', // 'default' | 'saved' | 'recommendation'
}) {
  const navigate = useNavigate();
  const descriptionSnippet = job.description
    ? job.description.substring(0, 170) + (job.description.length > 170 ? '...' : '')
    : null;

  return (
    <article className="card card-hover p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {job.title}
            </h3>
            {showMatchScore && (job.match_percent != null || job.match_score != null) && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
                title={
                  job.match_percent != null && job.match_score != null
                    ? `${job.match_percent}% · ${job.match_score} points`
                    : undefined
                }
              >
                {job.match_percent != null ? (
                  <>
                    {job.match_tier ? `${job.match_tier} match` : 'Match'} · {job.match_percent}%
                  </>
                ) : (
                  <>Match {job.match_score}</>
                )}
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                {job.job_type}
              </span>
            )}
          </div>

          {recommendedReason && recommendedReason.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-primary-50/80 border border-primary-100">
              <p className="text-xs font-semibold text-primary-800 mb-1">Why it matches</p>
              <ul className="list-disc list-inside text-sm text-primary-700 space-y-0.5">
                {recommendedReason.slice(0, 3).map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            {job.company && (
              <span className="font-medium text-slate-700 dark:text-slate-200">{job.company}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <i className="bx bx-map-alt text-slate-400 text-base" />
                {job.location}
              </span>
            )}
            {job.posted_date && (
              <span className="text-slate-500 dark:text-slate-400">Posted {formatDate(job.posted_date)}</span>
            )}
          </div>

          {descriptionSnippet && (
            <p className="mt-2.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">
              {descriptionSnippet}
            </p>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 sm:flex-shrink-0 sm:w-44">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto justify-center"
            >
              View job
              <i className="bx bx-link-external ml-1.5 text-base" />
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.CV}?jobId=${job.id}`)}
            className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all duration-200 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
          >
            Build CV
            <i className="bx bx-file ml-1.5 text-base" />
          </button>
          {variant === 'saved' ? (
            <button
              onClick={() => onUnsave(job.id)}
              disabled={saving}
              className="btn-secondary w-full sm:w-auto justify-center border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              {saving ? (
                <>
                  <i className="bx bx-loader-alt bx-spin text-lg mr-2" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => onSave(job.id)}
                disabled={saving || isSaved}
                className={`w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                    : 'btn-secondary'
                }`}
              >
                {saving ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin text-lg mr-2" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>Saved</>
                ) : (
                  <>Save job</>
                )}
              </button>
              {onMarkApplied && (
                applicationStatus ? (
                  <span className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/30 dark:text-primary-200 dark:border-primary-800">
                    {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkApplied(job.id)}
                    disabled={saving}
                    className="btn-secondary w-full sm:w-auto justify-center"
                  >
                    {saving ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin text-lg mr-2" />
                        …
                      </>
                    ) : (
                      'Mark as applied'
                    )}
                  </button>
                )
              )}
              {onNotInterested && (
                <button
                  type="button"
                  onClick={() => onNotInterested(job.id)}
                  disabled={dismissing || saving}
                  className="w-full sm:w-auto justify-center inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {dismissing ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin text-lg mr-2" />
                      …
                    </>
                  ) : (
                    <>
                      <i className="bx bx-x text-lg mr-1" />
                      Not interested
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
