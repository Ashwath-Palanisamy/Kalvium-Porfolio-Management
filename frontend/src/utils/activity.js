// Shared LeetCode activity helpers.
//
// "Active" is derived from the last accepted LeetCode submission
// (last_solved_at) rather than the 1-day is_leetcode_active flag, so a student
// who solved earlier today still reads as active even if the daily cron (or the
// most recent mentor session) has not caught up yet.
//
// NOTE: the cron + inactivity email still use a 24h window for
// is_leetcode_active. These helpers intentionally use a 7-day window to match
// the "Active (Last 7 Days)" label on the mentor dashboard.

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

const toLastSolvedMs = (student = {}) => {
  const raw =
    student.last_solved_at ??
    student.lastSolvedAt ??
    student.leetcode_last_solved_at ??
    student.last_solved ??
    null;

  if (!raw) return NaN;

  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const getTotalSolved = (student = {}) =>
  Number(
    student.total_solved ??
      student.totalSolved ??
      student.leetcode_total_solved ??
      student.total ??
      0
  ) || 0;

// Active = has solved at least one problem AND the most recent accepted
// submission is within the window (7 days by default).
export const isRecentlyActive = (student, now = Date.now()) => {
  if (!student || getTotalSolved(student) <= 0) return false;

  const lastSolvedMs = toLastSolvedMs(student);
  if (Number.isNaN(lastSolvedMs)) return false;

  return now - lastSolvedMs <= SEVEN_DAYS_MS;
};

// Bucket: solved more than 24h ago but still within the last 7 days.
export const isOneToSixDaysInactive = (student, now = Date.now()) => {
  if (!student || getTotalSolved(student) <= 0) return false;

  const lastSolvedMs = toLastSolvedMs(student);
  if (Number.isNaN(lastSolvedMs)) return false;

  const diff = now - lastSolvedMs;
  return diff > ONE_DAY_MS && diff <= SEVEN_DAYS_MS;
};

// Extract an ISO last-solved date from a live LeetCode stats payload, whose
// recentSubmissions carry unix-seconds timestamps.
export const lastSolvedFromLeetcodeStats = (leetcodeData) => {
  const timestamp = leetcodeData?.recentSubmissions?.[0]?.timestamp;
  if (!timestamp) return null;

  const ms = Number(timestamp) * 1000;
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
};

// Last ACCEPTED submission from a live /public/leetcode payload. The endpoint
// defaults a missing statusDisplay to "Accepted", so treat it as accepted too.
export const lastAcceptedFromLeetcodeStats = (stats) => {
  const submissions = Array.isArray(stats?.recentSubmissions)
    ? stats.recentSubmissions.filter(
        (sub) => (sub?.statusDisplay || "Accepted") === "Accepted"
      )
    : [];

  return lastSolvedFromLeetcodeStats({ recentSubmissions: submissions });
};

// Overlay a fresher live last-solved timestamp onto a student record so status
// badges stay correct between leaderboard cron runs. Returns the original record
// when the live value is missing or not newer than the stored (DB) one.
export const withLiveLastSolved = (student, liveLastSolvedAt) => {
  if (!student || !liveLastSolvedAt) return student;

  const liveMs = Date.parse(liveLastSolvedAt);
  if (!Number.isFinite(liveMs)) return student;

  const dbMs = toLastSolvedMs(student);
  if (Number.isFinite(dbMs) && liveMs <= dbMs) return student;

  return { ...student, last_solved_at: new Date(liveMs).toISOString() };
};

// ==========================================
// ACCEPTED EXCEPTION HELPERS (mentor dashboard)
// ==========================================
// A student whose LeetCode exception request has been ACCEPTED must not be
// flagged as inactive while the exception window is still open. The student's
// own dashboard already shows a "Request accepted" tag; the mentor Overview /
// Assigned tabs previously ignored exception requests entirely, so an accepted
// student kept reading "1-6 Day Inactive" / "1-Day Inactive".

// Mirror the server-side window math (cron + student GET route): an "approved"
// request shields the student for `requested_days` counted from mentor approval
// (reviewed_at, falling back to updated_at / created_at). Rows without
// requested_days (pre-migration) keep a 30-day window. Returns a Set of string
// student user IDs that currently have an active accepted exception.
export const buildActiveExceptionIds = (requests = [], now = Date.now()) => {
  const ids = new Set();
  for (const r of Array.isArray(requests) ? requests : []) {
    if (!r || r.status !== "approved") continue;
    const studentId = r.student_user_id;
    if (studentId === null || studentId === undefined) continue;

    const days = Number(r.requested_days) || 30;
    const reviewedMs = Date.parse(
      r.reviewed_at || r.updated_at || r.created_at || ""
    );
    const expiresMs =
      (Number.isFinite(reviewedMs) ? reviewedMs : now) + days * ONE_DAY_MS;

    if (expiresMs > now) ids.add(String(studentId));
  }
  return ids;
};

// True when the given student currently has an active accepted exception.
export const hasActiveException = (student, activeExceptionIds) => {
  if (!student || !activeExceptionIds || activeExceptionIds.size === 0) {
    return false;
  }
  const id = student.user_id ?? student.student_user_id ?? student.id;
  return id !== undefined && id !== null && activeExceptionIds.has(String(id));
};
