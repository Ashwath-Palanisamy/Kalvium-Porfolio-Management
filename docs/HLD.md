# High-Level Design (HLD)

## 1. Objective

This document describes the current architecture of Kalvium Portfolio Management and the core runtime flows that power the app in production-style development.

## 2. Solution overview

The product is divided into three major layers:

1. Frontend application built with React and Vite
2. Express backend serving protected and public endpoints
3. Supabase-backed data and authentication layer

The frontend focuses on portfolio browsing, auth routing, and role-based dashboards. The backend owns API orchestration, token validation, role enforcement, and external API calls to GitHub and LeetCode.

## 3. Architecture components

### Frontend layer
- React single-page app with route-based navigation
- Public pages for home, students, leaderboard, and individual portfolios
- Role-aware dashboard pages for student and mentor users
- Reusable UI primitives such as Navbar, Footer, AuthGate, and EmptyState components

### Backend layer
- Express server serving public routes and dashboard-specific APIs
- Token verification against Supabase auth
- Role checks before student/mentor data access
- Rate limiting for profile updates and stats fetching

### Data and identity layer
- Supabase is the primary authentication and database provider
- Core tables include profiles, project_details, achievements, mentor_squads, and leetcode_leaderboard
- Role claims are stored in app metadata for authorization decisions

### External integrations
- GitHub REST API for repository counts and follower stats
- LeetCode GraphQL API for solved-count and ranking metrics
- Cron-based review processing logic for leaderboard suspension and review updates

## 4. Major runtime flows

### Student profile flow
1. A student signs in through the frontend.
2. The frontend retrieves the current session from Supabase.
3. The user lands on the student dashboard or role home.
4. The app requests profile data from /student/dashboard/profile.
5. The backend verifies the bearer token and ensures the account role is student.
6. The profile, projects, and achievements are loaded into the dashboard or public portfolio.
7. The dashboard requests the student's GitHub and LeetCode stats plus the public leaderboard dataset.
8. The frontend derives the current student's nearby leaderboard rows and displays activity status and resume access in separate dashboard cards.

### Public portfolio flow
1. A user visits /portfolio/:user_id or /students.
2. The frontend uses public profile endpoints from the backend.
3. The public route fetches student records without requiring an authenticated session.
4. The response includes project and achievement metadata, plus computed LeetCode activity indicators.

### Mentor dashboard flow
1. A mentor signs in and lands on /mentor/dashboard.
2. The frontend checks the user role against the allowed mentor list.
3. The mentor can view squad overview, assigned students, and review queue states.
4. The backend loads mentor-only data from mentor_squads and profile-derived activity tables.

### Review and suspension flow
1. Suspicious rapid LeetCode solve patterns are detected by cron or review processing logic.
2. The student is marked pending-review and temporarily excluded from public leaderboard visibility.
3. The mentor review queue exposes the student to a mentor reviewer.
4. The mentor approves or rejects the case.
5. The student is either restored to active leaderboard status or remains suspended.

## 5. System interaction diagram

```text
Browser (React/Vite)
   |
   v
Frontend route guards / dashboards
   |
   +--> Supabase Auth Session
   |
   +--> Express API Server
          |
          +--> Supabase DB + RLS-protected tables
          |
          +--> GitHub API
          |
          +--> LeetCode GraphQL API
          |
          +--> Review and leaderboard cron logic
```

## 6. Security model

The current implementation uses a server-trusted authorization model:

- The frontend checks the role using app_metadata.role.
- The backend also checks app_metadata.role in the authorization guard.
- user_metadata is not treated as a trusted source for access control.
- Protected routes require bearer-token validation.
- Rate limiting guards profile saves and stats queries.

This protects the app from privilege-escalation issues and keeps role semantics consistent across client and server.

## 7. Scalability and maintainability

The codebase is structured to support incremental growth:

- New public pages are added alongside the existing portfolio architecture.
- Dashboard logic is modularized by section, such as overview, assigned, and review.
- API routes are grouped by domain, including public endpoints and role-specific routes.
- Data access patterns are isolated behind Supabase clients and route handlers.

The architecture is not yet a microservice system, but it is cleanly separated enough to extend for new portfolio features, mentor analytics, or additional integrations.

## 8. Deployment assumptions

- Frontend runs as a Vite SPA and is suitable for static hosting or Vercel.
- Backend runs as a Node.js server on a port such as 8000.
- Supabase provides auth, database access, and table-level policy enforcement.
- The repo expects environment variables for the Supabase URL and keys as well as the backend origin configuration used by CORS.
