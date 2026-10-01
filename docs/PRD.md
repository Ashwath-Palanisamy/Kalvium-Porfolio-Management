# Product Requirements Document (PRD)

## 1. Product overview

Kalvium Portfolio Management is a student-first talent discovery and tracking platform. It helps students present their work in a clean public portfolio while giving mentors a structured way to monitor coding progress, review suspicious activity, and support student growth.

The system combines public profile views, role-based dashboards, and external coding metrics from GitHub and LeetCode into a single experience for discovery and mentoring.

## 2. Problem statement

Students typically scatter important signals of ability across multiple platforms: GitHub repositories, LeetCode activity, personal portfolios, and project documentation. Mentors need a single view that reduces manual checking and helps them evaluate growth, engagement, and potential issues quickly.

The product solves this by centralizing student identity, public project and achievement data, and mentoring signals in one app.

## 3. Target users

### Students
- Create and maintain a public portfolio
- Add projects, skills, and achievements
- Update profile and social links
- Track GitHub and LeetCode activity
- Review mentor review state when flagged for suspicious submissions

### Mentors
- Manage squad assignments
- View student overview data and coding activity
- Review flagged LeetCode submissions
- Approve or reject pending review cases
- Remove students from public leaderboard visibility when a review is still pending

### Recruiters and visitors
- Browse public student profiles
- Explore projects and achievements
- Review leaderboard activity for active contributors

## 4. Product goals

- Provide a polished public portfolio experience for students
- Make it easy for mentors to identify active students and review issue-prone cases
- Surface coding progress in a standardized way using GitHub and LeetCode data
- Prevent leaderboard contamination from suspicious rapid-solve patterns through review enforcement
- Keep role access clearly separated between student and mentor workflows

## 5. Scope

### In scope
- Authentication and protected dashboard access
- Student edit profile flow
- Public student profile and project pages
- Achievement management workflow
- Public leaderboard and student discovery pages
- GitHub and LeetCode stat retrieval integration
- Mentor squad management and review queue
- Suspended or pending-review state handling in leaderboard logic

### Out of scope
- Payment or subscription models
- Chat or direct messaging
- Full enterprise admin orchestration
- Resume file uploads or document storage as a primary workflow
- Real-time collaborative editing or social feeds

## 6. Functional requirements

### 6.1 Authentication and role access
1. Users must be able to sign in through the frontend.
2. Protected routes must validate bearer tokens against Supabase.
3. Student areas must reject non-student sessions.
4. Mentor areas must reject non-mentor sessions.
5. Role resolution must rely on app metadata rather than user metadata to prevent privilege escalation.

### 6.2 Student profile management
1. Students can fetch and update their profile details.
2. Public profile data includes name, title, social links, GitHub and LeetCode references, and portfolio metadata.
3. Students can manage project entries and achievement entries from their dashboard.
4. Student profile rows are created or updated on demand.

### 6.3 Public portfolio experience
1. Users can browse all students or view a single profile by user ID.
2. Individual student pages render public projects and achievements.
3. Public pages skip sensitive data and keep non-public profile information out of the public UI.

### 6.4 Leaderboard and discovery
1. A public leaderboard surfaces students with coding activity.
2. Students with active or recent LeetCode solves are displayed as active contributors.
3. Students flagged for suspicious rapid solving are withheld from leaderboard visibility until mentor review is resolved.

### 6.5 Mentor dashboard
1. Mentors can view overall squad activity and student overview information.
2. Mentors can assign or manage squad memberships.
3. Mentors can review queued suspicious submissions and approve or reject them.
4. Approved students can resume normal leaderboard visibility; rejected or pending cases remain controlled.

### 6.6 External integrations
1. The app fetches GitHub stats by extracting a username from a profile URL.
2. The app fetches LeetCode stats via the official GraphQL endpoint.
3. Stats retrieval must fail gracefully with validation or network errors.

### 6.7 Anti-cheating and review flow
1. Rapid or suspicious LeetCode solve patterns can trigger a pending review status.
2. The student is temporarily suspended from public leaderboard visibility.
3. The mentor review queue shows the review state and allows approval or rejection decisions.
4. The student receives a pending-review state in the dashboard experience.

## 7. Non-functional requirements

- Security: backend auth and role guards must validate every protected request.
- Privacy: public routes must not expose sensitive personal or private profile fields.
- Reliability: invalid or missing tokens should return clear error responses.
- Performance: rate limiting protects expensive stats and profile endpoints.
- Maintainability: frontend route and backend controller responsibilities are separated by feature area.
- Observability: server logs should capture review-suspension, auth, and external API failures.

## 8. Success metrics

- Number of student profiles completed and maintained
- Percentage of active students with visible GitHub and LeetCode data
- Mentor engagement with the dashboard and review queue
- Reduction of suspicious leaderboard entries through review enforcement
- Portfolio page engagement and student discovery volume

## 9. Release and product status

### Current implementation status
The repository is already operating as a working multi-role portfolio platform with public discovery, dashboard management, and mentor review workflows. The current codebase emphasizes product polish for student portfolios and mentor oversight, rather than a generic static profile app.

### Near-term improvement themes
- Expand analytics for mentor decision-making
- Improve the student review experience and messaging around review decisions
- Add richer profile validation and onboarding guidance
- Increase coverage for public endpoint and route integrity
