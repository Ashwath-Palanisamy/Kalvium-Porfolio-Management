# Project Documentation

This folder contains the active product and engineering documentation for the repository. The documents below reflect the implementation that is currently live in the frontend and backend code.

## Documentation index

- [PRD.md](./PRD.md): product goals, user flows, scope, and success criteria for the Kalvium portfolio platform.
- [HLD.md](./HLD.md): system overview, service boundaries, data flow, integrations, and security model.
- [LLD.md](./LLD.md): repository structure, module responsibilities, dashboard routes, and API contracts.

## Current product focus

The current implementation includes:

- Student portfolios and public profile pages
- Student project and achievement management
- Mentor dashboard workflows with squads and overview views
- LeetCode and GitHub stat integration
- Leaderboard visibility and anti-cheating suspension logic
- Role-based access enforcement for student and mentor areas

## Related implementation notes

- [../MENTOR_REVIEW_FIXES.md](../MENTOR_REVIEW_FIXES.md): details the mentor review fix and queue flow
- [../STUDENT_PENDING_REVIEW_FEATURE.md](../STUDENT_PENDING_REVIEW_FEATURE.md): covers the student pending-review experience

## Repository-level overview

The codebase is split between a Vite React frontend and an Express backend backed by Supabase. The frontend handles public pages and role-specific dashboard pages, while the backend enforces auth, authorization, data access, and external integration logic.
