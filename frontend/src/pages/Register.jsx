import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authAPI } from '../api/auth.api';
import { ROUTES, COURSES as FALLBACK_COURSES } from '../utils/constants';
import talentPathLogo from '../../logo/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
  });
  const [courses, setCourses] = useState(FALLBACK_COURSES);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    authAPI.getCourses()
      .then((res) => setCourses(res.data || FALLBACK_COURSES))
      .catch(() => setCourses(FALLBACK_COURSES));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      course: formData.course || undefined,
    });
    if (result.success) navigate(ROUTES.DASHBOARD);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-primary-900 to-indigo-900 py-8 sm:py-12 px-4 overflow-hidden dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="w-full max-w-5xl animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/40">
          <div className="grid lg:grid-cols-2">
            <section className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary-600 to-indigo-700 text-white dark:from-slate-900 dark:to-primary-900">
              <div>
                <img src={talentPathLogo} alt="Talent Path" className="h-12 w-12 rounded-xl object-cover mb-6" />
                <h2 className="text-3xl font-bold leading-tight">
                  Build your student profile and get smarter job matches
                </h2>
                <p className="mt-4 text-primary-100">
                  Tell us your course and preferences, then track your applications in one place.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-primary-100">
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> Student-first recommendations</li>
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> Save and manage applications</li>
                <li className="flex items-center gap-2"><i className="bx bx-check-circle text-lg" /> Create your CV faster</li>
              </ul>
            </section>

            <section className="bg-white/95 backdrop-blur p-7 sm:p-10 dark:bg-slate-950/90">
              <div className="text-center mb-8">
                <img src={talentPathLogo} alt="Talent Path" className="h-14 w-14 rounded-2xl object-cover mx-auto mb-4" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                  Create your account
                </h1>
                <p className="mt-2 text-slate-600 text-sm dark:text-slate-300">
                  Join Talent Path and find roles that fit you
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {(error || validationError) && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
                    <i className="bx bx-error-circle text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{validationError || error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">Name</label>
                    <div className="relative">
                      <i className="bx bx-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-11"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">Email</label>
                    <div className="relative">
                      <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-11"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">Course (optional)</label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">Password</label>
                  <div className="relative">
                    <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-11 pr-12"
                      placeholder="••••••••"
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
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">At least 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5 dark:text-slate-200">Confirm password</label>
                  <div className="relative">
                    <i className="bx bx-shield absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg dark:text-slate-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-11 pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bx text-xl ${showConfirmPassword ? 'bx-hide' : 'bx-show'}`} />
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
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                Already have an account?{' '}
                <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
