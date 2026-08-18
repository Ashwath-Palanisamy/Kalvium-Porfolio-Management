-- Migration: Add suspension tracking for cheating detection
-- This migration adds columns to track student suspensions from the leaderboard
-- when they have pending mentor reviews for suspicious submission patterns

-- Add suspension tracking columns to leetcode_leaderboard table
ALTER TABLE leetcode_leaderboard
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT DEFAULT NULL;

-- Create index on is_suspended for faster queries
CREATE INDEX IF NOT EXISTS idx_leetcode_leaderboard_is_suspended 
ON leetcode_leaderboard(is_suspended);

-- Create index on user_id and review_status in leetcode_submissions for faster pending checks
CREATE INDEX IF NOT EXISTS idx_leetcode_submissions_user_review 
ON leetcode_submissions(user_id, review_status);

-- Add comment documentation
COMMENT ON COLUMN leetcode_leaderboard.is_suspended IS 
'Flag indicating if student is suspended from leaderboard due to pending mentor review';

COMMENT ON COLUMN leetcode_leaderboard.suspension_reason IS 
'Reason for suspension - either pending review or rejection for cheating';
