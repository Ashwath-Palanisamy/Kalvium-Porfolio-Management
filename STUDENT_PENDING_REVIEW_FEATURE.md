# Student Pending Review Feature - Complete Implementation Guide

## Overview
Implemented a comprehensive system where students with rapid LeetCode solves are held from the leaderboard pending mentor review. Students are notified about pending reviews and can check their status.

## Changes Made

### 1. Backend - Student Dashboard Route

**File:** `backend/src/routes/student_dashboard.routes.js`

**New Endpoint:** `GET /student/dashboard/pending-review`
- **Authentication:** Requires valid JWT token
- **Rate Limit:** 120 requests per 60 seconds
- **Purpose:** Returns pending review status for the authenticated student

**Request:**
```bash
GET /student/dashboard/pending-review
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "hasPendingReview": true,
  "pendingReviewCount": 2,
  "submissions": [
    {
      "id": "sub-id-1",
      "submission_id": "123456",
      "title_slug": "two-sum",
      "difficulty": "EASY",
      "submitted_at": "2026-08-18T10:15:00Z",
      "flag_reason": "Rapid consecutive solve (< 2 minutes)",
      "review_status": "pending"
    },
    {
      "id": "sub-id-2",
      "submission_id": "123457",
      "title_slug": "add-two-numbers",
      "difficulty": "MEDIUM",
      "submitted_at": "2026-08-18T10:16:30Z",
      "flag_reason": "Rapid consecutive solve (< 2 minutes)",
      "review_status": "pending"
    }
  ],
  "profile": {
    "name": "Navya",
    "leetcode_username": "navya_d16"
  }
}
```

### 2. Frontend - API Client

**File:** `frontend/src/api/routes/StudentDashboard/dashboard.js`

**New Function:** `getPendingReviewStatus()`
- Fetches pending review status for current student
- Returns safe defaults if not authenticated
- Handles errors gracefully

```javascript
export async function getPendingReviewStatus() {
    // Fetches from /student/dashboard/pending-review
    // Returns status object or empty defaults
}
```

### 3. Frontend - Pending Review Banner Component

**File:** `frontend/src/components/PendingReviewBanner.jsx`
**Styles:** `frontend/src/components/PendingReviewBanner.css`

**Features:**
- Displays alert banner if student has pending reviews
- Shows list of flagged submissions with problem names and difficulty
- Displays pending count
- "View Mentor Review" button to navigate to review status
- Auto-hides when no pending reviews
- Animated entrance with pulsing icon
- Responsive design for all screen sizes

**Displays:**
```
⏳ Pending Mentor Review

You have 2 rapid LeetCode submission(s) awaiting mentor verification.

Flagged Submissions:
  ⏱ two-sum (EASY)
  ⏱ add-two-numbers (MEDIUM)

Until approved, your profile won't appear on the public leaderboard.

[View Mentor Review →]
```

### 4. Frontend - Student Dashboard Integration

**File:** `frontend/src/pages/studentdashboard/DashboardTab.jsx`

**Changes:**
- Imported `PendingReviewBanner` component
- Added banner at top of student profile view
- Shows immediately when student has pending submissions

**Location:** Top of student dashboard, before coding stats

### 5. Frontend - Leaderboard Protection

**File:** `frontend/src/pages/LeaderBoard/leaderboard.jsx`

**Changes:**
1. Added `getPendingReviewStatus` import
2. Added state to track user's pending review status
3. Added useEffect to check pending status on page load
4. Added notification banner if user has pending reviews
5. Banner shows pending count and "View Status" button
6. Students with pending reviews still don't appear in leaderboard (backend filtering)

**Leaderboard Banner:**
```
⏳ Your submissions are under mentor review

You have 2 rapid submission(s) awaiting verification.
Once approved, you'll appear on the leaderboard.

[View Status]
```

**File:** `frontend/src/pages/LeaderBoard/leaderboard.css`

**New Styles:**
- `.leaderboard-pending-notice` - Main banner container
- `.pending-notice-content` - Text and icon wrapper
- `.pending-notice-button` - Action button
- Responsive variants for mobile and tablet

## Complete User Flow

### Scenario 1: Student Solves Rapidly
```
1. Student solves LeetCode problem A at 10:15:00
2. Student solves LeetCode problem B at 10:16:30 (< 2 minutes)
   ↓
3. Cron job detects rapid solves
   ↓
4. Both submissions saved as:
   - review_status: "pending"
   - status: "PENDING"
   - flag_reason: "Rapid consecutive solve (< 2 minutes)"
   ↓
5. Student logs in → Sees PendingReviewBanner on dashboard
   - Lists both problems
   - Shows "2 rapid submissions awaiting mentor verification"
   ↓
6. Student navigates to Leaderboard
   - Sees banner: "Your submissions are under mentor review"
   - Does NOT appear in ranked leaderboard
   - Backend filters them out (GET /public/leetcode-leaderboard)
```

