# Draft for Supervisor – Student Job Recommendation Application

**Student:** Olamigoke Adebayo David  
**Student ID:** M01074076  
**Project Title:** Design and Development of a Student Job Recommendation Application  
**Date:** [Add date when you send]

---

## 1. Purpose of this draft

This document is a short summary of the project for your review. It outlines what the project is, what has been done so far, and what is planned next. I would be grateful for your feedback and any suggestions before I finalise the full report and submission.

---

## 2. Project overview

**Problem:** Many students and graduates struggle to find job opportunities that match their course, skills, and career interests. General job sites show a lot of irrelevant listings, which wastes time and leads to unsuitable applications and rejections.

**Solution:** A dedicated web application (StudentJobRec) that:
- Lets students create a profile (course, skills, preferred job type and location).
- Fetches jobs from an external job feed (Adzuna API).
- Recommends jobs that match their profile (“For You” section).
- Allows users to save jobs, track applications (status and notes), and build a CV with a live preview and optional AI-generated summary.

**Target users:** University students and recent graduates looking for part-time work, internships, or entry-level roles.

---

## 3. What has been implemented

| Area | Status | Brief description |
|------|--------|-------------------|
| **Authentication** | Done | Register, login (JWT), profile with display name, course, skills, preferred job type and location. |
| **Dashboard** | Done | Welcome screen with stats (applications, saved jobs, recommendations count) and quick links to all main sections. |
| **Browse jobs** | Done | Job listings from Adzuna API; search by keyword; filters (location, job type); pagination; “Load latest” from feed. |
| **Saved jobs** | Done | Save/unsave jobs from Browse or For You; list saved jobs; remove; mark as applied. |
| **Applications** | Done | List applications; update status (Applied, Interviewing, Offered, Rejected); add/edit notes; link to original job. |
| **Recommendations (“For You”)** | Done | Backend logic that matches jobs to profile (course, skills, preferences); “For You” page with match score and short reason; save and mark as applied. |
| **Profile** | Done | Edit display name, course, preferred job type/location, skills (from API); success feedback on save. |
| **CV builder** | Done | Summary; multiple education and experience entries; live preview; print/save as PDF; “Generate with AI” for summary (OpenAI), with clear error message if API quota is exceeded. |
| **UI/UX** | Done | Responsive layout (mobile-friendly); navbar with mobile menu; back button on pages; loading and error states; consistent styling. |
| **Deployment** | Done | Backend on Render (PostgreSQL, migrations in build); frontend on Vercel; README with setup and environment variables. |
| **Documentation** | Done | Project report draft (PROJECT_REPORT.md) following the required structure; 12-week Gantt chart; waterfall methodology diagram for research methodology section. |

**Tech stack:** React (Vite) frontend, Django REST backend, PostgreSQL (production), Adzuna API for jobs, optional OpenAI for CV summary.

---

## 4. Current state and limitations

- **Working prototype:** The application is fully functional end-to-end (register → profile → browse/save jobs → applications → recommendations → CV). I can provide a live link and/or a short demo for you to try.
- **Single job source:** Jobs currently come only from Adzuna (UK). Adding more sources would be a possible future extension.
- **Recommendation logic:** Matching is based on profile fields (course, skills, job type, location). More advanced algorithms (e.g. collaborative filtering) could be explored later.
- **AI CV summary:** Depends on OpenAI API key and quota; if unavailable, users can still write the summary manually. Error messages are user-friendly.

---

## 5. Next steps (before final submission)

1. **Finalise report:** Complete any remaining sections in PROJECT_REPORT.md (e.g. supervisor name, any extra methodology or references as per your feedback), then convert to Word/PDF as required.
2. **Insert figures:** Add the Gantt chart and waterfall methodology diagram into the report where indicated.
3. **Final testing:** Do a full pass of all user flows on the deployed app and note any issues or limitations in the report.
4. **Submission:** Submit the report and, if required, repository/demo link according to Middlesex guidelines.

---

## 6. Request for your feedback

I would appreciate your feedback on:

1. **Scope:** Is the level of detail and coverage in the project and report appropriate?
2. **Methodology:** The report describes a waterfall-style structure with iterative development within phases. Is this framing suitable, or would you prefer a different emphasis (e.g. more on agile/iterative)?
3. **Report structure:** Does the draft report (PROJECT_REPORT.md) align with what you expect for the final submission (sections, length, figures)?
4. **Anything else:** Any suggestions on what to strengthen, shorten, or add before final submission.

I am happy to arrange a short demo of the application or to send the report draft and diagrams in another format (e.g. Word) if that is easier for you.

Thank you for your supervision and for the go-ahead on this project.

— Olamigoke Adebayo David
