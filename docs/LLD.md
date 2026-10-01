# Low-Level Design (LLD)

## 1. Purpose

This document explains the module structure and implementation patterns used by the current Kalvium Portfolio Management codebase. It focuses on the actual repository layout, route guards, and domain responsibilities that are present in the application today.

## 2. Repository structure

### Frontend
- [frontend/src/App.jsx](../frontend/src/App.jsx): top-level routing and dashboard route guards
- [frontend/src/components/AuthGate.jsx](../frontend/src/components/AuthGate.jsx): session bootstrap and role gating
- [frontend/src/hooks/useAuthStatus.js](../frontend/src/hooks/useAuthStatus.js): shared role resolution helper
- [frontend/src/pages/Home](../frontend/src/pages/Home): landing-page sections and marketing content
- [frontend/src/pages/Students.jsx](../frontend/src/pages/Students.jsx): public student directory
- [frontend/src/pages/IndividualStudentPortfolio.jsx](../frontend/src/pages/IndividualStudentPortfolio.jsx): detailed public portfolio page
- [frontend/src/pages/StudentProjectDetails.jsx](../frontend/src/pages/StudentProjectDetails.jsx): single public project view
- [frontend/src/pages/studentdashboard](../frontend/src/pages/studentdashboard): student dashboard tabs and profile management
- [frontend/src/pages/MentorDashboard](../frontend/src/pages/MentorDashboard): mentor dashboard, review queue, and squad management
- [frontend/src/lib/supabase.js](../frontend/src/lib/supabase.js): frontend Supabase client

### Backend
- [backend/src/index.js](../backend/src/index.js): Express bootstrap and route registration
- [backend/src/config/supabase.js](../backend/src/config/supabase.js): Supabase client creation and admin client setup
- [backend/src/routes/public.routes.js](../backend/src/routes/public.routes.js): public profile, project, achievement, and leaderboard data
- [backend/src/routes/student_dashboard.routes.js](../backend/src/routes/student_dashboard.routes.js): student profile, project, achievement, and stat endpoints
- [backend/src/routes/mentor_dashboard.routes.js](../backend/src/routes/mentor_dashboard.routes.js): mentor overview, squad, and review logic
- [backend/src/routes/cron.routes.js](../backend/src/routes/cron.routes.js): scheduled review processing and leaderboard suspension handling

## 3. Frontend responsibilities

### App routing
The frontend route tree is defined in [frontend/src/App.jsx](../frontend/src/App.jsx). It covers:

- `/` → home page
- `/login` → login experience
- `/students` → directory of student profiles
- `/portfolio/:user_id` → public student portfolio
- `/portfolio/:user_id/projects` → public student project list
- `/portfolio/:user_id/projects/:project_slug` → project detail
- `/leaderboard` → leaderboard page
- `/student/dashboard` and `/mentor/dashboard` → role-based protected dashboards

### Auth and role enforcement
The shared gate is implemented in [frontend/src/components/AuthGate.jsx](../frontend/src/components/AuthGate.jsx). The flow is:

1. Fetch the current Supabase session.
2. Validate it before rendering protected content.
3. Check the role via [frontend/src/hooks/useAuthStatus.js](../frontend/src/hooks/useAuthStatus.js).
4. Redirect unauthorized users to login or show AccessDenied for wrong-role cases.

The role contract is based on app_metadata.role:
- student
- mentor

This is intentionally kept consistent with the backend role checks to avoid UI/server drift.

### Dashboard structure
The dashboard tabs are defined in [frontend/src/pages/MentorDashboard/dashboardRoutes.js](../frontend/src/pages/MentorDashboard/dashboardRoutes.js).

Mentor tabs:
- dashboard
- overview
- assigned
- review
- settings

Student tabs:
- dashboard
- profile
- projects
- achievements
- settings

The student dashboard overview in [frontend/src/pages/studentdashboard/DashboardTab.jsx](../frontend/src/pages/studentdashboard/DashboardTab.jsx) combines platform stat cards with a public leaderboard preview. It fetches leaderboard data through [frontend/src/api/routes/Public/leaderboard.js](../frontend/src/api/routes/Public/leaderboard.js), applies the website ordering by score, total solved count, and LeetCode ranking, and renders the current student with adjacent ranked students. The current activity state is shown in a separate LeetCode status card, while the resume card shows linked/unlinked state and view/download actions.

