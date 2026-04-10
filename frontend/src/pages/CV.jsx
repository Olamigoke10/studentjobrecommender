import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authAPI } from '../api/auth.api';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';

const emptyEducation = () => ({ institution: '', degree: '', subject: '', start_date: '', end_date: '', description: '' });
const emptyExperience = () => ({ company: '', role: '', start_date: '', end_date: '', description: '' });

const CV = () => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  const jobId = jobIdParam ? parseInt(jobIdParam, 10) : null;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState([emptyEducation()]);
  const [experience, setExperience] = useState([emptyExperience()]);
  const [previewData, setPreviewData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiGeneratedSummary, setAiGeneratedSummary] = useState(null);
  const [summarySuggestionKind, setSummarySuggestionKind] = useState(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const pdfInputRef = useRef(null);

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
    document.getElementById('cv-preview')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');

  const handleDownloadHtml = () => {
    if (!previewData) return;
    const safeName = (previewData.name || 'CV').replace(/[<>:"/\\|?*]/g, '').trim().slice(0, 80) || 'CV';
    const eduBlocks = education
      .filter((e) => e.institution || e.degree || e.subject)
      .map(
        (e) => `
        <div class="block">
          <p class="title">${escapeHtml(e.institution)}</p>
          <p>${escapeHtml([e.degree, e.subject].filter(Boolean).join(' '))}${e.start_date || e.end_date ? ` · ${escapeHtml(e.start_date)} – ${escapeHtml(e.end_date)}` : ''}</p>
          ${e.description ? `<p class="desc">${escapeHtml(e.description)}</p>` : ''}
        </div>`
      )
      .join('');
    const expBlocks = experience
      .filter((x) => x.company || x.role)
      .map(
        (x) => `
        <div class="block">
          <p class="title">${escapeHtml(x.role)} at ${escapeHtml(x.company)}</p>
          ${x.start_date || x.end_date ? `<p class="dates">${escapeHtml(x.start_date)} – ${escapeHtml(x.end_date)}</p>` : ''}
          ${x.description ? `<p class="desc">${escapeHtml(x.description)}</p>` : ''}
        </div>`
      )
      .join('');
    const skillsLine =
      previewData.skills?.length > 0 ? `<p class="meta">${previewData.skills.map(escapeHtml).join(' · ')}</p>` : '';
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(previewData.name || 'CV')}</title>
  <style>
    body { font-family: system-ui, Segoe UI, sans-serif; max-width: 720px; margin: 24px auto; padding: 0 16px; color: #111; line-height: 1.45; }
    h1 { font-size: 1.35rem; margin: 0 0 4px; }
    .meta { color: #444; margin: 2px 0; font-size: 0.95rem; }
    h2 { font-size: 1rem; margin: 1.25rem 0 0.5rem; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .block { margin-bottom: 0.85rem; }
    .title { font-weight: 600; margin: 0 0 2px; }
    .dates { color: #555; font-size: 0.85rem; margin: 0 0 4px; }
    .desc { margin: 4px 0 0; font-size: 0.9rem; color: #333; white-space: pre-wrap; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(previewData.name || 'Your Name')}</h1>
    ${previewData.email ? `<p class="meta">${escapeHtml(previewData.email)}</p>` : ''}
    ${previewData.course ? `<p class="meta">${escapeHtml(previewData.course)}</p>` : ''}
    ${skillsLine}
  </header>
  ${summary ? `<section><h2>Summary</h2><p class="desc">${escapeHtml(summary)}</p></section>` : ''}
  ${eduBlocks ? `<section><h2>Education</h2>${eduBlocks}</section>` : ''}
  ${expBlocks ? `<section><h2>Experience</h2>${expBlocks}</section>` : ''}
</body>
</html>`;
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName.replace(/\s+/g, '-')}-cv.html`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerateSummary = async () => {
    setAiError(null);
    setAiGeneratedSummary(null);
    const hasContent = education.some(e => e.institution || e.degree || e.subject) || experience.some(x => x.company || x.role);
    if (!hasContent) {
      setAiError('Add at least one education or experience entry first.');
      return;
    }
    setAiLoading(true);
    try {
      const payload = {
        education: education.filter(e => e.institution || e.degree || e.subject),
        experience: experience.filter(x => x.company || x.role),
        current_summary: summary || undefined,
      };
      if (jobId && Number.isInteger(jobId)) payload.job_id = jobId;
      const res = await authAPI.generateCVSummary(payload);
      setAiGeneratedSummary(res.data.summary || '');
      setSummarySuggestionKind('ai');
    } catch (err) {
      let msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to generate summary. Try again.';
      if (typeof msg === 'string' && (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.length > 200)) {
        if (msg.toLowerCase().includes('quota') || msg.includes('429')) {
          msg = 'AI limit reached. Check your provider billing or try again later.';
        } else {
          msg = 'AI summary is temporarily unavailable. Please try again later.';
        }
      }
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const mapImportedEducation = (rows) =>
    rows.map((e) => ({
      institution: e.institution || '',
      degree: e.degree || '',
      subject: e.subject || '',
      start_date: e.start_date || '',
      end_date: e.end_date || '',
      description: e.description || '',
    }));

  const mapImportedExperience = (rows) =>
    rows.map((x) => ({
      company: x.company || '',
      role: x.role || '',
      start_date: x.start_date || '',
      end_date: x.end_date || '',
      description: x.description || '',
    }));

  const handlePdfSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParseError(null);
    setParseLoading(true);
    try {
      const res = await authAPI.parseCVPdf(file);
      const d = res.data;
      const hasEdu = Array.isArray(d.education) && d.education.length > 0;
      const hasExp = Array.isArray(d.experience) && d.experience.length > 0;
      const hasSummary = typeof d.summary === 'string' && d.summary.trim().length > 0;
      if (!hasEdu && !hasExp && !hasSummary) {
        setParseError('Could not extract much from this PDF. Use a text-based CV or fill the form manually.');
        return;
      }
      if (hasEdu) setEducation(mapImportedEducation(d.education));
      if (hasExp) setExperience(mapImportedExperience(d.experience));
      if (hasSummary) {
        setAiGeneratedSummary(d.summary.trim());
        setSummarySuggestionKind('import');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Import failed. Try another PDF.';
      setParseError(typeof msg === 'string' ? msg : 'Import failed. Try again.');
    } finally {
      setParseLoading(false);
    }
  };

  const useGeneratedSummary = () => {
    if (aiGeneratedSummary) setSummary(aiGeneratedSummary);
    setAiGeneratedSummary(null);
    setAiError(null);
    setSummarySuggestionKind(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="py-4 sm:py-6 animate-fade-in">
      <div className="no-print">
        <BackButton className="mb-4" />
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">CV Builder</h1>
            <p className="mt-1 sm:mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Export as PDF (via your browser&apos;s print dialog) or download an HTML file to open or print elsewhere.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              tabIndex={-1}
              aria-hidden
              onChange={handlePdfSelected}
            />
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={parseLoading}
              className="btn-secondary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2"
            >
              {parseLoading ? (
                <>
                  <i className="bx bx-loader-alt bx-spin text-lg" />
                  Importing…
                </>
              ) : (
                <>
                  <i className="bx bx-upload text-lg" />
                  Import from PDF
                </>
              )}
            </button>
            <button type="button" onClick={handlePrint} className="btn-primary w-full sm:w-auto min-h-[44px]">
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="btn-secondary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2"
            >
              <i className="bx bx-download text-lg" aria-hidden />
              Download HTML
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

        {parseError && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">{parseError}</p>
          </div>
        )}

        {jobId && (
          <div className="mb-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 px-4 py-3 flex items-center gap-2">
            <i className="bx bx-briefcase text-primary-600 text-xl flex-shrink-0" />
            <p className="text-sm font-medium text-primary-800 dark:text-primary-200">You&apos;re building your CV for a specific job. Use &quot;Generate with AI&quot; to get a summary tailored to that role.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <form onSubmit={handleSave} className="space-y-6 no-print">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Summary</h2>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                className="btn-secondary min-h-[44px] px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin text-lg" />
                    Generating…
                  </>
                ) : (
                  <>
                    <i className="bx bx-bulb text-lg" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">{aiError}</p>
            )}
            {aiGeneratedSummary && (
              <div className="mb-4 p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20">
                <p className="text-xs font-semibold text-primary-800 mb-2">
                  {summarySuggestionKind === 'import' ? 'Imported summary' : 'Suggested summary'}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-3">{aiGeneratedSummary}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={useGeneratedSummary} className="btn-primary text-sm py-2">
                    Use this
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiGeneratedSummary(null);
                      setAiError(null);
                      setSummarySuggestionKind(null);
                    }}
                    className="btn-secondary text-sm py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short personal statement (2–4 sentences). Add education/experience above, then try Generate with AI."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Education</h2>
              <button type="button" onClick={addEducation} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add</button>
            </div>
            <div className="space-y-4">
              {education.map((e, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Entry {i + 1}</span>
                    {education.length > 1 && (
                      <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <input type="text" value={e.institution} onChange={(ev) => updateEducation(i, 'institution', ev.target.value)} placeholder="Institution" className="input-field" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={e.degree} onChange={(ev) => updateEducation(i, 'degree', ev.target.value)} placeholder="Degree (e.g. BSc)" className="input-field" />
                    <input type="text" value={e.subject} onChange={(ev) => updateEducation(i, 'subject', ev.target.value)} placeholder="Subject" className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={e.start_date} onChange={(ev) => updateEducation(i, 'start_date', ev.target.value)} placeholder="Start (e.g. 2020)" className="input-field" />
                    <input type="text" value={e.end_date} onChange={(ev) => updateEducation(i, 'end_date', ev.target.value)} placeholder="End (e.g. 2024)" className="input-field" />
                  </div>
                  <textarea value={e.description} onChange={(ev) => updateEducation(i, 'description', ev.target.value)} placeholder="Description (optional)" rows={2} className="input-field resize-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Experience</h2>
              <button type="button" onClick={addExperience} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add</button>
            </div>
            <div className="space-y-4">
              {experience.map((x, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Entry {i + 1}</span>
                    {experience.length > 1 && (
                      <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <input type="text" value={x.company} onChange={(ev) => updateExperience(i, 'company', ev.target.value)} placeholder="Company" className="input-field" />
                  <input type="text" value={x.role} onChange={(ev) => updateExperience(i, 'role', ev.target.value)} placeholder="Role" className="input-field" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={x.start_date} onChange={(ev) => updateExperience(i, 'start_date', ev.target.value)} placeholder="Start" className="input-field" />
                    <input type="text" value={x.end_date} onChange={(ev) => updateExperience(i, 'end_date', ev.target.value)} placeholder="End" className="input-field" />
                  </div>
                  <textarea value={x.description} onChange={(ev) => updateExperience(i, 'description', ev.target.value)} placeholder="Description (optional)" rows={2} className="input-field resize-none" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save CV'}
          </button>
        </form>

        <div className="lg:sticky lg:top-24 print:static">
          <div className="card p-4 sm:p-6 print:shadow-none print:border-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 print:hidden">Preview</p>
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
          @page { margin: 14mm; }
          html {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          html, body {
            background: #fff !important;
            color: #111 !important;
          }
          .no-print { display: none !important; }
          nav { display: none !important; }
          main {
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            overflow: visible !important;
          }
          #cv-preview {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CV;
