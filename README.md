# StudentJobRec

A full-stack app for students to browse graduate jobs, save favourites, get personalised recommendations, track applications, and build a CV. Built with React (Vite) and Django REST (PostgreSQL).

## Features

- **Auth** – Register, login (JWT), profile with course, skills, job type, location
- **Jobs** – Browse jobs (Adzuna), search & filters, pagination, save/unsave, load latest from feed
- **Applications** – Track status (Applied, Interviewing, Offered, Rejected), notes
- **Recommendations** – Jobs matched to your profile
- **CV Builder** – Summary, education, experience; live preview; print/save as PDF

## Repo structure

- `frontend/` – React (Vite) + React Router + Tailwind
- `student-job-recommender/` – Django backend
  - `backend/` – Django project (settings, URLs), `users`, `jobs`, `recommendations` apps

## Running locally

### Backend

1. **Create venv and install deps** (from repo root):
   ```bash
   cd student-job-recommender
   python -m venv venv
   venv\Scripts\activate   # Windows
   # source venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   ```

2. **Database**  
   By default the app uses **SQLite** locally (no `.env` DB vars needed).  
   To use PostgreSQL locally, set in `.env`:
   - `USE_POSTGRES_LOCAL=true`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

3. **Migrations and run**:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```
   API: `http://127.0.0.1:8000/`

### Frontend

1. **Install and run** (from repo root):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App: `http://localhost:5173/`

2. **API base URL**  
   Set in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
   For production, point this to your deployed backend (e.g. Render).

## Environment variables

### Backend (production / Render)

- `DATABASE_URL` – PostgreSQL connection URL (Render provides this)
- `SECRET_KEY` – Django secret (set in production)
- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` – For job feed (Adzuna, country `gb`)
- `CORS_ALLOWED_ORIGINS` or allow your frontend origin
- **Optional (no Shell required):** `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` – on deploy, run `python manage.py bootstrap_staff_from_env` (see below) to create or promote your in-app **Admin** user. Remove or clear these after the first successful deploy if you prefer not to keep a password in env.

### Frontend

- `VITE_API_BASE_URL` – Backend API root (e.g. `https://your-backend.onrender.com`)

## Deploy

- **Backend** – Render (Web Service)
  - **Release Command** (often available even when Shell is not):  
    `cd backend && python manage.py migrate --noinput && python manage.py bootstrap_staff_from_env`  
    (Adjust `cd backend` if your Render root differs.)
  - In Render **Environment**, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` for the first deploy (creates a superuser, or promotes an existing user with that email). Then log in on your **production** frontend and open **Admin** to manage skills.
  - Optional: `BOOTSTRAP_ADMIN_USERNAME` – defaults to the same value as the email (`username` is required by the user model).
- **Frontend** – Vercel; set Root Directory to `frontend`; add `VITE_API_BASE_URL`
