import React from "react";
import { Link } from "react-router-dom";
import "./mentordashboard.css";
import "./dashboardcontent.css";

const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      {/* Header */}
      <header className="topbar">
        <div className="welcome">
          <p>Welcome back,</p>
          <h3>Arun Kumar</h3>
        </div>
        <div className="topbar-right">
          <Link to="/" className="topbar-home-btn">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Dashboard */}
      <section className="dashboard-section">
        <h1>Mentor Dashboard</h1>
        <p>Track your students and their progress.</p>

        <div className="stats-card">
          <div className="stats-icon">👥</div>

          <span>Total Students</span>

          <h2>48</h2>

          <p>All students under your mentorship.</p>

          <button>View Students →</button>
        </div>
      </section>
    </div>
  );
};

export default DashboardContent;