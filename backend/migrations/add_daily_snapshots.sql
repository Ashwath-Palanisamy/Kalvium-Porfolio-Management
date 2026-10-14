-- Migration: Daily LeetCode snapshots for monthly consistency graph
-- One row per student per day. Written once per day by POST /cron/update-leetcode.
-- Zero extra LeetCode requests: snapshot reuses data already fetched by the cron
-- (total_solved + recent submissions) + approved exception windows.
-- The Assigned tab "View Stats" modal reads this table to render a monthly graph:
-- from the 1st of the month, each day = completed / missed / exception / future.

CREATE TABLE IF NOT EXISTS leetcode_daily_snapshots (
  user_id TEXT NOT NULL,
  profile_id UUID NULL,
  date DATE NOT NULL,
  total_solved INT NOT NULL DEFAULT 0,
  solved_count INT NOT NULL DEFAULT 0,
  did_solve BOOLEAN NOT NULL DEFAULT FALSE,
  had_exception BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Fast monthly lookups: GET /mentor/dashboard/student-monthly-activity/:userId?month=YYYY-MM
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_date
ON leetcode_daily_snapshots(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date
ON leetcode_daily_snapshots(date DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- Access model: backend reads/writes this table ONLY with the
-- service-role client (supabaseAdmin), which bypasses RLS —
-- same pattern as leetcode_leaderboard / leetcode_submissions.
-- So: enable RLS (deny-by-default) and add NO permissive
-- policies. anon + authenticated get zero direct access; all
-- reads go through the mentor-authenticated monthly API which
-- enforces the assigned-student check server-side.
-- ============================================================
ALTER TABLE leetcode_daily_snapshots ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE leetcode_daily_snapshots IS
'One row per student per calendar day (Asia/Kolkata). Powers the Assigned tab monthly consistency graph.';
COMMENT ON COLUMN leetcode_daily_snapshots.solved_count IS
'Questions solved that calendar day (counted from recent submissions at snapshot time).';
COMMENT ON COLUMN leetcode_daily_snapshots.had_exception IS
'An approved exception covered this day at snapshot time. The monthly API also overlays current exception windows so late approvals still colour past days.';
