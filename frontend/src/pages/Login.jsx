import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROUTES } from '../utils/constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) navigate(ROUTES.DASHBOARD);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 py-8 sm:py-12 px-4">
      <div className="w-full max-w-5xl animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <section className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold mb-6">
                  S
                </div>
                <h2 className="text-3xl font-bold leading-tight">
                  Land student jobs that actually fit your profile
                </h2>
                <p className="mt-4 text-primary-100">
                  Search smarter, save opportunities, and keep your CV and applications in one place.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-primary-100">
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> Tailored recommendations</li>
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> Job tracking dashboard</li>
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> CV builder and export</li>
              </ul>
            </section>

            <section className="bg-white p-7 sm:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold text-2xl mb-4">
                  S
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="mt-2 text-slate-600 text-sm">
                  Sign in to continue to your job dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
                    <i className="bx bx-error-circle text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
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
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-11 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bx text-xl ${showPassword ? 'bx-hide' : 'bx-show'}`} />
                    </button>
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
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER} className="font-semibold text-primary-600 hover:text-primary-700">
                  Create one
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
