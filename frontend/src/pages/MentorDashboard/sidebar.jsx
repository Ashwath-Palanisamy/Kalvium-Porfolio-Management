import React from "react";
import {
  FiGrid,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./mentordashboard.css";
import "./sidebar.css";
import { useState } from "react";
import KalviumLogo from "../../assets/kalvium-logo.svg";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? "is-collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-box">
          <img src={KalviumLogo} alt="Kalvium logo" className="sidebar-logo-image" />
        </div>

        <div className="logo-text">
          <h2>KALVIUM</h2>
          <span>MENTOR DASHBOARD</span>
        </div>

        <button
          type="button"
          className="collapse-btn"
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        <div className="menu-item active">
          <FiGrid className="menu-icon" />
          <span className="menu-label">Dashboard</span>
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn">
          <FiLogOut />
          <span className="menu-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;