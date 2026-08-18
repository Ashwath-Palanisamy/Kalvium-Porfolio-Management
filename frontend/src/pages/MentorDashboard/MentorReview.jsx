import React, { useEffect, useState } from "react";
import "./mentorReview.css";

const MentorReview = ({ profile }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);

      // We will connect this to your Render backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mentor/dashboard/reviews`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching mentor reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (reviewId, decision) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/mentor/dashboard/reviews/${reviewId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            decision,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      // Remove reviewed item from the queue
      setReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );

    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="mentor-review-page">
        <div className="review-header">
          <h1>Mentor Review</h1>
          <p>Loading flagged submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-review-page">

      <div className="review-header">
        <div>
          <h1>Mentor Review</h1>
          <p>
            Review suspiciously fast LeetCode submissions before
            awarding leaderboard points.
          </p>
        </div>

        <div className="review-count">
          {reviews.length} Pending
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <div className="no-review-icon">✓</div>

          <h2>No pending reviews</h2>

          <p>
            All flagged submissions have been reviewed.
          </p>
        </div>
      ) : (
        <div className="review-list">

          {reviews.map((review) => (
            <div className="review-card" key={review.id}>

              <div className="review-student">

                <img
                  src={
                    review.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      review.student_name || "Student"
                    )}&background=ffdddd&color=d71920`
                  }
                  alt={review.student_name}
                  className="review-avatar"
                />

                <div>
                  <h3>{review.student_name}</h3>

                  <p>
                    @{review.leetcode_username}
                  </p>
                </div>

              </div>

              <div className="review-problem">

                <span className="review-label">
                  Problem
                </span>

                <strong>
                  {review.problem_title || "Unknown Problem"}
                </strong>

              </div>

              <div className="review-stats">

                <div>
                  <span>Difficulty</span>
                  <strong>
                    {review.difficulty || "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Solve Time</span>
                  <strong className="fast-time">
                    {review.solve_time_seconds}s
                  </strong>
                </div>

                <div>
                  <span>Detected</span>
                  <strong>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleString()
                      : "-"}
                  </strong>
                </div>

              </div>

              <div className="review-warning">
                ⚠️ This submission was completed unusually quickly.
                Please verify that the student solved the problem
                independently.
              </div>

              <div className="review-actions">

                <button
                  className="reject-btn"
                  onClick={() =>
                    handleReview(review.id, "rejected")
                  }
                >
                  Reject
                </button>

                <button
                  className="approve-btn"
                  onClick={() =>
                    handleReview(review.id, "approved")
                  }
                >
                  Approve
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default MentorReview;