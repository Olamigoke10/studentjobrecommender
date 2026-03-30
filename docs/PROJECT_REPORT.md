# MIDDLESEX UNIVERSITY  
**THE BURROUGHS, HENDON LONDON NW4 4BT**

---

**Title:** Design and Development of a Student Job Recommendation Application  

**Student Name:** Olamigoke Adebayo David  
**Student ID:** M01074076  
**Supervisor Name:** ………………

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Description of the Project](#2-description-of-the-project)
3. [Rationale and Background](#3-rationale-and-background)
4. [Aims & Objectives](#4-aims--objectives)
5. [Research Methodology](#5-research-methodology)
6. [Time Plan (Gantt Chart)](#6-time-plan-gantt-chart)
7. [Conclusion](#7-conclusion)
8. [References](#8-references)

---

## 1. ABSTRACT

### 1.1 What the author did
The author designed and developed a web-based **Student Job Recommendation Application** (StudentJobRec) that helps university students and recent graduates discover job opportunities aligned with their course of study, skills, and preferences. The system allows users to browse jobs from an external job feed, save jobs, track applications, build and export a CV, and receive personalised job recommendations based on their profile.

### 1.2 How the author did it
The application was built using a **React (Vite)** frontend and a **Django REST** backend. Job data is sourced via the **Adzuna API**; user profiles (course, skills, preferred job type and location) and a recommendation engine are used to rank and filter jobs. Authentication is handled with **JWT**. The system is deployed with the backend on **Render** and the frontend on **Vercel**, using **PostgreSQL** for production data storage.

### 1.3 What the author found
A working prototype was delivered with core features: user registration and profile management, job search and filters (keyword, location, job type), saved jobs, application tracking, a “For You” recommendations page, and a CV builder with an optional AI-generated summary (OpenAI). Students can centralise job search, applications, and CV in one place, with recommendations tailored to their profile.

### 1.4 What the author concluded
A dedicated student-focused job recommendation application can reduce the effort of finding relevant roles by combining profile-based matching with standard search and filters. Integrating an external job API with a simple recommendation layer and a CV builder offers a practical solution to the problem of irrelevant job listings and scattered tools. Future work could include richer recommendation algorithms, more job sources, and stronger integration with university career services.

---

## 2. DESCRIPTION OF THE PROJECT (0.5 page)

### 2.1 What is the problem?
Many students and graduate students find it difficult to get suitable job opportunities that align with their course of study, skills, and career interests. Existing job platforms present a large number of generic job listings, which makes it time-consuming for students to filter through roles that are irrelevant to them. As a result, students often apply for jobs that do not match their background, leading to multiple rejections, wasted time and effort, and frustration. This problem is common among students balancing academic commitments with part-time work and among recent graduates.

### 2.2 Why is it important?
Finding relevant employment is an important part of a student’s academic and professional journey. Inefficient job searching can negatively affect students’ confidence, academic focus, and career progression. It can lead students to abandon career aspirations when they cannot find roles aligned with their studies and skills. By improving how job opportunities are matched to student profiles, this project addresses a real, practical problem. A system that recommends suitable roles based on course and skills can help students make better career choices, reduce unnecessary applications, and improve employability outcomes.

### 2.3 Who will benefit?
The main beneficiaries are **university students and recent graduates** seeking part-time jobs, internships, or entry-level roles. **Career advisers and academic institutions** may use such a system to support career guidance. **Employers** may benefit from receiving applications from better-matched candidates. The system aims to create a more efficient and focused job-search process for all stakeholders.

---

## 3. RATIONALE AND BACKGROUND (1–2 pages)

### 3.1 What is happening in relation to this proposed project/problem?
Modern job platforms such as **LinkedIn**, **Indeed**, and **Glassdoor** provide advanced filtering (keywords, location, salary, experience level). Some use basic recommendation algorithms driven by user activity and search history. However, most systems are aimed at general job seekers rather than university students. Emerging research in recommender systems shows that **content-based filtering** and **hybrid recommendation** approaches can improve personalisation on employment platforms. This project applies these ideas in a student-focused application that uses profile data (course, skills, preferences) to recommend and surface relevant jobs.

### 3.2 What are the current solutions?
Current solutions include: (1) **General job boards** (Indeed, Reed, Adzuna) with filters but no student-specific matching; (2) **LinkedIn** and similar networks with recommendations based on profile and behaviour, but not optimised for students’ course and skills; (3) **University career portals** that often list fewer roles and limited search; (4) **Research prototypes** using content-based or collaborative filtering for job recommendation. Few systems combine a dedicated student profile (course, skills, preferences), an external job feed, application tracking, and a CV builder in one place.

### 3.3 Why these solutions are not good enough (otherwise, why do this project?)
General platforms do not prioritise student attributes such as course and graduate/internship roles. University portals may have limited job coverage. Students therefore spend time on multiple sites with little personalisation. This project provides a **single, student-centred application** that uses course, skills, and preferences to recommend and filter jobs, while integrating search, saved jobs, application tracking, and CV building. It demonstrates how a simple recommendation layer and good UX can address the gap.

### 3.4 What are the challenges/difficulties as you can foresee?
Challenges include: (1) **Data quality and coverage**—relying on one job API (e.g. Adzuna) may limit roles or regions; (2) **Recommendation accuracy**—matching by course/skills requires clear taxonomy and possibly more data; (3) **Scalability and cost**—external APIs and optional AI features (e.g. CV summary) have usage limits and cost; (4) **User adoption**—students must maintain profiles and trust the recommendations; (5) **Integration**—keeping job data and application state consistent across frontend and backend.

---

## 4. AIMS & OBJECTIVES (0.5–1 page)

### 4.1 Aims (~50 words)
To design and develop a web-based student job recommendation application that helps students and recent graduates find jobs aligned with their course, skills, and preferences; to integrate job search, saved jobs, application tracking, and a CV builder; and to evaluate whether profile-based recommendations improve relevance and usability compared to unfiltered browsing.

### 4.2 Objectives (tasks)
- **Objective 1:** Elicit and specify requirements for a student-focused job platform (user roles, core features, non-functional needs).
- **Objective 2:** Design system architecture (frontend, backend, database, external APIs) and data models for users, profiles, jobs, and applications.
- **Objective 3:** Implement user authentication, registration, and profile management (course, skills, preferred job type and location).
- **Objective 4:** Integrate an external job API (e.g. Adzuna), implement job listing, search, and filters (keyword, location, job type).
- **Objective 5:** Implement saved jobs, application tracking (status, notes), and a “For You” recommendation view based on profile.
- **Objective 6:** Implement a CV builder (summary, education, experience) with optional AI-generated summary and export/print.
- **Objective 7:** Deploy the application (e.g. backend on Render, frontend on Vercel) and document setup and usage.
- **Objective 8:** Test core flows and document findings; outline limitations and future work.

### 4.3 Approaches (referring to Background) to overcome challenges
- Use a **content-based** or **hybrid** approach for recommendations, using profile fields (course, skills, job type) to rank/filter jobs from the API.
- Rely on **REST APIs** and **JWT** for a clear separation between frontend and backend and easier scaling.
- Use **environment variables** and **external configuration** for API keys and deployment settings to support different environments.
- Design **responsive, mobile-friendly** UI so students can use the system on different devices.

### 4.4 Expected contribution
- A **working prototype** of a student job recommendation application with search, recommendations, saved jobs, application tracking, and CV builder.
- **Documentation** of design, implementation, deployment, and usage for replication and extension.
- **Practical insight** into integrating job APIs with profile-based recommendation and into challenges (data, APIs, UX) in this domain.

---

## 5. RESEARCH METHODOLOGY

### 5.1 How the research was / will be conducted
The project follows a **waterfall-style** sequence (see Figure 1) while implementing each phase in an iterative way within that phase. It combines **development** and **evaluation**:

- **Development methodology:** An iterative approach was used: requirements and design were outlined first, then core features (auth, profile, jobs, recommendations, CV) were implemented in stages. The stack (React, Django REST, PostgreSQL, Adzuna API) was chosen for feasibility and alignment with web development and API integration practices.
- **Testing and evaluation:** Functional testing of main user flows (register, login, profile, browse jobs, save jobs, applications, recommendations, CV build and export). Optional: user feedback or a small usability review to assess perceived relevance of recommendations and ease of use. Limitations (e.g. single job source, simple matching) are documented.
- **Data and APIs:** Job data comes from the Adzuna API; no primary survey or interview data is required for the prototype. If the report is extended, methods for data collection (e.g. logs, surveys) and analysis can be added here.

**Figure 1 – Waterfall methodology:** Requirements & Design → Implementation → Testing & Evaluation → Deployment → Maintenance & Documentation. *(Insert the image `waterfall-methodology.png` here; the diagram is saved in the project assets folder.)*

---

## 6. TIME PLAN (GANTT CHART) (0.5 page)

*Total project duration: 12 weeks.*

| Phase / Objective                    | Weeks    | Notes |
|-------------------------------------|----------|-------|
| Requirements & design                | 1–2      | Sections 2–4; architecture, data models |
| Backend setup (Django, DB, auth)    | 2–3      | User, profile, JWT |
| Job API integration & listing       | 3–5      | Adzuna, search, filters |
| Saved jobs & applications           | 5–6      | Models, API, UI |
| Recommendations (“For You”)         | 6–7      | Profile-based logic, API, UI |
| CV builder & optional AI            | 7–8      | CV API, form, preview, print; OpenAI if used |
| Frontend polish & mobile            | 8–9      | Responsive, back button, errors |
| Deployment & documentation          | 9–10     | Render, Vercel, README, env |
| Testing & report writing             | 10–12    | Testing, conclusion, references |

A Gantt chart for this 12-week plan is provided as `studentjobrec-gantt-chart-12wks.png` (in the project assets/docs). It can be inserted into the report to show the timeline visually.

---

## 7. CONCLUSION (0.5–1 page)

This project proposed and implemented a **Student Job Recommendation Application** (StudentJobRec) to address the difficulty students and recent graduates face in finding jobs that match their course, skills, and preferences. The system was built with a React frontend and a Django REST backend, using the Adzuna API for job data and profile-based logic for recommendations. Core features include user registration and profiles (course, skills, preferred job type and location), job search and filters, saved jobs, application tracking, a “For You” recommendations page, and a CV builder with optional AI-generated summary.

The working prototype demonstrates that a dedicated student-focused platform can centralise job search, applications, and CV in one place and can use simple recommendation rules to improve perceived relevance. Limitations include dependence on a single job API, the need for users to maintain profiles, and the simplicity of the current matching approach. Future work could extend to more job sources, richer recommendation algorithms (e.g. collaborative or hybrid), and closer integration with university career services. The project contributes a practical, deployable system and documentation that can support further research or development in student employability tools.

---

## 8. REFERENCES (~10)

1. Adzuna. (n.d.). *Adzuna API Documentation*. Retrieved from https://developer.adzuna.com/
2. Django Software Foundation. (n.d.). *Django REST framework*. https://www.django-rest-framework.org/
3. Indeed. (n.d.). *Job search platform*. https://www.indeed.com/
4. LinkedIn. (n.d.). *Professional network and job listings*. https://www.linkedin.com/
5. Ricci, F., Rokach, L., & Shapira, B. (2015). *Recommender Systems Handbook* (2nd ed.). Springer. (Chapters on content-based and hybrid recommendation.)
6. React. (n.d.). *React – A JavaScript library for building user interfaces*. https://react.dev/
7. Reed. (n.d.). *Reed.co.uk job board*. https://www.reed.co.uk/
8. Vercel. (n.d.). *Frontend deployment*. https://vercel.com/
9. Render. (n.d.). *Cloud application hosting*. https://render.com/
10. Glassdoor. (n.d.). *Job reviews and listings*. https://www.glassdoor.com/

*Note: Adjust references to the exact citation style required by Middlesex (e.g. Harvard). Add page numbers or URLs as per your department’s guidelines.*

---

*Document generated to align with the StudentJobRec application (StudentJob repository).*
