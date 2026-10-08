import React from "react";
import { ShieldAlert } from "lucide-react";
import "./MentorReview.css";

// NOT IMPLEMENTED - Mentor Review (rapid-solve queue) is disabled.
// Kept as a stub so old imports fail visibly instead of silently.
const MentorReview = () => {
  return (
    <div className="mentor-review-page">
      <div className="empty-review">
        <ShieldAlert size={45} />
        <h2>Mentor Review is not implemented</h2>
        <p>This section has been disabled. Please use Exception Requests instead.</p>
      </div>
    </div>
  );
};

export default MentorReview;
