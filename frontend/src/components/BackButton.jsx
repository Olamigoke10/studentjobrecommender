import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = '', label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-lg py-2 pr-2 -ml-2 min-h-[44px] sm:min-h-0 sm:py-1.5 ${className}`}
      aria-label={label}
    >
      <i className="bx bx-arrow-back text-xl" />
      <span>{label}</span>
    </button>
  );
}
