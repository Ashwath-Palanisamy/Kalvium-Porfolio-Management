# High-Level Design (HLD)

## 1. Objective
This document describes the high-level architecture of the Kalvium Portfolio Management application and how its major components work together.

## 2. Solution Overview
The product is split into a React-based frontend and an Express-based backend. The frontend provides the student-facing experience, while the backend acts as a secure bridge between the UI and external services such as Supabase, GitHub, and LeetCode.

## 3. Architectural Components
### Frontend
- Built with React and Vite.
- Uses React Router for page navigation.
- Includes pages such as Home, Students, Login Page, Individual Student Portfolio, and Mentor Dashboard.
- Uses styled components and CSS modules for page-specific layouts.

### Backend
- Built with Node.js and Express.
- Exposes API routes under /api/auth and /student/dashboard.
- Validates tokens and handles profile persistence and stat retrieval.

### Data & Identity Layer
- Supabase is used for authentication and profile storage.
- The profiles table stores student portfolio details.

### External Integrations
- GitHub API for public repository and follower counts.
- LeetCode GraphQL API for contest/problem-solving metrics.

## 4. Major Flows
### Student Profile Flow
1. User logs in through the frontend.
2. Frontend sends a bearer token to the backend.
3. Backend validates the token against Supabase.
4. Profile data is fetched or updated in the profiles table.
5. Data is returned to the frontend and rendered on the portfolio UI.

### Student Discovery Flow
1. User opens the Students page.
2. Frontend requests student profile records from Supabase.
3. Student cards are rendered with search and pagination support.
4. User can open an individual student profile.

### Mentor Dashboard Flow
1. Mentor accesses dashboard pages.
2. The UI renders a summary view with student info and related sections.
3. Additional student details can be surfaced through the dashboard components.

## 5. Component Interaction
```text
Client (React/Vite)
   |
   v
Express API Server
   |
   +--> Supabase Auth & Database
   +--> GitHub API
   +--> LeetCode GraphQL API
```

## 6. Security Design
- Protected routes require authenticated bearer tokens.
- Rate limiting is used on profile and stats endpoints.
- Sensitive values are not exposed in client-side code.
- Public-facing portfolio pages must avoid displaying anything that could be considered private or sensitive. Only intended profile content should be shown.
- Resume support is implemented as a link-based experience. The system should not depend on direct resume file uploads to the application.

## 7. Scalability & Extensibility
- The application is modular, allowing additional pages and features to be added without major rewrites.
- The backend can easily support more endpoints for analytics, resume upload, or admin workflows.
- The data layer can evolve from Supabase to a larger relational or document-based store if needed.

## 8. Deployment Assumptions
- The frontend is served via Vite in development and can be deployed as a static app.
- The backend runs as a Node.js service exposing REST endpoints.
- Environment variables should be configured for Supabase and service credentials.
