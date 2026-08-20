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

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  const [userPendingReview, setUserPendingReview] = useState({
    hasPendingReview: false,
    pendingReviewCount: 0,
  });

  // Set page title
  useEffect(() => {
    document.title = "Kalvium Portfolio | Leaderboard";
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const leaderboardData = await getLeaderboardData();

        const rows = Array.isArray(leaderboardData)
          ? leaderboardData
          : [];

        const results = rows.map((entry) => {
          const profile = entry?.profiles || {};

          const easySolved = Number(entry?.easy_solved ?? 0);
          const mediumSolved = Number(entry?.medium_solved ?? 0);
          const hardSolved = Number(entry?.hard_solved ?? 0);

          const pendingReviewCount = Number(
            entry?.pending_review_count ?? 0
          );

          const isSuspended = entry?.is_suspended === true;

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

            username: entry?.leetcode_username || "",

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
              Number(entry?.total_solved) ||
              easySolved + mediumSolved + hardSolved,

            score: Number(entry?.score ?? 0),

            ranking: entry?.ranking ?? null,

            pendingReviewCount,
            isSuspended,
            isUnderReview,
          };
        });

        if (!isMounted) return;

        // Students under review should not appear
        // in the ranked leaderboard.
        const verifiedStudents = results.filter(
          (student) => !student.isUnderReview
        );

        // Sort verified students by score.
        const sorted = [...verifiedStudents].sort(
          (a, b) => b.score - a.score
        );

        setRankings(sorted);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);

        if (isMounted) {
          setError(
            "Couldn't load the leaderboard. Please try again."
          );
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

  // Check current user's pending review status
  useEffect(() => {
    let isMounted = true;

    const checkPendingReview = async () => {
      try {
        const status = await getPendingReviewStatus();

        if (isMounted) {
          setUserPendingReview({
            hasPendingReview: status?.hasPendingReview || false,
            pendingReviewCount:
              Number(status?.pendingReviewCount) || 0,
          });
        }
      } catch (err) {
        console.error(
          "Failed to check pending review status:",
          err
        );
      }
    };

    checkPendingReview();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------
  // Leaderboard calculations
  // --------------------------------

  const topThree = rankings.slice(0, 3);
  const remainingStudents = rankings.slice(3);

  const totalPages = Math.ceil(
    remainingStudents.length / ITEMS_PER_PAGE
  );

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem =
    indexOfLastItem - ITEMS_PER_PAGE;

  const currentRemainingStudents =
    remainingStudents.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  // --------------------------------
  // Helpers
  // --------------------------------

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

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages
    ) {
      setCurrentPage(newPage);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // --------------------------------
  // Render
  // --------------------------------

  return (
    <div>
      <p id="notice">
        We are upgrading this page for faster load times.
        New updates may take over 24 hours to appear.
      </p>

      <div className="leaderboard-page">

        {/* PAGE HEADER */}
        <div className="leaderboard-title">
          <div className="title-header-row">
            <h1>Leaderboard</h1>
          </div>

          <p>
            Ranked by verified LeetCode problems solved &amp;
            total points scored. Rapid consecutive solves
            (under 2 mins) are automatically held in{" "}
            <strong>Mentor Evaluation Queue</strong> before
            point allocation.
          </p>

          {/* POINTS & AUDIT BADGES */}
          <div className="points-legend">
            <span className="point-badge easy">
              Easy: {POINTS.easy} pt
            </span>

            <span className="point-badge medium">
              Medium: {POINTS.medium} pts
            </span>

            <span className="point-badge hard">
              Hard: {POINTS.hard} pts
            </span>

            <span className="point-badge review-info">
              🕒 Flagged Solves = Held for Review
            </span>
          </div>
        </div>

        {/* PENDING REVIEW NOTICE */}
        {userPendingReview.hasPendingReview && (
          <div className="leaderboard-pending-notice">
            <div className="pending-notice-content">
              <span className="pending-icon">
                ⏳
              </span>

              <div>
                <strong>
                  Your submissions are under mentor review
                </strong>

                <p>
                  You have{" "}
                  {userPendingReview.pendingReviewCount} rapid
                  submission
                  {userPendingReview.pendingReviewCount !== 1
                    ? "s"
                    : ""}{" "}
                  awaiting verification. Once approved,
                  you'll appear on the leaderboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="pending-notice-button"
              onClick={() => navigate("/profile")}
            >
              View Status
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="leaderboard-error">
            {error}
          </div>
        )}

        {/* LOADING */}
        {isLoading ? (
          <div className="leaderboard-loading">
            Loading leaderboard...
          </div>
        ) : rankings.length === 0 ? (
          <div className="leaderboard-empty">
            No students with a LeetCode profile yet.
          </div>
        ) : (
          <>
            {/* =========================
                TOP 3 PODIUM
            ========================== */}
            {topThree.length > 0 && (
              <div className="podium">

                {/* SECOND PLACE */}
                {topThree[1] && (
                  <div
                    className="podium-card second-place"
                    onClick={() =>
                      handleStudentClick(topThree[1])
                    }
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
                      <strong>
                        {topThree[1].score}
                      </strong>{" "}
                      pts
                    </div>

                    {topThree[1].pendingReviewCount > 0 && (
                      <div
                        className="pending-badge"
                        title="Pending mentor review for fast consecutive solves"
                      >
                        ⏳{" "}
                        {topThree[1].pendingReviewCount}{" "}
                        in Review
                      </div>
                    )}

                    <div className="problem-stats">
                      <div>
                        <strong className="easy-text">
                          {topThree[1].easySolved}
                        </strong>
                        <span>Easy</span>
                      </div>

                      <div>
                        <strong className="medium-text">
                          {topThree[1].mediumSolved}
                        </strong>
                        <span>Medium</span>
                      </div>

                      <div>
                        <strong className="hard-text">
                          {topThree[1].hardSolved}
                        </strong>
                        <span>Hard</span>
                      </div>
                    </div>

                    <div className="podium-rank">
                      2
                    </div>
                  </div>
                )}

                {/* FIRST PLACE */}
                {topThree[0] && (
                  <div
                    className="podium-card first-place"
                    onClick={() =>
                      handleStudentClick(topThree[0])
                    }
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
                      <strong>
                        {topThree[0].score}
                      </strong>{" "}
                      pts
                    </div>

                    {topThree[0].pendingReviewCount > 0 && (
                      <div
                        className="pending-badge"
                        title="Pending mentor review for fast consecutive solves"
                      >
                        ⏳{" "}
                        {topThree[0].pendingReviewCount}{" "}
                        in Review
                      </div>
                    )}

                    <div className="problem-stats">
                      <div>
                        <strong className="easy-text">
                          {topThree[0].easySolved}
                        </strong>
                        <span>Easy</span>
                      </div>

                      <div>
                        <strong className="medium-text">
                          {topThree[0].mediumSolved}
                        </strong>
                        <span>Medium</span>
                      </div>

                      <div>
                        <strong className="hard-text">
                          {topThree[0].hardSolved}
                        </strong>
                        <span>Hard</span>
                      </div>
                    </div>

                    <div className="podium-rank first-rank">
                      1
                    </div>
                  </div>
                )}

                {/* THIRD PLACE */}
                {topThree[2] && (
                  <div
                    className="podium-card third-place"
                    onClick={() =>
                      handleStudentClick(topThree[2])
                    }
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
                      <strong>
                        {topThree[2].score}
                      </strong>{" "}
                      pts
                    </div>

                    {topThree[2].pendingReviewCount > 0 && (
                      <div
                        className="pending-badge"
                        title="Pending mentor review for fast consecutive solves"
                      >
                        ⏳{" "}
                        {topThree[2].pendingReviewCount}{" "}
                        in Review
                      </div>
                    )}

                    <div className="problem-stats">
                      <div>
                        <strong className="easy-text">
                          {topThree[2].easySolved}
                        </strong>
                        <span>Easy</span>
                      </div>

                      <div>
                        <strong className="medium-text">
                          {topThree[2].mediumSolved}
                        </strong>
                        <span>Medium</span>
                      </div>

                      <div>
                        <strong className="hard-text">
                          {topThree[2].hardSolved}
                        </strong>
                        <span>Hard</span>
                      </div>
                    </div>

                    <div className="podium-rank">
                      3
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================
                REMAINING STUDENTS TABLE
            ========================== */}
            {remainingStudents.length > 0 && (
              <>
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

                  {currentRemainingStudents.map(
                    (student, index) => {
                      const rank =
                        indexOfFirstItem +
                        index +
                        4;

                      return (
                        <div
                          className="table-row"
                          key={
                            student.user_id ||
                            `${student.username}-${rank}`
                          }
                          onClick={() =>
                            handleStudentClick(student)
                          }
                        >
                          <div className="table-row-header" style={{ display: 'contents' }}>
                            <div className="table-rank">
                              #{rank}
                            </div>

                            <div className="table-student">
                              <img
                                src={getAvatar(student)}
                                alt={student.name}
                              />

                              <div>
                                <strong>
                                  {student.name}
                                </strong>

                                <span>
                                  @
                                  {cleanUsername(
                                    student.username
                                  )}
                                </span>
                              </div>

                              {student.pendingReviewCount >
                                0 && (
                                <span
                                  className="table-pending-pill"
                                  title="Solves under mentor evaluation"
                                >
                                  ⏳{" "}
                                  {
                                    student.pendingReviewCount
                                  }{" "}
                                  review
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="table-stats-grid" style={{ display: 'contents' }}>
                            <div className="easy-number">
                              {student.easySolved}
                            </div>

                            <div className="medium-number">
                              {student.mediumSolved}
                            </div>

                            <div className="hard-number">
                              {student.hardSolved}
                            </div>

                            <div className="total-number">
                              {student.total}
                            </div>

                            <div className="points-number">
                              {student.score}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* =========================
                    PAGINATION
                ========================== */}
                {totalPages > 1 && (
                  <div className="pagination-controls">

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1
                        )
                      }
                    >
                      ← Previous
                    </button>

                    <div className="pagination-numbers">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          type="button"
                          key={page}
                          className={`pagination-num ${
                            currentPage === page
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handlePageChange(page)
                          }
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          currentPage + 1
                        )
                      }
                    >
                      Next →
                    </button>

                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;