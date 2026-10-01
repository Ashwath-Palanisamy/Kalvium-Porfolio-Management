# Kalvium Portfolio Management

Kalvium Portfolio Management is a full-stack platform for students, mentors, and recruiters to discover talent, track coding progress, and review portfolio activity in one place. Students can manage their personal profile, projects, and achievements, while mentors can monitor squad activity, review suspicious submissions, and maintain structured oversight.

## Core features

- Public student profiles with portfolio, project, and achievement pages
- Role-based access for students and mentors
- Student dashboard for updating profile details and managing projects/achievements
- Public leaderboard that surfaces active students and coding activity
- GitHub and LeetCode profile enrichment for progress visibility
- Mentor squad management and review workflow
- Anti-cheating guardrails for suspicious rapid LeetCode activity with mentor review gates
- Responsive frontend and API-layer rate limiting for operational stability

## Tech stack

### Frontend
- React 19
- Vite
- React Router
- Supabase client for auth/session handling
- CSS-based page styling

### Backend
- Node.js + Express
- Supabase JS client
- JWT bearer-token validation for protected routes
- Express rate limiting
- Scheduled/cron-style review processing hooks

## Repository structure

```text
.
├── backend/
│   ├── src/
│   ├── migrations/
│   └── package.json
├── docs/
│   ├── PRD.md
│   ├── HLD.md
│   ├── LLD.md
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── README.md
├── MENTOR_REVIEW_FIXES.md
├── STUDENT_PENDING_REVIEW_FEATURE.md
├── vercel.json
└── .gitignore
```

## Local setup

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

Create environment files for both apps.

Frontend example:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend example:

```bash
PORT=8000
ORIGIN=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 3. Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The frontend development server typically runs on http://localhost:5173 and the backend on http://localhost:8000.

## Product overview

The platform is designed to solve a common student-discovery problem: talent is spread across projects, GitHub, LinkedIn, and coding platforms, and mentors need a single place to evaluate progress reliably.

Students can publish a polished portfolio that includes a bio, links, projects, achievements, GitHub activity, and LeetCode activity. Mentors can manage assigned squads, view overview metrics, and review suspicious activity before allowing a student back onto public leaderboard rankings.

## Documentation

- [docs/README.md](docs/README.md) — documentation index
- [docs/PRD.md](docs/PRD.md) — product requirements and scope
- [docs/HLD.md](docs/HLD.md) — high-level architecture and system design
- [docs/LLD.md](docs/LLD.md) — module-level implementation details
- [MENTOR_REVIEW_FIXES.md](MENTOR_REVIEW_FIXES.md) — mentor review bug-fix summary
- [STUDENT_PENDING_REVIEW_FEATURE.md](STUDENT_PENDING_REVIEW_FEATURE.md) — student-facing pending review flow
