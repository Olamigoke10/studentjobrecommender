# StudentJob — What Has to Be Done to Complete the Project

This document lists what **must** be done (and one optional backend improvement) so the app is feature-complete and consistent end-to-end.

---

## 1. Backend fixes / small changes (must-do)

### 1.1 Profile API should return user email
- **Why:** Frontend uses `user?.name` and `user?.email` for Dashboard and Navbar, but `/api/users/me/` returns only profile fields (`skills`, `preferred_job_type`, `preferred_location`, `course`). There is no `name` or `email` in the response.
- **What to do:** In `StudentProfileSerializer`, add a read-only `email` field (e.g. `email = serializers.EmailField(source='user.email', read_only=True)`) and include `"email"` in `fields`. Optionally add a `name` field (e.g. from `user.email` or a future `User.display_name`).
- **Where:** `student-job-recommender/backend/users/serializers.py`

### 1.2 SavedJob delete view uses `request.user.profile`
- **Why:** In `SaveJobToggleView.delete()`, code uses `student = request.user.profile`. If a profile is missing, this can raise `AttributeError`. The same view’s `get` and `post` use `get_object_or_404(StudentProfile, user=request.user)`.
- **What to do:** In `delete()`, set `student = get_object_or_404(StudentProfile, user=request.user)` instead of `request.user.profile`.
- **Where:** `student-job-recommender/backend/jobs/views_saved.py`

### 1.3 (Optional) Expose list of skills for Profile page
- **Why:** Profile update sends `skills_ids` (list of skill IDs). The frontend needs a way to show/select skills (e.g. dropdown or multi-select). Backend has a `Skill` model but no API to list skills.
- **What to do:** Add a simple view (e.g. `SkillListView`) that returns all `Skill` objects (id, name) and register it (e.g. `GET /api/users/skills/` or `GET /api/skills/`). Then the Profile page can fetch and display them.
- **Where:** `student-job-recommender/backend/users/views.py` and `users/urls.py` (and optionally a small serializer or plain list of dicts).

---

## 2. Frontend — API layer (must-do)

### 2.1 Jobs API module
- **What to do:** Add a frontend API module (e.g. `frontend/src/api/jobs.api.js`) that uses the existing `axiosInstance` and implements:
  - `getJobs()` — GET `/api/jobs/` (list jobs, optionally with query params if backend supports them later).
  - `getSavedJobs()` — GET `/api/jobs/saved/`.
  - `saveJob(jobId)` — POST `/api/jobs/<id>/`.
  - `unsaveJob(jobId)` — DELETE `/api/jobs/<id>/`.
- **Why:** Jobs, Saved Jobs, and Recommendations pages need a single place to call the backend.

### 2.2 Recommendations API
- **What to do:** In the same file or a separate `recommendations.api.js`, add:
  - `getRecommendations()` — GET `/api/recommendations/`.
- **Why:** Recommendations page will use this.

### 2.3 Profile API (update)
- **What to do:** In `auth.api.js`, you already have `getProfile()`. Add:
  - `updateProfile(payload)` — PATCH (or PUT) `/api/users/me/` with `{ course, preferred_job_type, preferred_location, skills_ids }`.
- **Why:** Profile page needs to load and save profile.

### 2.4 (If you add backend skills endpoint) Skills API
- **What to do:** Add e.g. `getSkills()` — GET `/api/users/skills/` (or whatever path you chose). Use it on the Profile page to populate skill options.

---

## 3. Frontend — Pages (must-do)

Replace the placeholder components in `App.jsx` with real pages. Use the same route paths and `ProtectedRoute` as now.

### 3.1 Jobs page (`/jobs`)
- **What to do:**  
  - Fetch jobs with `getJobs()` and show a list (cards or table) with: title, company, location, job type, posted date, link to `url`, and a “Save” button.  
  - “Save” calls `saveJob(id)` and updates UI (e.g. button state or refetch saved list).  
  - Handle loading and empty state. Optional: simple search/filter (if backend supports query params later).
- **File:** Create `frontend/src/pages/Jobs.jsx` and use it in `App.jsx` instead of the inline `Jobs` placeholder.

### 3.2 Saved Jobs page (`/saved-jobs`)
- **What to do:**  
  - Fetch list with `getSavedJobs()` and render similarly to Jobs (title, company, location, link, etc.).  
  - Each item has an “Unsave” (or “Remove”) button that calls `unsaveJob(id)` and removes the item from the list (or refetches).  
  - Handle loading and empty state (“You haven’t saved any jobs yet”).
- **File:** Create `frontend/src/pages/SavedJobs.jsx` and use it in `App.jsx` instead of the inline `SavedJobs` placeholder.

