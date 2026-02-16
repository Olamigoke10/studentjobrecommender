import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';
import { useAuth } from '../auth/AuthContext';
import Loader from '../components/Loader';

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
    course: '',
    preferred_job_type: 'graduate',
    preferred_location: '',
    skills_ids: [],
  });

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
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
      const response = await authAPI.updateProfile(formData);
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

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="mt-2 text-slate-600">
          Update your profile to get better job recommendations
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="course" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Course / field of study
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <label htmlFor="preferred_job_type" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
            <label htmlFor="preferred_location" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Preferred location
            </label>
            <input
              type="text"
              id="preferred_location"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. London, UK"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Skills
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 min-h-[100px] max-h-[220px] overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">No skills available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.skills_ids.includes(skill.id)
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {skill.name}
                      {formData.skills_ids.includes(skill.id) && ' ✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">Click to select or deselect</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
              <p className="text-sm font-medium text-emerald-800">Profile updated successfully.</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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