### Scenario 2: Mentor Approves
```
1. Mentor opens Mentor Review page
2. Sees student with "2 pending reviews"
3. Clicks "Approve" button
   ↓
4. Backend updates submissions:
   - review_status: "approved" ✓
   - status: "APPROVED" ✓
   - flag_reason: null
   ↓
5. Frontend removes student from review queue
   - PendingReviewBanner disappears from student dashboard
   - Leaderboard notice disappears
   ↓
6. Next leaderboard fetch includes the student
7. Student appears in rankings with correct score
```

### Scenario 3: Mentor Rejects
```
1. Mentor opens Mentor Review page
2. Sees student with "2 pending reviews"
3. Clicks "Reject" button
   ↓
4. Backend updates submissions:
   - review_status: "rejected" ✓
   - status: "REJECTED" ✓
   ↓
5. Frontend removes student from review queue
6. PendingReviewBanner disappears from dashboard
7. Student still does NOT appear on leaderboard
   (rejected submissions still filtered out)
8. Points not awarded for rejected rapid solves
```

## Database Changes Involved

**No new tables needed.** Uses existing `leetcode_submissions` fields:
- `review_status` (pending/approved/rejected)
- `status` (PENDING/APPROVED/REJECTED)
- `flag_reason` (Rapid consecutive solve message)
- `user_id` (Links to student)

## Security & Privacy

✅ Students can only see their own pending reviews (RLS enforced)
✅ Endpoint uses JWT authentication
✅ Rate limited (120 req/60s per user)
✅ Frontend API tokens secure
✅ Backend-only database queries
✅ No credentials exposed

## Testing Checklist

### Test 1: Student Sees Pending Review Banner on Dashboard
```bash
# Prerequisites:
# - Student has rapid LeetCode submissions
# - review_status = "pending" in database

# Action:
1. Log in as student
2. Navigate to Profile/Dashboard tab
3. Look at top of page

# Expected:
✅ Red banner appears with alert icon
✅ Shows "⏳ Pending Mentor Review"
✅ Lists 2 flagged submissions
✅ Shows problem names and difficulty
✅ "View Mentor Review" button visible
```

### Test 2: Student Can't See Self on Leaderboard
```bash
# Prerequisites:
# - Same as Test 1

# Action:
1. Log in as student with pending review
2. Navigate to Leaderboard page
3. Search for your name in rankings

# Expected:
✅ Orange/yellow banner appears at top
✅ Shows "Your submissions are under mentor review"
✅ Shows "2 rapid submissions awaiting verification"
✅ Your profile is NOT in the ranked list
✅ Other students with no pending reviews ARE visible
```

### Test 3: Banner Disappears After Approval
```bash
# Prerequisites:
# - You have pending review (from Test 1)
# - Logged in as mentor

# Action:
1. Navigate to Mentor Review page
2. Find your student
3. Click "Approve" button
4. Return to student account
5. Refresh dashboard

# Expected:
✅ PendingReviewBanner is GONE
✅ Student profile now shows correct LeetCode stats
✅ Navigate to Leaderboard
✅ Leaderboard notice is GONE
✅ Your profile IS visible in rankings
```

### Test 4: Rejected Submissions Don't Award Points
```bash
# Prerequisites:
# - You have pending submissions
# - Logged in as mentor

# Action:
1. Navigate to Mentor Review page
2. Find your student
3. Click "Reject" button
4. Return to student account
5. Refresh dashboard

# Expected:
✅ PendingReviewBanner disappears
✅ Student profile shows initial LeetCode stats
✅ Navigate to Leaderboard
✅ You still DO NOT appear (rejected = not counted)
✅ Next cron sync keeps them rejected (not re-flagged)
```

### Test 5: Normal Fast Solves Still Work
```bash
# Prerequisites:
# - Solve problems normally (>2 minutes apart)

# Action:
1. Solve LeetCode problem A
2. Wait 3+ minutes
3. Solve LeetCode problem B
4. Wait for cron sync
5. Check dashboard and leaderboard

# Expected:
✅ NO PendingReviewBanner
✅ Submissions automatically approved
✅ Points awarded immediately
✅ Profile appears on leaderboard
✅ Rank and score visible
```

