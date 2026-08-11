import { useEffect, useState } from "react";
import { getAllStudents, getLeetcodeStats } from "../../api/routes/Public/StudentInfo";
import { useNavigate } from "react-router-dom";
import "./leaderboard.css";

const POINTS = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

function calculateScore(easySolved, mediumSolved, hardSolved) {
  return (
    easySolved * POINTS.easy +
    mediumSolved * POINTS.medium +
    hardSolved * POINTS.hard
  );
}

function Leaderboard() {
  const navigate = useNavigate();

  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const students = await getAllStudents();

        const withLeetcode = students.filter((student) => student.leetcode);

        const results = await Promise.all(
          withLeetcode.map(async (student) => {
            try {
              const stats = await getLeetcodeStats(student.leetcode);

              const easySolved = stats?.easySolved || 0;
              const mediumSolved = stats?.mediumSolved || 0;
              const hardSolved = stats?.hardSolved || 0;

              return {
                user_id: student.user_id,
                name: student.name || "Unknown Student",
                username: student.leetcode,
                avatar:
                  student.avatar_url && student.avatar_url.trim() !== ""
                    ? student.avatar_url
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        student.name || "Student"
                      )}&background=ffdddd&color=d71920&size=256`,

                easySolved,
                mediumSolved,
                hardSolved,

                total:
                  easySolved +
                  mediumSolved +
                  hardSolved,

                score: calculateScore(
                  easySolved,
                  mediumSolved,
                  hardSolved
                ),

                failed: false,
              };
            } catch (err) {
              return {
                user_id: student.user_id,
                name: student.name || "Unknown Student",
                username: student.leetcode,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  student.name || "Student"
                )}&background=ffdddd&color=d71920&size=256`,
                easySolved: 0,
                mediumSolved: 0,
                hardSolved: 0,
                total: 0,
                score: 0,
                failed: true,
              };
            }
          })
        );

        if (!isMounted) return;

        const sorted = results.sort((a, b) => b.score - a.score);

        setRankings(sorted);
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
      <div className="leaderboard-title">
        <h1>Leaderboard</h1>
        <p>Ranked by LeetCode problems solved.</p>
      </div>

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
          {/* TOP 3 */}
          {topThree.length > 0 && (
            <div className="podium">

              {/* SECOND */}
              {topThree[1] && (
                <div
                  className="podium-card second-place"
                  onClick={() => handleStudentClick(topThree[1])}
                >
                  <div className="medal silver-medal">
                    2
                  </div>

                  <img
                    src={getAvatar(topThree[1])}
                    alt={topThree[1].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[1].name}</h2>

                  <p className="podium-username">
                    @{topThree[1].username}
                  </p>

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

              {/* FIRST */}
              {topThree[0] && (
                <div
                  className="podium-card first-place"
                  onClick={() => handleStudentClick(topThree[0])}
                >
                  <div className="medal gold-medal">
                    1
                  </div>

                  <img
                    src={getAvatar(topThree[0])}
                    alt={topThree[0].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[0].name}</h2>

                  <p className="podium-username">
                    @{topThree[0].username}
                  </p>

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

              {/* THIRD */}
              {topThree[2] && (
                <div
                  className="podium-card third-place"
                  onClick={() => handleStudentClick(topThree[2])}
                >
                  <div className="medal bronze-medal">
                    3
                  </div>

                  <img
                    src={getAvatar(topThree[2])}
                    alt={topThree[2].name}
                    className="podium-avatar"
                  />

                  <h2>{topThree[2].name}</h2>

                  <p className="podium-username">
                    @{topThree[2].username}
                  </p>

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
              </div>

              {remainingStudents.map((student, index) => {
                const rank = index + 4;

                return (
                  <div
                    className="table-row"
                    key={student.user_id}
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="table-rank">
                      #{rank}
                    </div>

                    <div className="table-student">
                      <img
                        src={getAvatar(student)}
                        alt={student.name}
                      />

                      <div>
                        <strong>{student.name}</strong>
                        <span>
                          @{student.username}
                        </span>
                      </div>
                    </div>

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