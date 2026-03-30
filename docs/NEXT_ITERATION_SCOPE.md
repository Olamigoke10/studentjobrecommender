# Next iteration scope — StudentJobRec

This document records **chosen themes** for the next development iteration (aligned with the feature roadmap in the project plan) and **API/model validation**: what the backend already supports versus what must be added.

---

## 1. Chosen themes (1–2)

### Theme A — Leverage existing data

**Rationale:** The stack already exposes profile fields, `SavedJob`, `ApplicationTracker`, and recommendation scoring with `match_score` and `recommended_reason` ([`recommendations/views.py`](../student-job-recommender/backend/recommendations/views.py), [`recommendations/serializers.py`](../student-job-recommender/backend/recommendations/serializers.py)). The highest return is to make that data **visible, actionable, and improvable** before adding new job sources.

**In scope for this theme (feature buckets):**

| Bucket | Intent |
|--------|--------|
| Profile completeness | Surface gaps (course, skills, location, job type) so recommendations stay useful. |
| Recommendation transparency | Ensure UI consistently shows match score and reasons (already in API). |
| Feedback loop | “Not interested” / dismiss to hide similar jobs and tune future ranking. |
| Implicit signals (phase 1) | Boost or suggest jobs **similar to saved or applied** jobs using keyword overlap on `Job.title` / `description` (no new ML stack required initially). |

### Theme B — Reduce friction

**Rationale:** Students leave when they must repeat the same search or miss new listings. The app already lists jobs with query params on [`JobListView`](../student-job-recommender/backend/jobs/views.py) (`search`, `location`, `job_type`).

**In scope for this theme (feature buckets):**

| Bucket | Intent |
|--------|--------|
| Saved searches | Persist named filters (keyword + location + job type) and re-run with one click. |
| Freshness | “New since last visit” or badge for jobs with `cached_at` after a per-user `last_jobs_visit_at`. |
| Alerts (later phase) | Email or in-app digest when new jobs match a saved search (needs async jobs + mail config). |

---

## 2. API and model validation

### 2.1 Users / profile

| Need | Current support | Gap |
|------|-----------------|-----|
| Load/update profile | `GET/PATCH /api/users/me/` — [`StudentProfileSerializer`](../student-job-recommender/backend/users/serializers.py) includes `email`, `name`, `skills`, `skills_ids`, `preferred_job_type`, `preferred_location`, `course`, `cv_summary`. | None for basic completeness; optional: add read-only `profile_completeness_percent` computed field to avoid duplicating logic on the client. |
| List skills / courses | `GET /api/users/skills/`, `GET /api/users/courses/` per [`users/urls.py`](../student-job-recommender/backend/users/urls.py). | None for profile completeness UI. |

### 2.2 Jobs browse and filters

| Need | Current support | Gap |
|------|-----------------|-----|
| Filtered list | `GET /api/jobs/?search=&location=&job_type=&page=` — [`JobListView.get_queryset`](../student-job-recommender/backend/jobs/views.py). | **Saved search:** no model or `POST /api/jobs/saved-searches/` yet; needs new model (e.g. `SavedSearch` → `StudentProfile` + query fields + optional name). |
| Job freshness | `Job.cached_at`, `posted_date` on [`Job`](../student-job-recommender/backend/jobs/models.py). | **Per-user “new”:** store `last_jobs_visit_at` on `StudentProfile` (or separate table) and compare to `cached_at` in list response or filter `?since_visit=true`. |
| Second source / dedup | `source`, `external_id` on `Job`. | Adding another feed is a service-layer change; dedup by `external_id` per source or normalized hash — document when implementing. |

### 2.3 Saved jobs and applications

| Need | Current support | Gap |
|------|-----------------|-----|
| Saved jobs | `GET /api/jobs/saved/`, `POST/DELETE /api/jobs/<id>/` — [`SavedJobListView`](../student-job-recommender/backend/jobs/views_saved.py), [`SaveJobToggleView`](../student-job-recommender/backend/jobs/views_saved.py). | None for “similar to saved”: implement as recommendation endpoint variant or client-side query built from aggregated keywords from saved `Job` rows. |
| Applications | `ApplicationTracker` with `status`, `notes`; list/detail under `jobs` URLs. | **Deadlines/reminders:** no `deadline` field; add nullable `DateField` + migration if pursuing application workflow enhancements. |

### 2.4 Recommendations

| Need | Current support | Gap |
|------|-----------------|-----|
| Scored list | `GET /api/recommendations/` returns jobs with `match_score`, `recommended_reason` (list of strings). | None for display-only transparency. |
| Exclude dismissed / negative feedback | N/A | **New:** model e.g. `JobFeedback(student, job, feedback_type)` with `hidden` / `not_interested`, and filter in [`RecommendedJobsView.get`](../student-job-recommender/backend/recommendations/views.py). |
| Similar-to-saved boost | Logic is profile-only today. | Extend scoring: extract keywords from user’s saved/applied jobs and add overlap terms to `search_q` or post-score boost. |

### 2.5 CV / AI

| Need | Current support | Gap |
|------|-----------------|-----|
| AI summary | `POST /api/users/me/cv/ai-summary/` | **Cover letter helper:** new endpoint + prompt; optional new fields only if storing drafts per job. |

### 2.6 Notifications / background work

| Need | Current support | Gap |
|------|-----------------|-----|
| Saved search alerts | N/A | Requires Celery/cron (or managed scheduler), email backend (`EMAIL_*` settings), and idempotent “notify once per new job” logic. |
| Rate limiting / caching | Not verified in this pass | Add DRF throttling + short TTL cache on `GET /api/jobs/` if traffic grows. |

---

## 3. Suggested build order (within this scope)

1. **Profile completeness** — Dashboard + Profile (client-only or small serializer field).
2. **Recommendation feedback** — Model + `POST` (or `PATCH`) from recommendations UI + filter in `RecommendedJobsView`.
3. **Saved searches** — Model + CRUD API + Jobs page UI to save/load queries.
4. **“New” jobs** — `last_jobs_visit_at` + badge or filter on job list.
5. **Similar-to-saved** — Backend scoring tweak or dedicated `GET /api/recommendations/similar-to-saved/`.
6. **Alerts** — After saved searches exist, add periodic task + email.

---

## 4. References

- Core API routing: [`backend/urls.py`](../student-job-recommender/backend/backend/urls.py) → `api/users/`, `api/jobs/`, `api/recommendations/`.
- Frontend entry: [`frontend/src/App.jsx`](../frontend/src/App.jsx), dashboard [`frontend/src/pages/Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx).

This file is the working scope for **Theme A (leverage existing data)** and **Theme B (reduce friction)**; adjust sections as implementation proceeds.
