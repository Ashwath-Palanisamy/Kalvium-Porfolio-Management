import { useEffect, useState } from "react";
import "./MentorReview.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function MentorReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/mentor/dashboard/leaderboard/reviews`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error loading mentor reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReview = async (submissionId, decision) => {
    try {
      setProcessingId(submissionId);

      const response = await fetch(
        `${API_URL}/mentor/dashboard/leaderboard/review/${submissionId}`,
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

      // Remove reviewed item from the pending list
      setReviews((current) =>
        current.filter((review) => review.id !== submissionId)
      );
    } catch (error) {
      console.error("Review error:", error);
      alert("Could not update the review.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mentor-review">
        <h2>Mentor Review</h2>
        <p>Loading pending reviews...</p>
      </div>
    );
  }

  return (
    <section className="mentor-review">
      <div className="review-header">
        <div>
          <h2>Mentor Review</h2>
          <p>
            Review rapid consecutive LeetCode solves before they receive
            leaderboard points.
          </p>
        </div>

        <span className="review-count">
          {reviews.length} Pending
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <h3>🎉 No pending reviews</h3>
          <p>All LeetCode submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-student">
                <img
                  src={
                    review.profiles?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      review.profiles?.name || "Student"
                    )}`
                  }
                  alt={review.profiles?.name || "Student"}
                />

                <div>
                  <h3>
                    {review.profiles?.name || "Unknown Student"}
                  </h3>

                  <p>
                    @{review.leetcode_username || "unknown"}
                  </p>
                </div>
              </div>

              <div className="review-problem">
                <span>Problem</span>
                <strong>{review.problem_name}</strong>
              </div>

              <div className="review-details">
                <div>
                  <span>Difficulty</span>
                  <strong>{review.difficulty}</strong>
                </div>

                <div>
                  <span>Time Gap</span>
                  <strong className="rapid-time">
                    {review.time_gap_seconds}s
                  </strong>
                </div>

                <div>
                  <span>Reason</span>
                  <strong>Rapid consecutive solve</strong>
                </div>
              </div>

              <div className="review-actions">
                <button
                  className="approve-btn"
                  disabled={processingId === review.id}
                  onClick={() =>
                    handleReview(review.id, "approved")
                  }
                >
                  ✓ Approve
                </button>

                <button
                  className="reject-btn"
                  disabled={processingId === review.id}
                  onClick={() =>
                    handleReview(review.id, "rejected")
                  }
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}