import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api/admin.api';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';

const statConfig = [
  { key: 'users_count', label: 'Users' },
  { key: 'student_profiles_count', label: 'Student profiles' },
  { key: 'jobs_count', label: 'Jobs in database' },
  { key: 'skills_count', label: 'Skills (catalog)' },
  { key: 'skill_fields_count', label: 'Course fields' },
  { key: 'saved_jobs_count', label: 'Saved job rows' },
  { key: 'applications_count', label: 'Application records' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillFields, setSkillFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [newFieldIds, setNewFieldIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFieldIds, setEditFieldIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not load stats.');
    }
  }, []);

  const loadSkills = useCallback(async () => {
    setSkillsLoading(true);
    try {
      const res = await adminAPI.getSkills();
      setSkills(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not load skills.');
    } finally {
      setSkillsLoading(false);
    }
  }, []);

  const loadSkillFields = useCallback(async () => {
    try {
      const res = await adminAPI.getSkillFields();
      setSkillFields(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not load skill fields.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadStats();
      await loadSkillFields();
      await loadSkills();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadStats, loadSkills, loadSkillFields]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminAPI.createSkill(name, newFieldIds);
      setNewName('');
      setNewFieldIds([]);
      await loadSkills();
      await loadStats();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.name?.[0] ||
        data?.field_ids?.[0] ||
        data?.detail ||
        'Could not create skill.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditFieldIds((skill.fields || []).map((f) => f.id));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditFieldIds([]);
  };

  const handleUpdate = async (id) => {
    const name = editName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminAPI.updateSkill(id, name, editFieldIds);
      cancelEdit();
      await loadSkills();
      await loadStats();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.name?.[0] ||
        data?.field_ids?.[0] ||
        data?.detail ||
        'Could not update skill.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFieldId = (id, setter) => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill from the catalog? Students lose this tag on their profile.')) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await adminAPI.deleteSkill(id);
      if (editingId === id) cancelEdit();
      await loadSkills();
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete skill.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !stats) {
    return <Loader />;
  }

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <BackButton className="mb-4" />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Admin
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          Platform stats and skill catalog. Students pick skills from this list on their profile.
        </p>
      </div>

      {error && (
        <div
          className="mb-4 p-4 rounded-xl bg-red-50 text-red-800 border border-red-100 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/50 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {statConfig.map(({ key, label }) => (
            <div
              key={key}
              className="card p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats?.[key] ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Skills</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-start">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New skill name"
              maxLength={100}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={submitting || !newName.trim()}
              className="btn-primary justify-center sm:w-auto shrink-0 disabled:opacity-50"
            >
              Add skill
            </button>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              <span className="font-medium text-slate-700 dark:text-slate-300">Courses this skill applies to.</span>{' '}
              Tick one or more. Leave all unchecked for a <span className="font-medium">global</span> skill (visible for every course).
            </p>
            <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
              {skillFields.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={newFieldIds.includes(field.id)}
                    onChange={() => toggleFieldId(field.id, setNewFieldIds)}
                  />
                  <span className="truncate">{field.name}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        {skillsLoading ? (
          <Loader />
        ) : (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <ul className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
              {skills.length === 0 ? (
                <li className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No skills yet. Add names students can choose on their profile.
                </li>
              ) : (
                skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/50 dark:bg-slate-900/30"
                  >
                    {editingId === skill.id ? (
                      <div className="flex flex-col gap-3 flex-1 min-w-0">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={100}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                        />
                        <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 p-3 max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {skillFields.map((field) => (
                            <label
                              key={field.id}
                              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                checked={editFieldIds.includes(field.id)}
                                onChange={() => toggleFieldId(field.id, setEditFieldIds)}
                              />
                              <span className="truncate">{field.name}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(skill.id)}
                            disabled={submitting || !editName.trim()}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{skill.name}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {(skill.fields || []).length
                              ? (skill.fields || []).map((field) => field.name).join(', ')
                              : 'Global (all courses)'}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(skill)}
                            disabled={submitting}
                            className="px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(skill.id)}
                            disabled={submitting}
                            className="px-3 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