### 3.3 Recommendations page (`/recommendations`)
- **What to do:**  
  - Fetch with `getRecommendations()` and display list. Backend returns jobs with `match_score` and `recommended_reason`; show these (e.g. “Match: 5 — Matches your course”, “Matches preferred location”).  
  - Same “Save” action as Jobs page.  
  - Handle loading and empty state (“Complete your profile for better recommendations” or “No recommendations right now”).
- **File:** Create `frontend/src/pages/Recommendations.jsx` and use it in `App.jsx` instead of the inline `Recommendations` placeholder.

### 3.4 Profile page (`/profile`)
- **What to do:**  
  - Load profile with `getProfile()` (already used by auth; ensure form is initialized with this data).  
  - Form fields: course, preferred_job_type (dropdown: internship, part_time, graduate, full_time), preferred_location (text), skills (multi-select or tag input using skill IDs; if backend exposes `GET /api/users/skills/`, fetch and show names).  
  - Submit with `updateProfile(...)`. On success, update auth context (e.g. `updateUser(response.data)` or refetch profile) so Navbar/Dashboard show up-to-date data.  
  - Show validation errors and a success message.
- **File:** Create `frontend/src/pages/Profile.jsx` and use it in `App.jsx` instead of the inline `Profile` placeholder.

---

## 4. Frontend — Display name (must-do)

- **What to do:** Since the backend will return `email` (and optionally `name`) from `/api/users/me/`, use that in the UI:
  - In **Navbar** and **Dashboard**, use `user?.name || user?.email || 'Student'` (or `'User'`) so that when only `email` is present, it still shows something sensible.
- **Where:** `frontend/src/components/Navbar.jsx`, `frontend/src/pages/Dashboard.jsx`.

---

## 5. Dashboard — Real counts (should-do)

- **What to do:** Dashboard currently shows hardcoded “0” for Jobs Applied, Saved Jobs, and Recommendations.  
  - **Saved Jobs:** Call `getSavedJobs()` and use `data.length` (or a dedicated count endpoint if you add one).  
  - **Recommendations:** Call `getRecommendations()` and use `data.length` (or count endpoint).  
  - **Jobs Applied:** Backend has `ApplicationTracker` but no API yet; you can leave as “0” or add a small “applications” count endpoint and use it later.
- **Where:** `frontend/src/pages/Dashboard.jsx`.

---

## 6. Quick links on Dashboard (should-do)

- **What to do:** Replace `<a href="/jobs">` (and similar) with React Router `<Link to={ROUTES.JOBS}>` (and same for saved-jobs, recommendations, profile) so navigation is client-side and consistent with the rest of the app.
- **Where:** `frontend/src/pages/Dashboard.jsx`.

---

## 7. Optional / later

- **Application tracking:** Backend has `ApplicationTracker` model but no REST endpoints. To “complete” application tracking, you’d add list/create/update endpoints and a “My Applications” page with status updates.
- **Jobs data:** Job list is populated via Adzuna and admin-only `POST /api/jobs/fetch/`. Ensure someone has run fetch at least once (or add a seed script) so the Jobs and Recommendations pages have data.
- **Pagination:** If the job list grows, add pagination (backend and frontend).
- **Error handling:** Global toast or inline error messages for API failures on all new pages.

---

## Summary checklist

| # | Task | Priority |
|---|------|----------|
| 1.1 | Backend: Add `email` (and optionally `name`) to profile/me response | Must |
| 1.2 | Backend: Fix `SaveJobToggleView.delete()` to use `get_object_or_404(StudentProfile, ...)` | Must |
| 1.3 | Backend: Optional — list skills endpoint for Profile | Optional |
| 2.1 | Frontend: Jobs API (getJobs, getSavedJobs, saveJob, unsaveJob) | Must |
| 2.2 | Frontend: Recommendations API (getRecommendations) | Must |
| 2.3 | Frontend: Profile API (updateProfile) | Must |
| 2.4 | Frontend: Skills API if backend adds skills endpoint | If 1.3 done |
| 3.1 | Frontend: Jobs page (list, save button) | Must |
| 3.2 | Frontend: Saved Jobs page (list, unsave button) | Must |
| 3.3 | Frontend: Recommendations page (list with score/reason, save) | Must |
| 3.4 | Frontend: Profile page (form load/save) | Must |
| 4 | Frontend: Use `user?.email` (and name) in Navbar & Dashboard | Must |
| 5 | Frontend: Dashboard real counts for saved & recommendations | Should |
| 6 | Frontend: Dashboard quick actions use `<Link>` | Should |

Once the “Must” items are done, the project is complete for core flows: browse jobs, save/unsave, see recommendations, and edit profile. The “Should” and “Optional” items improve UX and consistency.
