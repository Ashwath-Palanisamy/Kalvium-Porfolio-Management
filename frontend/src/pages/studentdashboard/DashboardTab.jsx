import { Code2, Globe, Link2 } from "lucide-react";
import "./DashboardTab.css";

export default function DashboardTab({ profile, fileName, isLoading }) {
  if (isLoading) {
    return (
      <div className="dt-container">
        {/* Skeleton Overview Cards Row */}
        <div className="pm-grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pm-profile-card dt-card">
              <div className="skeleton skeleton-text width-40 mb-12" style={{ height: "20px" }}></div>
              <div className="skeleton skeleton-text width-100 mb-16" style={{ height: "16px" }}></div>
              <div className="skeleton skeleton-input" style={{ height: "36px" }}></div>
            </div>
          ))}
        </div>

        {/* Skeleton Quick Summary Section */}
        <div className="dt-status-section">
          <div className="skeleton skeleton-text width-30 mb-16" style={{ height: "22px" }}></div>
          <div className="dt-status-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dt-status-item">
                <div className="skeleton skeleton-text width-40 mb-8" style={{ height: "12px" }}></div>
                <div className="skeleton skeleton-text width-60" style={{ height: "20px" }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dt-container">
      {/* Overview Cards Row */}
      <div className="pm-grid-3">
        {/* GitHub Card */}
        <div className="pm-profile-card dt-card">
          <div className="dt-card-header">
            <Code2 size={20} color="#e53e3e" />
            <h3 className="dt-card-title">GitHub</h3>
          </div>
          <p className="dt-card-text">
            {profile.github ? profile.github : "Not linked yet"}
          </p>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="pm-save-btn dt-action-btn">
              View GitHub
            </a>
          )}
        </div>

        {/* LinkedIn Card */}
        <div className="pm-profile-card dt-card">
          <div className="dt-card-header">
            <Globe size={20} color="#3182ce" />
            <h3 className="dt-card-title">LinkedIn</h3>
          </div>
          <p className="dt-card-text">
            {profile.linkedin ? profile.linkedin : "Not linked yet"}
          </p>
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="pm-save-btn dt-action-btn">
              View LinkedIn
            </a>
          )}
        </div>

        {/* LeetCode Card */}
        <div className="pm-profile-card dt-card">
          <div className="dt-card-header">
            <Link2 size={20} color="#d69e2e" />
            <h3 className="dt-card-title">LeetCode</h3>
          </div>
          <p className="dt-card-text">
            {profile.leetcode ? profile.leetcode : "Not linked yet"}
          </p>
          {profile.leetcode && (
            <a href={profile.leetcode} target="_blank" rel="noopener noreferrer" className="pm-save-btn dt-action-btn">
              View LeetCode
            </a>
          )}
        </div>
      </div>

      {/* Quick Summary Section */}
      <div className="dt-status-section">
        <h3 className="dt-status-heading">Profile Quick Status</h3>
        <div className="dt-status-grid">
          <div className="dt-status-item">
            <span className="dt-status-label">SQUAD</span>
            <p className="dt-status-value">{profile.squadId || "Not Assigned"}</p>
          </div>
          <div className="dt-status-item">
            <span className="dt-status-label">RESUME STATUS</span>
            <p className={`dt-status-value ${fileName ? "is-success" : ""}`}>
              {fileName ? "Uploaded" : "Missing"}
            </p>
          </div>
          <div className="dt-status-item">
            <span className="dt-status-label">ROLE / TITLE</span>
            <p className="dt-status-value">{profile.title || "Not Set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}