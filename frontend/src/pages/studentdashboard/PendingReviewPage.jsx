import React from "react";
import { Link } from "react-router-dom";
import { Home, Clock, CheckCircle2, XCircle } from "lucide-react";
import "./PendingReviewPage.css";

export default function PendingReviewPage({ reviewData }) {
  const { submissions = [], profile = {}, pendingReviewCount = 0 } = reviewData;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY":
        return "difficulty-easy";
      case "MEDIUM":
        return "difficulty-medium";
      case "HARD":
        return "difficulty-hard";
      default:
        return "difficulty-unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle2 size={18} className="status-icon approved" />;
      case "rejected":
        return <XCircle size={18} className="status-icon rejected" />;
      default:
        return <Clock size={18} className="status-icon pending" />;
    }
  };

  return (
    <div className="pending-review-page">
      <header className="prp-header">
        <div className="prp-header-content">
          <div className="prp-logo">
            <span className="prp-logo-emoji">⏳</span>
            <h1 className="prp-title">Pending Mentor Review</h1>
          </div>
          <Link to="/" className="prp-home-btn">
            <Home size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="prp-main">
        <div className="prp-container">
          {/* Status Card */}
          <div className="prp-status-card">
            <div className="status-header">
              <div className="status-badge">
                <Clock className="status-badge-icon" />
                <span>Under Review</span>
              </div>
              <p className="status-subtitle">
                Your LeetCode submission(s) have been flagged for rapid consecutive solving.
              </p>
            </div>

            <div className="status-info">
              <div className="info-block">
                <span className="info-label">Profile</span>
                <span className="info-value">{profile?.name || "Student"}</span>
              </div>
              <div className="info-block">
                <span className="info-label">LeetCode Username</span>
                <span className="info-value">
                  {profile?.leetcode_username || "Not linked"}
                </span>
              </div>
              <div className="info-block">
                <span className="info-label">Total Solved</span>
                <span className="info-value">{profile?.total_solved || 0}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Problems Flagged</span>
                <span className="info-value pending-count">{pendingReviewCount}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="prp-message">
            <h2>What Happens Next?</h2>
            <p>
              Our mentor team reviews rapid consecutive submissions to ensure code authenticity and learning integrity. 
              Your submissions will be reviewed within 24-48 hours. Until approved, your profile will remain hidden from the public leaderboard.
            </p>
          </div>

          {/* Submissions List */}
          <div className="prp-submissions">
            <h2>Flagged Submissions ({submissions.length})</h2>

            {submissions.length > 0 ? (
              <div className="submissions-list">
                {submissions.map((submission, idx) => (
                  <div key={submission.id || idx} className="submission-card">
                    <div className="submission-header">
                      <div className="submission-title-block">
                        <h3 className="submission-title">
                          {submission.title_slug?.replace(/-/g, " ") || "Unknown Problem"}
                        </h3>
                        <div className="submission-meta">
                          <span className={`difficulty-badge ${getDifficultyColor(submission.difficulty)}`}>
                            {submission.difficulty || "UNKNOWN"}
                          </span>
                          <span className="flag-reason">
                            {submission.flag_reason || "Rapid consecutive solve"}
                          </span>
                        </div>
                      </div>
                      <div className="submission-status">
                        {getStatusIcon(submission.review_status)}
                        <span className="status-text">
                          {submission.review_status?.charAt(0).toUpperCase() +
                            submission.review_status?.slice(1) || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="submission-footer">
                      <span className="submitted-time">
                        Submitted:{" "}
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-submissions">
                <p>✅ No pending submissions at this time.</p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="prp-help">
            <h2>Need Help?</h2>
            <p>
              If you believe this is a mistake or have questions about your review status, 
              please contact your mentor or the Kalvium support team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
