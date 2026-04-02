import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { ROUTES } from '../utils/constants';
import talentPathLogo from '../../logo/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authAPI.requestPasswordReset(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Something went wrong. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-primary-900 to-accent-900 py-8 sm:py-12 px-4 overflow-hidden dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-400/25 blur-3xl" />
      <div className="w-full max-w-lg animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/40">
          <section className="bg-white/95 backdrop-blur p-7 sm:p-10 dark:bg-slate-950/90">
            <div className="text-center mb-8">
              <img src={talentPathLogo} alt="Talent Path" className="h-14 w-14 rounded-2xl object-cover mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                Forgot password?
              </h1>
              <p className="mt-2 text-slate-600 text-sm dark:text-slate-300">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-950/40 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  If an account exists for that email, you&apos;ll receive password reset instructions shortly.
                  Check your inbox and spam folder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
                    <i className="bx bx-error-circle text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">
                    Email
                  </label>
                  <div className="relative">
                    <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-11"
                      placeholder="you@university.ac.uk"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="bx bx-loader-alt bx-spin text-xl" />
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700">
                Back to sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