The base route such as `/mentor/dashboard` and `/student/dashboard` is the canonical default home for each role. Unknown or redundant tabs are redirected back to the base route.

## 4. Backend responsibilities

### Public routes
[backend/src/routes/public.routes.js](../backend/src/routes/public.routes.js) handles public access to:

- profiles listing and single profile retrieval
- featured students
- public projects
- public achievements
- leaderboard-adjacent profile formatting
- `/public/leetcode-leaderboard`, which supplies leaderboard rows for the public leaderboard and student dashboard preview

These routes use the Supabase public client and are intentionally limited in the fields they expose.

### Student dashboard routes
[backend/src/routes/student_dashboard.routes.js](../backend/src/routes/student_dashboard.routes.js) implements the authenticated student area. It includes endpoints for:

- GET /student/dashboard/profile
- PUT /student/dashboard/updateprofile
- POST /student/dashboard/github
- POST /student/dashboard/leetcode
- GET /student/dashboard/projects
- POST /student/dashboard/projects
- DELETE /student/dashboard/projects/:id
- GET /student/dashboard/achievements
- POST /student/dashboard/achievements
- DELETE /student/dashboard/achievements/:id

These routes enforce:
- bearer-token validation
- student role check
- request validation
- rate limiting

### Mentor dashboard routes
[backend/src/routes/mentor_dashboard.routes.js](../backend/src/routes/mentor_dashboard.routes.js) implements mentor-specific behavior, including:

- squad overview queries
- mentor squad save/load operations
- student assignment and overview aggregation
- LeetCode activity normalization across leaderboard data
- mentor review queue logic and status updates

This file also includes the normalizer that converts raw activity fields into a consistent student activity shape and filters suspended students out of the public mentor overview data.

## 5. API and data model patterns

### Authentication guard
The backend uses a reusable auth requirement, which checks the Authorization header and verifies the token using Supabase auth.

If valid, the code stores the user on req.user and attaches an authed Supabase client tied to that session token.

### Role guard
The role guard in both dashboard route modules checks app_metadata.role and blocks access when the user is not in the required role. This is enforced on both the client and server for consistent security behavior.

### Data model assumptions
The implementation relies on Supabase tables such as:

- profiles
- project_details
- achievements
- mentor_squads
- leetcode_leaderboard

Representative fields include:
- user_id
- name
- title
- kalvium_email
- personal_email
- squad_id
- github
- leetcode
- linkedin
- avatar_url
- is_suspended
- is_leetcode_active
- total_solved
- last_solved_at

## 6. Validation and error handling

The backend includes validation for:
- GitHub URL format and username extraction
- LeetCode URL format and username extraction
- empty profile update payloads
- unauthorized and forbidden requests
- external API failures for LeetCode and GitHub

Standard patterns include:
- 400 for invalid input
- 401 for missing/invalid bearer tokens
- 403 for wrong-role access attempts
- 404 for missing records or profile not found
- 500 for unexpected backend errors

## 7. Leaderboard and anti-cheating behavior

The codebase includes logic for suspicious LeetCode activity detection and pending review enforcement.

Relevant implementation files include:
- [backend/src/routes/cron.routes.js](../backend/src/routes/cron.routes.js)
- [backend/ANTI_CHEATING_SYSTEM.md](../backend/ANTI_CHEATING_SYSTEM.md)
- [MENTOR_REVIEW_FIXES.md](../MENTOR_REVIEW_FIXES.md)
- [STUDENT_PENDING_REVIEW_FEATURE.md](../STUDENT_PENDING_REVIEW_FEATURE.md)

The current product behavior is:
- suspicious rapid activity can trigger a pending-review state
- students may be suspended from public leaderboard visibility
- mentors can review the queue and resolve the flag
- the frontend surfaces pending-review status to the student

## 8. Implementation notes

### Rate limiting
The backend uses express-rate-limit for:
- profile updates
- stats endpoints
- general dashboard activity

### CORS and networking
The server config in [backend/src/index.js](../backend/src/index.js) allows local development plus configured production origins, including Vercel deployment domains.

### Dead-end UX
The app intentionally renders custom fallback experiences for missing students, missing projects, and invalid route matches instead of leaving the user on a browser-default page.

## 9. Extension points

The current implementation is ready for further feature growth in areas such as:
- richer mentor analytics
- more advanced leaderboard filtering and scoring
- broader admin oversight
- additional portfolio metadata and achievements categories
- better student onboarding and validation for social and coding links
