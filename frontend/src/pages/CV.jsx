import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { authAPI } from '../api/auth.api';
import Loader from '../components/Loader';

const emptyEducation = () => ({ institution: '', degree: '', subject: '', start_date: '', end_date: '', description: '' });
const emptyExperience = () => ({ company: '', role: '', start_date: '', end_date: '', description: '' });

const CV = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState([emptyEducation()]);
  const [experience, setExperience] = useState([emptyExperience()]);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    loadCV();
  }, []);

  const loadCV = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authAPI.getCV();
      const d = res.data;
      setSummary(d.summary || '');
      setEducation((d.education && d.education.length) ? d.education.map(e => ({
        institution: e.institution || '',
        degree: e.degree || '',
        subject: e.subject || '',
        start_date: e.start_date || '',
        end_date: e.end_date || '',
        description: e.description || '',
      })) : [emptyEducation()]);
      setExperience((d.experience && d.experience.length) ? d.experience.map(x => ({
        company: x.company || '',
        role: x.role || '',
        start_date: x.start_date || '',
        end_date: x.end_date || '',
        description: x.description || '',
      })) : [emptyExperience()]);
      setPreviewData({ ...d, name: d.name || user?.name || user?.email?.split('@')[0] || 'Your Name', email: d.email || user?.email });
    } catch (err) {
      console.error('Failed to load CV:', err);
      setError('Failed to load CV. Please try again.');
      setPreviewData({ name: user?.name || user?.email?.split('@')[0] || 'Your Name', email: user?.email, course: '', skills: [], summary: '', education: [], experience: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPreviewData(prev => prev ? {
      ...prev,
      summary,
      education,
      experience,
    } : null);
  }, [summary, education, experience]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await authAPI.updateCV({
        summary,
        education: education.filter(e => e.institution || e.degree || e.subject),
        experience: experience.filter(x => x.company || x.role),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setPreviewData(prev => ({ ...prev, summary, education, experience }));
    } catch (err) {
      console.error('Failed to save CV:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => setEducation(prev => [...prev, emptyEducation()]);
  const removeEducation = (i) => setEducation(prev => prev.filter((_, idx) => idx !== i));
  const updateEducation = (i, field, value) => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  const addExperience = () => setExperience(prev => [...prev, emptyExperience()]);
  const removeExperience = (i) => setExperience(prev => prev.filter((_, idx) => idx !== i));
  const updateExperience = (i, field, value) => setExperience(prev => prev.map((x, idx) => idx === i ? { ...x, [field]: value } : x));

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader />;

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CV Builder</h1>
          <p className="mt-2 text-slate-600">Build your CV and export to PDF</p>
        </div>
        <div className="flex gap-2 no-print">
          <button type="button" onClick={handlePrint} className="btn-primary">
            Print / Save as PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
          <i className="bx bx-check-circle text-emerald-600 text-xl flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-800">CV saved.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSave} className="space-y-6 no-print">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short personal statement (2–4 sentences)"
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Education</h2>
              <button type="button" onClick={addEducation} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add</button>
            </div>
            <div className="space-y-4">
              {education.map((e, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Entry {i + 1}</span>
                    {education.length > 1 && (
                      <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <input type="text" value={e.institution} onChange={(ev) => updateEducation(i, 'institution', ev.target.value)} placeholder="Institution" className="input-field" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={e.degree} onChange={(ev) => updateEducation(i, 'degree', ev.target.value)} placeholder="Degree (e.g. BSc)" className="input-field" />
                    <input type="text" value={e.subject} onChange={(ev) => updateEducation(i, 'subject', ev.target.value)} placeholder="Subject" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={e.start_date} onChange={(ev) => updateEducation(i, 'start_date', ev.target.value)} placeholder="Start (e.g. 2020)" className="input-field" />
                    <input type="text" value={e.end_date} onChange={(ev) => updateEducation(i, 'end_date', ev.target.value)} placeholder="End (e.g. 2024)" className="input-field" />
                  </div>
                  <textarea value={e.description} onChange={(ev) => updateEducation(i, 'description', ev.target.value)} placeholder="Description (optional)" rows={2} className="input-field resize-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Experience</h2>
              <button type="button" onClick={addExperience} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add</button>
            </div>
            <div className="space-y-4">
              {experience.map((x, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Entry {i + 1}</span>
                    {experience.length > 1 && (
                      <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <input type="text" value={x.company} onChange={(ev) => updateExperience(i, 'company', ev.target.value)} placeholder="Company" className="input-field" />
                  <input type="text" value={x.role} onChange={(ev) => updateExperience(i, 'role', ev.target.value)} placeholder="Role" className="input-field" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={x.start_date} onChange={(ev) => updateExperience(i, 'start_date', ev.target.value)} placeholder="Start" className="input-field" />
                    <input type="text" value={x.end_date} onChange={(ev) => updateExperience(i, 'end_date', ev.target.value)} placeholder="End" className="input-field" />
                  </div>
                  <textarea value={x.description} onChange={(ev) => updateExperience(i, 'description', ev.target.value)} placeholder="Description (optional)" rows={2} className="input-field resize-none" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save CV'}
          </button>
        </form>

        <div className="lg:sticky lg:top-24 print:static">
          <div className="card p-6 print:shadow-none print:border-0">
            <p className="text-sm font-medium text-slate-500 mb-2 print:hidden">Preview</p>
            <div id="cv-preview" className="bg-white text-slate-800 text-sm print:text-black">
              {previewData && (
                <>
                  <div className="border-b border-slate-200 pb-3 mb-3">
                    <h2 className="text-xl font-bold text-slate-900">{previewData.name || 'Your Name'}</h2>
                    {previewData.email && <p className="text-slate-600">{previewData.email}</p>}
                    {previewData.course && <p className="text-slate-600">{previewData.course}</p>}
                    {previewData.skills?.length > 0 && (
                      <p className="text-slate-600 mt-1">{previewData.skills.join(' · ')}</p>
                    )}
                  </div>
                  {summary && (
                    <section className="mb-4">
                      <h3 className="font-semibold text-slate-900 mb-1">Summary</h3>
                      <p className="whitespace-pre-wrap text-slate-700">{summary}</p>
                    </section>
                  )}
                  {education.some(e => e.institution || e.degree || e.subject) && (
                    <section className="mb-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Education</h3>
                      {education.filter(e => e.institution || e.degree || e.subject).map((e, i) => (
                        <div key={i} className="mb-3">
                          <p className="font-medium text-slate-900">{e.institution}</p>
                          <p className="text-slate-700">{(e.degree && e.subject) ? `${e.degree} ${e.subject}` : e.degree || e.subject} {(e.start_date || e.end_date) && ` · ${e.start_date} – ${e.end_date}`}</p>
                          {e.description && <p className="mt-1 text-slate-600 text-xs whitespace-pre-wrap">{e.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}
                  {experience.some(x => x.company || x.role) && (
                    <section>
                      <h3 className="font-semibold text-slate-900 mb-2">Experience</h3>
                      {experience.filter(x => x.company || x.role).map((x, i) => (
                        <div key={i} className="mb-3">
                          <p className="font-medium text-slate-900">{x.role} at {x.company}</p>
                          {(x.start_date || x.end_date) && <p className="text-slate-600 text-xs">{x.start_date} – {x.end_date}</p>}
                          {x.description && <p className="mt-1 text-slate-600 text-xs whitespace-pre-wrap">{x.description}</p>}
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cv-preview, #cv-preview * { visibility: visible; }
          #cv-preview { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CV;
