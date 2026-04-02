import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { ROUTES } from '../utils/constants';
import talentPathLogo from '../../logo/logo.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!uid || !token) {
      setError('Invalid or missing reset link. Use the link from your email or request a new reset.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.confirmPasswordReset({ uid, token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (Array.isArray(data?.new_password) ? data.new_password[0] : null) ||
        data?.detail ||
        'Could not reset password. The link may have expired.';
      setError(typeof msg === 'string' ? msg : 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  const invalidLink = !uid || !token;

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
                Set a new password
              </h1>
              <p className="mt-2 text-slate-600 text-sm dark:text-slate-300">
                Choose a strong password for your account.
              </p>
            </div>

            {success ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-950/40 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Password updated. Redirecting you to sign in…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {invalidLink && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-950/40 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      This page needs a valid reset link from your email.{' '}
                      <Link to={ROUTES.FORGOT_PASSWORD} className="underline font-semibold">
                        Request a new link
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
                    <i className="bx bx-error-circle text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">
                    New password
                  </label>
                  <div className="relative">
                    <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-11 pr-12"
                      placeholder="At least 8 characters"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bx text-xl ${showPassword ? 'bx-hide' : 'bx-show'}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password2" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                    <input
                      id="password2"
                      name="password2"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      className="input-field pl-11"
                      placeholder="Repeat password"
                      minLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || invalidLink}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="bx bx-loader-alt bx-spin text-xl" />
                      Updating...
                    </span>
                  ) : (
                    'Update password'
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

export default ResetPassword;
