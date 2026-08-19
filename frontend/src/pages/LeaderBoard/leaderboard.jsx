import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboardData } from "../../api/routes/Public/leaderboard";
import { getPendingReviewStatus } from "../../api/routes/StudentDashboard/dashboard";
import "./leaderboard.css";

const POINTS = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

// Helper to extract clean username if full URL is stored in database
function cleanUsername(username) {
  if (!username) return "";
  if (username.includes("leetcode.com")) {
    const parts = username.replace(/\/$/, "").split("/");
    return parts[parts.length - 1];
  }
  return username;
}

function Leaderboard() {
  const navigate = useNavigate();

  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPendingReview, setUserPendingReview] = useState({
    hasPendingReview: false,
    pendingReviewCount: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const leaderboardData = await getLeaderboardData();
        const rows = Array.isArray(leaderboardData) ? leaderboardData : [];

        const results = rows.map((entry) => {
          const profile = entry?.profiles || {};
          const easySolved = entry?.easy_solved ?? 0;
          const mediumSolved = entry?.medium_solved ?? 0;
          const hardSolved = entry?.hard_solved ?? 0;

          // ============================================================
          // ANTI-CHEAT / MENTOR REVIEW STATUS
          // ============================================================

          const pendingReviewCount =
            Number(entry?.pending_review_count ?? 0);

          const isSuspended =
            entry?.is_suspended === true;

          const isUnderReview =
            isSuspended ||
            entry?.is_under_review === true ||
            pendingReviewCount > 0;

          return {
            user_id:
              entry?.user_id ||
              entry?.profile_id ||
              entry?.id,

            name:
              profile?.name ||
              entry?.leetcode_username ||
              "Unknown Student",

            username:
              entry?.leetcode_username || "",

            avatar:
              profile?.avatar_url &&
                profile.avatar_url.trim() !== ""
                ? profile.avatar_url
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile?.name ||
                  entry?.leetcode_username ||
                  "Student"
                )}&background=ffdddd&color=d71920&size=256`,

            easySolved,
            mediumSolved,
            hardSolved,

            total:
              entry?.total_solved ??
              easySolved +
              mediumSolved +
              hardSolved,

            score:
              entry?.score ?? 0,

            ranking:
              entry?.ranking ?? null,

            // Anti-cheat
            pendingReviewCount,
            isSuspended,
            isUnderReview,
          };
        });

        if (!isMounted) return;

        // Students with pending reviews should not appear in the ranked leaderboard
        const verifiedStudents = results.filter(
          (student) => !student.isUnderReview
        );

        // Sort only verified students by score
        const sorted = verifiedStudents.sort(
          (a, b) => b.score - a.score
        );

        setRankings(sorted);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);

        if (isMounted) {
          setError("Couldn't load the leaderboard. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if current user has pending reviews
  useEffect(() => {
    let isMounted = true;

    const checkPendingReview = async () => {
      try {
        const status = await getPendingReviewStatus();
        if (isMounted) {
          setUserPendingReview({
            hasPendingReview: status.hasPendingReview || false,
            pendingReviewCount: status.pendingReviewCount || 0,
          });
        }
      } catch (error) {
        console.error("Failed to check pending review status:", error);
      }
    };

    checkPendingReview();

    return () => {
      isMounted = false;
    };
  }, []);

  const topThree = rankings.slice(0, 3);
  const remainingStudents = rankings.slice(3);

  const getAvatar = (student) => {
    if (student?.avatar) {
      return student.avatar;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      student?.name || "Student"
    )}&background=ffdddd&color=d71920&size=256`;
  };

  const handleStudentClick = (student) => {
    if (student?.user_id) {
      navigate(`/portfolio/${student.user_id}`);
    }
  };

  return (
    <div className="leaderboard-page">
      {/* PAGE HEADER */}
      <title>Kalvium Portfolio | Leaderboard</title>
      <div className="leaderboard-title">
        <div className="title-header-row">
          <h1>Leaderboard</h1>
        </div>
        <p>
          Ranked by verified LeetCode problems solved & total points scored.
          Rapid consecutive solves (under 2 mins) are automatically held in <strong>Mentor Evaluation Queue</strong> before point allocation.
        </p>

        {/* POINTS & AUDIT BADGES */}
        <div className="points-legend">
          <span className="point-badge easy">Easy: {POINTS.easy} pt</span>
          <span className="point-badge medium">Medium: {POINTS.medium} pts</span>
          <span className="point-badge hard">Hard: {POINTS.hard} pts</span>
          <span className="point-badge review-info">🕒 Flagged Solves = Held for Review</span>
        </div>
      </div>

      {/* PENDING REVIEW NOTICE - If current user has pending reviews */}
      {userPendingReview.hasPendingReview && (
        <div className="leaderboard-pending-notice">
          <div className="pending-notice-content">
            <span className="pending-icon">⏳</span>
            <div>
              <strong>Your submissions are under mentor review</strong>
              <p>
                You have {userPendingReview.pendingReviewCount} rapid submission
                {userPendingReview.pendingReviewCount !== 1 ? "s" : ""} awaiting verification.
                Once approved, you'll appear on the leaderboard.
              </p>
            </div>
          </div>
          <button
            className="pending-notice-button"
            onClick={() => navigate("/profile")}
          >
            View Status
          </button>
        </div>
      )}

      {error && <div className="leaderboard-error">{error}</div>}

      {/* LOADING */}
      {isLoading ? (
        <div className="leaderboard-loading">Loading leaderboard...</div>
      ) : rankings.length === 0 ? (
        <div className="leaderboard-empty">
          No students with a LeetCode profile yet.
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {topThree.length > 0 && (
            <div className="podium">
              {/* SECOND PLACE */}
              {topThree[1] && (
                <div
                  className="podium-card second-place"
                  onClick={() => handleStudentClick(topThree[1])}
                >
                  <img
                    src={getAvatar(topThree[1])}
                    alt={topThree[1].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[1].name}</h2>

                  <p className="podium-username">
                    @{cleanUsername(topThree[1].username)}
                  </p>

                  <div className="podium-points-badge">
                    <strong>{topThree[1].score}</strong> pts
                  </div>

                  {topThree[1].pendingReviewCount > 0 && (
                    <div className="pending-badge" title="Pending mentor review for fast consecutive solves">
                      ⏳ {topThree[1].pendingReviewCount} in Review
                    </div>
                  )}

                  <div className="problem-stats">
                    <div>
                      <strong className="easy-text">{topThree[1].easySolved}</strong>
                      <span>Easy</span>
                    </div>
                    <div>
                      <strong className="medium-text">{topThree[1].mediumSolved}</strong>
                      <span>Medium</span>
                    </div>
                    <div>
                      <strong className="hard-text">{topThree[1].hardSolved}</strong>
                      <span>Hard</span>
                    </div>
                  </div>

                  <div className="podium-rank">2</div>
                </div>
              )}

              {/* FIRST PLACE */}
              {topThree[0] && (
                <div
                  className="podium-card first-place"
                  onClick={() => handleStudentClick(topThree[0])}
                >
                  <img
                    src={getAvatar(topThree[0])}
                    alt={topThree[0].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[0].name}</h2>

                  <p className="podium-username">
                    @{cleanUsername(topThree[0].username)}
                  </p>

                  <div className="podium-points-badge highlight">
                    <strong>{topThree[0].score}</strong> pts
                  </div>

                  {topThree[0].pendingReviewCount > 0 && (
                    <div className="pending-badge" title="Pending mentor review for fast consecutive solves">
                      ⏳ {topThree[0].pendingReviewCount} in Review
                    </div>
                  )}

                  <div className="problem-stats">
                    <div>
                      <strong className="easy-text">{topThree[0].easySolved}</strong>
                      <span>Easy</span>
                    </div>
                    <div>
                      <strong className="medium-text">{topThree[0].mediumSolved}</strong>
                      <span>Medium</span>
                    </div>
                    <div>
                      <strong className="hard-text">{topThree[0].hardSolved}</strong>
                      <span>Hard</span>
                    </div>
                  </div>

                  <div className="podium-rank first-rank">1</div>
                </div>
              )}

              {/* THIRD PLACE */}
              {topThree[2] && (
                <div
                  className="podium-card third-place"
                  onClick={() => handleStudentClick(topThree[2])}
                >
                  <img
                    src={getAvatar(topThree[2])}
                    alt={topThree[2].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[2].name}</h2>

                  <p className="podium-username">
                    @{cleanUsername(topThree[2].username)}
                  </p>

                  <div className="podium-points-badge">
                    <strong>{topThree[2].score}</strong> pts
                  </div>

                  {topThree[2].pendingReviewCount > 0 && (
                    <div className="pending-badge" title="Pending mentor review for fast consecutive solves">
                      ⏳ {topThree[2].pendingReviewCount} in Review
                    </div>
                  )}

                  <div className="problem-stats">
                    <div>
                      <strong className="easy-text">{topThree[2].easySolved}</strong>
                      <span>Easy</span>
                    </div>
                    <div>
                      <strong className="medium-text">{topThree[2].mediumSolved}</strong>
                      <span>Medium</span>
                    </div>
                    <div>
                      <strong className="hard-text">{topThree[2].hardSolved}</strong>
                      <span>Hard</span>
                    </div>
                  </div>

                  <div className="podium-rank">3</div>
                </div>
              )}
            </div>
          )}

          {/* TABLE */}
          {remainingStudents.length > 0 && (
            <div className="leaderboard-table">
              <div className="table-header">
                <span>RANK</span>
                <span>STUDENT</span>
                <span>EASY</span>
                <span>MEDIUM</span>
                <span>HARD</span>
                <span>TOTAL</span>
                <span>POINTS</span>
              </div>

              {remainingStudents.map((student, index) => {
                const rank = index + 4;

                return (
                  <div
                    className="table-row"
                    key={student.user_id}
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="table-rank">#{rank}</div>

                    <div className="table-student">
                      <img src={getAvatar(student)} alt={student.name} />

                      <div>
                        <strong>{student.name}</strong>
                        <span>@{cleanUsername(student.username)}</span>
                      </div>

                      {student.pendingReviewCount > 0 && (
                        <span className="table-pending-pill" title="Solves under mentor evaluation">
                          ⏳ {student.pendingReviewCount} review
                        </span>
                      )}
                    </div>

                    <div className="easy-number">{student.easySolved}</div>
                    <div className="medium-number">{student.mediumSolved}</div>
                    <div className="hard-number">{student.hardSolved}</div>
                    <div className="total-number">{student.total}</div>
                    <div className="points-number">{student.score}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Leaderboard;