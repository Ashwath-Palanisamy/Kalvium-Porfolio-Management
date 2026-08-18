import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPendingReviewStatus } from "../api/routes/StudentDashboard/dashboard";
import "./PendingReviewBanner.css";

export default function PendingReviewBanner() {
    const navigate = useNavigate();
    const [reviewStatus, setReviewStatus] = useState({
        hasPendingReview: false,
        pendingReviewCount: 0,
        submissions: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await getPendingReviewStatus();
                setReviewStatus(status);
            } catch (error) {
                console.error("Failed to fetch review status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, []);

    if (isLoading || !reviewStatus.hasPendingReview) {
        return null;
    }

    const handleViewReview = () => {
        // Navigate to mentor dashboard review page
        navigate("/mentor-review");
    };

    return (
        <div className="pending-review-banner">
            <div className="pending-review-content">
                <div className="pending-review-icon">
                    <AlertTriangle size={24} />
                </div>

                <div className="pending-review-message">
                    <h3>⏳ Pending Mentor Review</h3>
                    <p>
                        You have <strong>{reviewStatus.pendingReviewCount}</strong> rapid LeetCode 
                        submission{reviewStatus.pendingReviewCount !== 1 ? "s" : ""} awaiting mentor verification.
                    </p>
                    <div className="pending-submissions-list">
                        {reviewStatus.submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="pending-submission-item"
                            >
                                <Clock size={14} />
                                <span>
                                    <strong>{submission.title_slug}</strong> ({submission.difficulty})
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="pending-note">
                        Until approved, your profile won't appear on the public leaderboard.
                    </p>
                </div>
            </div>

            <button
                className="pending-review-button"
                onClick={handleViewReview}
            >
                View Mentor Review
                <ArrowRight size={16} />
            </button>
        </div>
    );
}
