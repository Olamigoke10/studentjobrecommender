import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const iconClass = {
  jobs: 'bx-briefcase',
  saved: 'bx-bookmark',
  recommendations: 'bx-star',
};

export default function EmptyState({ type = 'jobs', title, description, actionLabel = 'Browse jobs', actionHref, onAction }) {
  const icon = iconClass[type] || iconClass.jobs;
  const showAction = actionHref != null || onAction != null;
  return (
    <div className="card p-6 sm:p-12 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-6">
        <i className={`bx ${icon} text-4xl`} />
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
