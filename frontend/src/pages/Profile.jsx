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
      console.error('Failed to load skills:', err);
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
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Update your profile to get better job recommendations
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course */}
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
              Course / Field of Study
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Preferred Job Type */}
          <div>
            <label htmlFor="preferred_job_type" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Job Type
            </label>
            <select
              id="preferred_job_type"
              name="preferred_job_type"
              value={formData.preferred_job_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {JOB_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Location */}
          <div>
            <label htmlFor="preferred_location" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Location
            </label>
            <input
              type="text"
              id="preferred_location"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., London, United Kingdom"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="border border-gray-300 rounded-md p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">No skills available</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.skills_ids.includes(skill.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                      {formData.skills_ids.includes(skill.id) && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Click skills to select/deselect them
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">Profile updated successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
