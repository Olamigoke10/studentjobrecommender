import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const icons = {
  jobs: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  ),
  saved: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  ),
  recommendations: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  ),
};

export default function EmptyState({ type = 'jobs', title, description, actionLabel = 'Browse jobs', actionHref, onAction }) {
  const icon = icons[type] || icons.jobs;
  const showAction = actionHref != null || onAction != null;
  return (
    <div className="card p-12 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm max-w-sm mx-auto">{description}</p>
      {showAction && (
        onAction ? (
          <button type="button" onClick={onAction} className="btn-primary mt-6 inline-flex">
            {actionLabel}
          </button>
        ) : (
          <Link to={actionHref} className="btn-primary mt-6 inline-flex">
            {actionLabel}
          </Link>
        )
      )}
    </div>
  );
}
