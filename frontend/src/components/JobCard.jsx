import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function JobCard({
  job,
  onSave,
  onUnsave,
  onMarkApplied,
  saving = false,
  isSaved = false,
  applicationStatus = null,
  showMatchScore = false,
  recommendedReason = null,
  variant = 'default', // 'default' | 'saved' | 'recommendation'
}) {
  const descriptionSnippet = job.description
    ? job.description.substring(0, 220) + (job.description.length > 220 ? '...' : '')
    : null;

  return (
    <article className="card card-hover p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {job.title}
            </h3>
            {showMatchScore && job.match_score != null && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700">
                Match {job.match_score}
              </span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
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

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {job.company && (
              <span className="font-medium text-slate-700">{job.company}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.posted_date && (
              <span className="text-slate-500">Posted {formatDate(job.posted_date)}</span>
            )}
          </div>

          {descriptionSnippet && (
            <p className="mt-3 text-slate-600 text-sm leading-relaxed line-clamp-3">
              {descriptionSnippet}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-shrink-0 sm:w-40">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto justify-center"
            >
              View job
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {variant === 'saved' ? (
            <button
              onClick={() => onUnsave(job.id)}
              disabled={saving}
              className="btn-secondary w-full sm:w-auto justify-center border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'btn-secondary'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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
                  <span className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-200">
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
                        <svg className="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        …
                      </>
                    ) : (
                      'Mark as applied'
                    )}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
