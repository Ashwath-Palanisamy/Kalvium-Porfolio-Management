import React from "react";
import Sidebar from "./sidebar";
import DashboardContent from "./dashboardcontent";
import StudentsSection from "./studentinfo";


import "./mentordashboard.css";

const MentorDashboard = () => {
  return (
    <div className="mentor-dashboard">

      <Sidebar />

      <div className="dashboard-main">

        <DashboardContent />

        <div className="students-layout">
          <div className="students-left">
            <StudentsSection />
          </div>
        </div>

      </div>

    </div>
  );
};

export default MentorDashboard;