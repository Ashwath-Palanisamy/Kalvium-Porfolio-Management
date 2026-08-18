# Anti-Cheating & Submission Approval System

## Overview
This system detects suspicious submission patterns (rapid/AI-like submissions) and flags them for mentor review before they appear on the leaderboard.

## How It Works

### 1. **Detection Phase**
- **Rapid Submission Detection**: When a student submits 2+ problems within 2 minutes (120 seconds), they are flagged as suspicious
- **Location**: `cron.routes.js` → `findRapidSubmissionIds()` function
- **Trigger**: Runs every time LeetCode profile data is synced

### 2. **Pending Review Phase**
- Flagged submissions are marked with `review_status: "pending"` and `status: "PENDING"`
- `flag_reason: "Rapid consecutive solve (< 2 minutes)"`
- Student is **temporarily removed from leaderboard** (`is_suspended: true`)
- Suspension reason: "Pending mentor review for suspicious submission patterns"

### 3. **Mentor Review Phase**
- Mentors access the review queue at `/leetcode-review/queue`
- They see all students with pending submissions
- Two actions available:
  - **Approve**: Student was not cheating, submissions are valid
  - **Reject**: Student was cheating, mark as academic integrity violation

### 4. **Resolution Phase**

#### If Approved:
- All pending submissions marked as `review_status: "approved"` and `status: "APPROVED"`
- Student suspension lifted (`is_suspended: false`)
- Student data recalculated and added to leaderboard
- Log: `[APPROVAL] User {id} | Suspension lifted - ready for leaderboard`

#### If Rejected:
- All submissions marked as `review_status: "rejected"` and `status: "REJECTED"`
- Student **permanently suspended** (`is_suspended: true`)
- Suspension reason: "Rejected for suspicious submission patterns - Academic integrity violation"
- Student cannot be reinstated without manual intervention
- Log: `[REJECTION] User {id} | Permanently suspended for academic integrity violation`

## Database Schema

### New Columns in `leetcode_leaderboard`
```sql
- is_suspended (BOOLEAN, DEFAULT false)
  → Flag for leaderboard suspension status
  
- suspension_reason (TEXT)
  → Explanation for suspension (pending review or rejection reason)
```

### Existing Columns Used
```sql
leetcode_submissions:
- review_status (ENUM: 'pending', 'approved', 'rejected')
- flag_reason (TEXT: Why submission was flagged)
- status (TEXT: Current approval status)
```

## API Endpoints

### Mentor Review Queue
```
GET /mentor-dashboard/leetcode-review/queue
Authentication: Required (Bearer token)
Response: Array of students with pending reviews
```

### Approve Submission
```
PATCH /mentor-dashboard/leetcode-review/:studentUserId/approve
Authentication: Required
Action: Approve all pending submissions for student
Side Effects: 
  - Lifts suspension if all approved
  - Updates leaderboard
  - Student appears on leaderboard next sync
```

### Reject Submission
```
PATCH /mentor-dashboard/leetcode-review/:studentUserId/reject
Authentication: Required
Action: Reject all pending submissions as cheating
Side Effects:
  - Permanent suspension
  - Student hidden from public leaderboard
  - Academic integrity flag applied
```

### Public Leaderboard
```
GET /public/leetcode-leaderboard
Authentication: Not required
Filtering: Automatically excludes is_suspended=true students
```

## Workflow Timeline

```
1. Student submits 2+ problems in <2 minutes
                 ↓
2. Cron job detects rapid submissions
                 ↓
3. Submission flagged as "pending" review
   Student added to suspension list (is_suspended=true)
                 ↓
4. Mentor sees student in review queue
                 ↓
5. Mentor reviews submission details:
   - Problem names
   - Time between submissions
   - Student profile
   - LeetCode statistics
                 ↓
6a. APPROVE                    6b. REJECT
    ├─ Mark approved           ├─ Mark rejected
    ├─ Lift suspension         ├─ Keep suspended
    ├─ Ready for leaderboard   └─ Permanent ban
    └─ Update stats
```

## Logs Generated

### During Detection
```
[RAPID SOLVE DETECTED] problem1 <-> problem2 | 45s apart
[MENTOR REVIEW FLAG] username | submission_id | Rapid consecutive solve (< 2 minutes)
```

### During Suspension Update
```
[SUSPENSION] user_id: {id} | Suspended until mentor review complete
[SUSPENSION LIFTED] user_id: {id} | All submissions approved
```

### During Mentor Action
```
[APPROVAL] User {id} | Suspension lifted - ready for leaderboard
[REJECTION] User {id} | Permanently suspended for academic integrity violation
```

## Configuration

### Detection Threshold
- **File**: `cron.routes.js`
- **Variable**: `RAPID_SOLVE_SECONDS = 120`
- **Unit**: Seconds
- **Adjustable**: Yes - modify to change detection sensitivity

### Detection Logic
```javascript
if (current_submission_time - previous_submission_time < 120 seconds) {
  flagAsRapid();
}
```

## Testing Checklist

- [ ] Student with rapid submissions appears in mentor queue
- [ ] Mentor can approve submission
- [ ] Student appears on leaderboard after approval
- [ ] Mentor can reject submission
- [ ] Rejected student does not appear on public leaderboard
- [ ] Suspended students filtered from leaderboard query
- [ ] All suspension reasons logged correctly
- [ ] Stats recalculate after approval

## Future Enhancements

1. **Appeal System**: Allow students to appeal permanent suspension
2. **Pattern Analysis**: Detect other cheating patterns (copy-paste detection)
3. **Notifications**: Email student when flagged/approved/rejected
4. **Analytics**: Track cheating detection rate over time
5. **ML Integration**: Use ML to improve detection accuracy
6. **Whitelist**: Allow mentors to whitelist specific students (e.g., power users)
