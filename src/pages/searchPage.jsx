import React, { useState } from "react";
import "./SearchPage.css";
import { FiSearch, FiFilter, FiBookmark, FiChevronDown, FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

const studentsData = [
  { id: 1, name: "Dhinesh Babu", role: "AI Developer", skills: ["Python", "ML", "TensorFlow"] },
  { id: 2, name: "Ashwin", role: "Web Developer", skills: ["React", "Node.js", "MongoDB"] },
  { id: 3, name: "Ashwath", role: "Flutter Developer", skills: ["Flutter", "Dart", "Firebase"] },
  { id: 4, name: "Nithya", role: "UI Developer", skills: ["Figma", "UI/UX", "Photoshop"] },
  { id: 5, name: "Priya Dharshini", role: "Full Stack Developer", skills: ["JavaScript", "Express", "SQL"] },
  { id: 6, name: "Karthik", role: "Backend Developer", skills: ["Node.js", "Express", "MongoDB"] },
  { id: 7, name: "Harini", role: "Data Scientist", skills: ["Python", "Pandas", "Power BI"] },
  { id: 8, name: "Vikram", role: "DevOps Engineer", skills: ["AWS", "Docker", "Kubernetes"] },
  { id: 9, name: "Sneha", role: "Mobile App Developer", skills: ["Flutter", "Dart", "SQLite"] },
  { id: 10, name: "Rohith", role: "AI/ML Engineer", skills: ["Python", "Scikit-learn", "NLP"] },
  { id: 11, name: "Santhosh", role: "Frontend Developer", skills: ["React", "Tailwind CSS", "JS"] },
  { id: 12, name: "Janani", role: "Product Designer", skills: ["Figma", "UI/UX", "Illustrator"] },
];

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("developer");

  return (
    <div className="search-page-container">
      {/* Top Header Section */}
      <div className="search-header-top">
        <div className="search-title-box">
          <h1>Search Results</h1>
          <p>
            Showing results for <span className="highlight">"{searchTerm}"</span>
          </p>
        </div>
        <div className="main-search-input-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="search-icon" size={20} />
        </div>
      </div>

      <div className="search-content-layout">
        {/* Left Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-header">
            <h3>Refine Search</h3>
            <FiFilter />
          </div>

          <div className="filter-group">
            <div className="filter-group-title">
              <h4>Domain</h4>
              <FiChevronDown />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> All Domains
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Web Development
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Mobile Development
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Data Science
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> AI / ML
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> UI / UX
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> DevOps
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Backend Development
            </label>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">
              <h4>Skills</h4>
              <FiChevronDown />
            </div>
            <div className="sidebar-search-box">
              <input type="text" placeholder="Search skills..." />
              <FiSearch />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" /> React
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Node.js
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Python
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> JavaScript
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Flutter
            </label>
            <button className="show-more-btn">
              Show More <FiChevronDown />
            </button>
          </div>

          <div className="filter-group">
            <div className="filter-group-title">
              <h4>Batch</h4>
              <FiChevronDown />
            </div>
            <select className="batch-select">
              <option>All Batches</option>
              <option>2023</option>
              <option>2024</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-clear">Clear Filters</button>
            <button className="btn-apply">Apply Filters</button>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="search-results-area">
          <div className="results-top-bar">
            <p>Found <span className="highlight-text">128</span> students</p>
            <div className="sort-box">
              <span>Sort by:</span>
              <select className="sort-select">
                <option>Relevance</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="results-grid">
            {studentsData.map((student) => (
              <div className="result-card" key={student.id}>
                <div className="card-top-icons">
                  <span className="student-rank">{student.id}</span>
                  <FiBookmark className="bookmark-icon" />
                </div>
                
                {/* Profile Placeholder */}
                <div className="profile-img-placeholder">
                   <img src="sfad" alt={student.name} />
                </div>
                
                <h4>{student.name}</h4>
                <p className="student-role">{student.role}</p>
                
                <div className="skills-tags">
                  {student.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                
                <button className="btn-view-profile">
                  View Profile <FiArrowRight />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="page-btn"><FiChevronLeft /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">11</button>
            <button className="page-btn"><FiChevronRight /></button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SearchPage;