### Test 6: Persistence After Cron Sync
```bash
# Prerequisites:
# - Student has approved submissions
# - (from Test 3)

# Action:
1. Wait for next LeetCode cron job
2. OR manually trigger: POST /cron/update-leetcode
3. Check database and leaderboard

# Expected:
✅ Approved submissions remain approved
✅ Status unchanged: review_status = "approved"
✅ Student still appears on leaderboard
✅ Points and ranking preserved
```

## API Test Commands

### Check Pending Review Status
```bash
curl -X GET http://localhost:8000/student/dashboard/pending-review \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json"
```

### Get Leaderboard (Excludes Pending Students)
```bash
curl -X GET http://localhost:8000/public/leetcode-leaderboard \
  -H "Content-Type: application/json"
```

### Database Query: Check Pending Submissions
```sql
SELECT 
  user_id, 
  leetcode_username,
  submission_id, 
  title_slug,
  review_status,
  status,
  flag_reason,
  submitted_at
FROM leetcode_submissions
WHERE review_status = 'pending'
ORDER BY user_id, submitted_at DESC;
```

### Database Query: Verify Leaderboard Stats
```sql
SELECT 
  user_id,
  leetcode_username,
  easy_solved,
  medium_solved,
  hard_solved,
  total_solved,
  score,
  ranking
FROM leetcode_leaderboard
WHERE user_id IN (
  SELECT DISTINCT user_id 
  FROM leetcode_submissions 
  WHERE review_status = 'pending'
)
ORDER BY user_id;
```

## Component Dependencies

**PendingReviewBanner.jsx depends on:**
- `lucide-react` (icons: AlertTriangle, Clock, ArrowRight)
- `react-router-dom` (useNavigate)
- `dashboard.js` (getPendingReviewStatus)
- `PendingReviewBanner.css`

**DashboardTab.jsx imports:**
- `PendingReviewBanner` component

**Leaderboard.jsx imports:**
- `getPendingReviewStatus` from dashboard API
- leaderboard.css (new pending-notice styles)

## No Breaking Changes

✅ Existing leaderboard endpoint still works (filters students)
✅ Existing mentor review endpoints unchanged
✅ Existing cron sync logic unchanged
✅ Existing student profile endpoints unchanged
✅ No database schema changes needed
✅ All approvals/rejections fully functional

## Performance Notes

- Banner component uses lightweight state
- No real-time polling (checked on page load only)
- Leaderboard query already filtered (no new overhead)
- API endpoint uses indexed fields (user_id, review_status)
- CSS animations are performant (transform/opacity)

## Future Enhancements

Optional improvements:
1. **Real-time notifications** - WebSocket for instant updates
2. **Bulk review actions** - Mentor approve multiple at once
3. **Appeal process** - Students can request re-review
4. **Detailed analytics** - Track approval rate per student
5. **Email notifications** - Alert student when reviewed
6. **Ban threshold** - Auto-flag repeat rapid solvers
7. **Custom thresholds** - Configurable rapid-solve timing

## File Summary

| File | Type | Purpose |
|------|------|---------|
| `backend/src/routes/student_dashboard.routes.js` | Backend | New GET /pending-review endpoint |
| `frontend/src/api/routes/StudentDashboard/dashboard.js` | Frontend API | getPendingReviewStatus function |
| `frontend/src/components/PendingReviewBanner.jsx` | Component | Banner component + logic |
| `frontend/src/components/PendingReviewBanner.css` | Styles | Banner styling |
| `frontend/src/pages/studentdashboard/DashboardTab.jsx` | Page | Integrated banner into dashboard |
| `frontend/src/pages/LeaderBoard/leaderboard.jsx` | Page | Added pending check + banner |
| `frontend/src/pages/LeaderBoard/leaderboard.css` | Styles | Added pending notice styles |

## Troubleshooting

### Banner Not Showing
- Check browser console for errors
- Verify JWT token is valid
- Confirm student has pending submissions in database
- Check Network tab: GET /student/dashboard/pending-review returns data

### Leaderboard Notice Not Appearing
- Same checks as above
- Verify user is authenticated
- Check API response status

### Student Still on Leaderboard
- Verify backend filtered them out
- Check database: SELECT * FROM leetcode_submissions WHERE user_id = 'xxx' AND review_status = 'pending'
- If results exist, restart backend server

### Approved Student Not Appearing
- Check database: review_status should be 'approved'
- Verify leaderboard endpoint was called after approval
- Check browser cache (hard refresh)

## Support

For questions about:
- **Rapid-solve detection:** See MENTOR_REVIEW_FIXES.md
- **Mentor review workflow:** See MENTOR_REVIEW_FIXES.md
- **Leaderboard filtering:** Check public.routes.js line 372-450
- **Cron sync logic:** Check cron.routes.js (preserves approved/rejected state)
