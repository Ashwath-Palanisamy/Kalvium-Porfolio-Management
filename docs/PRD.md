# Product Requirements Document (PRD)

## 1. Product Overview
Kalvium Portfolio Management is a web platform that helps Kalvium students showcase their skills, projects, and achievements while enabling mentors and recruiters to discover and evaluate student talent quickly.

## 2. Problem Statement
Students often have their work spread across multiple places such as GitHub, LinkedIn, resumes, and personal portfolios. Mentors and recruiters need a single place to view student progress, capabilities, and portfolio quality.

## 3. Target Users
- Students: create and maintain their portfolio profile.
- Mentors: review student profiles, track progress, and identify strengths.
- Recruiters: discover candidates with relevant skills and projects.

## 4. Product Goals
- Provide a polished student portfolio experience.
- Make student discovery simple and searchable.
- Offer a mentor-friendly dashboard for performance visibility.
- Integrate public developer metrics from GitHub and LeetCode.

## 5. Scope
### In Scope for MVP
- User authentication and protected profile management.
- Student profile creation and update.
- Student listing and search by name or skill.
- Public profile view for individual students.
- Mentor dashboard layout for student overview.
- GitHub and LeetCode stat enrichment.

### Out of Scope
- Payment or subscription workflows.
- Real-time chat or messaging.
- Full analytics dashboard with advanced reporting.
- Multi-tenant enterprise administration.

## 6. Functional Requirements
1. Authentication
   - Users must be able to sign in and access protected routes.
   - Authenticated requests must use bearer token validation.

2. Profile Management
   - Students can view and update their portfolio details.
   - Profile fields may include name, title, email, GitHub/LeetCode links, resume URL, and squad information.

3. Student Discovery
   - Users can browse all students.
   - Search should support name and skill-based lookup.

4. Public Portfolio Views
   - Each student should have an individual portfolio page.
   - Profile data should be rendered in a way that is easy to read.

5. Mentor Experience
   - Mentors should see a consolidated dashboard layout for student information.

6. External Metrics
   - The system should fetch GitHub repository and follower counts.
   - The system should fetch LeetCode submission statistics when a URL is provided.

## 7. Non-Functional Requirements
- Security: protection of user data through authenticated APIs and token validation.
- Privacy: the platform must not expose any sensitive or private information publicly. Only approved non-sensitive profile fields should be displayed in public portfolio views.
- Resume Handling: resumes must be supported through a link-only flow. The system should not require or encourage direct file uploads to the platform.
- Reliability: handle invalid or missing tokens gracefully.
- Performance: avoid unnecessary page reloads and support responsive UI rendering.
- Maintainability: code should be modular and documented for future feature expansion.

## 8. Success Metrics
- Number of student profiles completed.
- Number of visits to student portfolio pages.
- Mentor dashboard usage.
- Frequency of successful GitHub and LeetCode stat fetches.

## 9. Release Plan
### Phase 1
- Core authentication and profile update flows.
- Student card list and search.

### Phase 2
- Enhanced portfolio page experience.
- Mentor dashboard improvements.

### Phase 3
- Broader integrations and recruiter-oriented features.
