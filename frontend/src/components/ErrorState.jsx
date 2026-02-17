import React from 'react';

/**
 * Reusable error state: message + optional retry button.
 * Use on Jobs, SavedJobs, Applications, Profile, Recommendations when a load or action fails.
 */
export default function ErrorState({ message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="card p-6 border-red-200 bg-red-50">
      <p className="text-red-800 font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary mt-4 border-red-200 text-red-700 hover:bg-red-100"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
