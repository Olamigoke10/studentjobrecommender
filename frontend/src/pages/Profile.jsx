import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';
import { useAuth } from '../auth/AuthContext';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';
import { COURSES as FALLBACK_COURSES } from '../utils/constants';

const JOB_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'full_time', label: 'Full-time' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skills, setSkills] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    preferred_job_type: 'graduate',
    preferred_location: '',
    skills_ids: [],
  });
  const [courses, setCourses] = useState(FALLBACK_COURSES);

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  useEffect(() => {
    authAPI.getCourses()
      .then((res) => setCourses(res.data || FALLBACK_COURSES))
      .catch(() => setCourses(FALLBACK_COURSES));
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        course: user.course || '',
        preferred_job_type: user.preferred_job_type || 'graduate',
        preferred_location: user.preferred_location || '',
        skills_ids: user.skills ? user.skills.map(s => s.id) : [],
      });
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      updateUser(response.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await authAPI.getSkills();
      setSkills(response.data);
    } catch (err) {
      // 404 = skills endpoint not deployed yet; treat as empty list
      if (err.response?.status !== 404) {
        console.error('Failed to load skills:', err);
      }
      setSkills([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills_ids: prev.skills_ids.includes(skillId)
        ? prev.skills_ids.filter(id => id !== skillId)
        : [...prev.skills_ids, skillId],
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await authAPI.updateProfile(formData);
      const response = await authAPI.getProfile();
      updateUser(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.detail || 
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const selectedSkillsCount = formData.skills_ids.length;

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Your Profile</h1>
          <p className="mt-1 sm:mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Keep this updated to improve recommendation quality.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <span className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70">
            {selectedSkillsCount} skill{selectedSkillsCount !== 1 ? 's' : ''} selected
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70">
            {formData.preferred_job_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="card p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Display name
              </label>
              <div className="relative">
                <i className="bx bx-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="e.g. Alex"
                />
              </div>
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Course / field of study
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select course</option>
                {formData.course && !courses.includes(formData.course) && (
                  <option value={formData.course}>{formData.course}</option>
                )}
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferred_job_type" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Preferred job type
              </label>
              <select
                id="preferred_job_type"
                name="preferred_job_type"
                value={formData.preferred_job_type}
                onChange={handleChange}
                className="input-field"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferred_location" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Preferred location
              </label>
              <div className="relative">
                <i className="bx bx-map-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
                <input
                  type="text"
                  id="preferred_location"
                  name="preferred_location"
                  value={formData.preferred_location}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="e.g. London, UK"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Skills ({selectedSkillsCount})
            </label>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/50 p-4 min-h-[100px] max-h-[220px] overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No skills available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.skills_ids.includes(skill.id)
                          ? 'bg-primary-700 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                    >
                      {skill.name}
                      {formData.skills_ids.includes(skill.id) && ' ✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Click a skill to select or remove it</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
              <i className="bx bx-check-circle text-emerald-600 text-xl flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-800">Profile updated successfully.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center gap-2">
                  <i className="bx bx-loader-alt bx-spin text-xl" />
                  Saving...
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
