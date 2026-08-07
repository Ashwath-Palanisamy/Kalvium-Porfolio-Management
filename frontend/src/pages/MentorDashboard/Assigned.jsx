import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Search, Mail, Users, UserX, UserPlus, X, Check, Filter, 
  Loader2, Activity, ExternalLink, Code2, FileText, Clock, GitCommit, CheckCircle2, FolderGit2
} from "lucide-react";
import { useCodingStats } from "../../hooks/useCodingStats";
import { getAssignedStudents, getStudents, assignStudent, unassignStudent } from "../../api/routes/MentorDashboard/main.js";
import "./assigned.css";

// Brand SVG Icons matching DashboardContent
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const SparklesIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

// Helper for Student Initials Avatar
const StudentAvatar = ({ name }) => {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  return <div className="student-avatar">{initials}</div>;
};

// Inline platform badges for table cells
const PlatformBadges = ({ student }) => {
  const platforms = [
    { key: "github", url: student.github, label: "GitHub", icon: <GithubIcon size={12} /> },
    { key: "leetcode", url: student.leetcode, label: "LeetCode", icon: <Code2 size={12} /> },
    { key: "linkedin", url: student.linkedin, label: "LinkedIn", icon: <LinkedinIcon size={12} /> }
  ].filter(p => p.url);

  if (!platforms.length) return <span className="no-platforms-label">No linked profiles</span>;

  return (
    <div className="platform-chips-container">
      {platforms.map(({ key, url, label, icon }) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`platform-chip ${key}`}>
          {icon}
          <span className="chip-text">{label}</span>
          <ExternalLink size={10} className="chip-ext" />
        </a>
      ))}
    </div>
  );
};

// Rich Coding Stats & Profiles Modal matching DashboardContent
const StudentStatsModal = ({ student, onClose }) => {
  const { 
    github: githubStats, 
    leetcode: leetcodeStats, 
    loading: isFetchingStats 
  } = useCodingStats(student?.github, student?.leetcode);

  const hasGitHubActivity = githubStats?.recentRepo || (githubStats?.recentEvents?.length > 0);
  const hasLeetCodeActivity = leetcodeStats?.recentSubmissions?.length > 0;
  const hasAnyActivity = hasGitHubActivity || hasLeetCodeActivity;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title-row">
              <h3>{student.name || student.full_name}</h3>
              {student.squad_id && (
                <span className="squad-badge">Squad {student.squad_id}</span>
              )}
            </div>
            {student.title && <p className="subtext">{student.title}</p>}
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={18} /></button>
        </div>

        <div className="modal-body">
          {student.bio && <p className="modal-bio">"{student.bio}"</p>}

          {/* Contact Details */}
          <div className="modal-info-group">
            <div className="section-label">Contact Details</div>
            {(student.kalvium_email || student.email) && (
              <div className="meta-item">
                <Mail size={14} />
                <span>Kalvium: {student.kalvium_email || student.email}</span>
              </div>
            )}
            {student.personal_email && (
              <div className="meta-item">
                <Mail size={14} />
                <span>Personal: {student.personal_email}</span>
              </div>
            )}
          </div>

          {/* Coding Profiles & Live Stats */}
          <div className="modal-info-group" style={{ marginTop: 20 }}>
            <div className="group-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="section-label">Coding Profiles & Live Stats</div>
              {isFetchingStats && (
                <span className="fetching-indicator" style={{ fontSize: "12px", display: "flex", gap: "4px", alignItems: "center" }}>
                  <Loader2 size={12} className="spin-icon" /> Fetching stats...
                </span>
              )}
            </div>

            <div className="modal-links-grid" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {/* LeetCode Card */}
              {student.leetcode && (
                <div className="modal-link-card leetcode">
                  <div className="card-main">
                    <Code2 size={18} />
                    <div className="card-info">
                      <div className="card-title-row">
                        <strong>LeetCode</strong>
                        <a href={student.leetcode} target="_blank" rel="noopener noreferrer">
                          View Profile <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                  {leetcodeStats && (
                    <div className="api-stats-pills" style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                      {leetcodeStats.totalSolved !== undefined && (
                        <span className="stat-pill primary">Solved: <strong>{leetcodeStats.totalSolved}</strong></span>
                      )}
                      {leetcodeStats.easySolved !== undefined && (
                        <span className="stat-pill easy">Easy: {leetcodeStats.easySolved}</span>
                      )}
                      {leetcodeStats.mediumSolved !== undefined && (
                        <span className="stat-pill medium">Med: {leetcodeStats.mediumSolved}</span>
                      )}
                      {leetcodeStats.hardSolved !== undefined && (
                        <span className="stat-pill hard">Hard: {leetcodeStats.hardSolved}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* GitHub Card */}
              {student.github && (
                <div className="modal-link-card github">
                  <div className="card-main">
                    <GithubIcon size={18} />
                    <div className="card-info">
                      <div className="card-title-row">
                        <strong>GitHub</strong>
                        <a href={student.github} target="_blank" rel="noopener noreferrer">
                          View Repositories <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                  {githubStats && (
                    <div className="api-stats-pills" style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                      {githubStats.followers !== undefined && (
                        <span className="stat-pill primary">Followers: <strong>{githubStats.followers}</strong></span>
                      )}
                      {(githubStats.repos !== undefined || githubStats.public_repos !== undefined) && (
                        <span className="stat-pill">Repos: <strong>{githubStats.repos ?? githubStats.public_repos}</strong></span>
                      )}
                      {githubStats.contributions !== undefined && (
                        <span className="stat-pill">Contributions: <strong>{githubStats.contributions}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn */}
              {student.linkedin && (
                <div className="modal-link-card linkedin">
                  <div className="card-main">
                    <LinkedinIcon size={18} />
                    <div className="card-info">
                      <div className="card-title-row">
                        <strong>LinkedIn</strong>
                        <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
                          View Profile <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resume */}
              {student.resume_url && (
                <div className="modal-link-card resume">
                  <div className="card-main">
                    <FileText size={18} />
                    <div className="card-info">
                      <div className="card-title-row">
                        <strong>Resume</strong>
                        <a href={student.resume_url} target="_blank" rel="noopener noreferrer">
                          View PDF Resume <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="modal-info-group" style={{ marginTop: 20 }}>
            <div className="group-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="section-label">Recent Activity</div>
              <Activity size={14} className="activity-heading-icon" />
            </div>

            {isFetchingStats ? (
              <div className="modal-loading-state" style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "10px" }}>
                <Loader2 size={16} className="spin-icon" />
                <span>Loading activity feed...</span>
              </div>
            ) : (
              <div className="activity-timeline" style={{ marginTop: "10px" }}>
                {githubStats?.recentRepo && (
                  <div className="activity-item github-activity">
                    <FolderGit2 size={15} className="activity-icon gh-icon" />
                    <div className="activity-details">
                      <span className="activity-title">
                        Updated project <strong>{githubStats.recentRepo}</strong>
                      </span>
                      <span className="activity-meta"><Clock size={11} /> Latest Repository • GitHub</span>
                    </div>
                  </div>
                )}

                {githubStats?.recentEvents?.length > 0 &&
                  githubStats.recentEvents.slice(0, 2).map((evt, idx) => (
                    <div key={`gh-${idx}`} className="activity-item github-activity">
                      <GitCommit size={15} className="activity-icon gh-icon" />
                      <div className="activity-details">
                        <span className="activity-title">
                          {evt.message || evt.description || "Pushed code update"}
                        </span>
                        <span className="activity-meta">
                          <Clock size={11} /> {evt.timeAgo || "Recently"} • {evt.repoName || "GitHub"}
                        </span>
                      </div>
                    </div>
                  ))}

                {leetcodeStats?.recentSubmissions?.length > 0 &&
                  leetcodeStats.recentSubmissions.slice(0, 2).map((sub, idx) => (
                    <div key={`lc-${idx}`} className="activity-item leetcode-activity">
                      <CheckCircle2 size={15} className="activity-icon lc-icon" />
                      <div className="activity-details">
                        <span className="activity-title">
                          Solved <strong>{sub.title}</strong>
                        </span>
                        <span className="activity-meta">
                          <Clock size={11} /> {sub.timeAgo || "Recently"} • LeetCode
                        </span>
                      </div>
                    </div>
                  ))}

                {!hasAnyActivity && (
                  <p className="no-links-text" style={{ fontSize: "13px", color: "#64748b" }}>
                    No recent submission or commit activity found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Assigned() {
  const [assigned, setAssigned] = useState([]);
  const [notAdded, setNotAdded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mainSearch, setMainSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [squadFilter, setSquadFilter] = useState("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch both assigned records and complete student profiles in parallel
      const [assignedData, allStudents] = await Promise.all([
        getAssignedStudents(), 
        getStudents()
      ]);

      // 2. Build a lookup map of full profiles keyed by student ID
      const fullProfileMap = new Map();
      (allStudents || []).forEach((student) => {
        const id = student.id || student.user_id;
        if (id) fullProfileMap.set(String(id), student);
      });

      // 3. Merge complete profile information into assigned students
      const mergedAssigned = (assignedData || []).map((assignedStudent) => {
        const studentId = String(assignedStudent.student_user_id || assignedStudent.id);
        const detailedProfile = fullProfileMap.get(studentId) || {};
        return {
          ...detailedProfile,
          ...assignedStudent,
          email: detailedProfile.kalvium_email || detailedProfile.personal_email || assignedStudent.email
        };
      });

      const assignedIds = new Set(mergedAssigned.map((s) => String(s.student_user_id || s.id)));

      setAssigned(mergedAssigned);
      setNotAdded((allStudents || []).filter((s) => !assignedIds.has(String(s.id || s.user_id))));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async (s) => {
    const id = s.id || s.student_user_id;
    setLoadingId(id);
    try {
      await assignStudent(id, s.squad_id || s.squad);
      setAssigned((prev) => [...prev, { ...s, student_user_id: id }]);
      setNotAdded((prev) => prev.filter((item) => (item.id || item.student_user_id) !== id));
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnassign = async (s) => {
    const id = s.student_user_id || s.id;
    setLoadingId(id);
    try {
      await unassignStudent(id);
      setAssigned((prev) => prev.filter((item) => (item.student_user_id || item.id) !== id));
      setNotAdded((prev) => [...prev, s]);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredAssigned = useMemo(
    () => assigned.filter((s) => (s.name || "").toLowerCase().includes(mainSearch.toLowerCase())),
    [assigned, mainSearch]
  );

  const filteredNotAdded = useMemo(
    () => notAdded.filter((s) => {
      const matchName = (s.name || "").toLowerCase().includes(modalSearch.toLowerCase());
      const matchSquad = squadFilter === "All" || String(s.squad_id) === squadFilter;
      return matchName && matchSquad;
    }),
    [notAdded, modalSearch, squadFilter]
  );

  const uniqueSquads = useMemo(() => {
    const set = new Set(notAdded.map((s) => String(s.squad_id)).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [notAdded]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={36} className="spin-icon" />
        <p>Loading assigned roster...</p>
      </div>
    );
  }

  return (
    <div className="students-layout">
      {/* Top Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-icon"><Users size={22} /></div>
          <div>
            <span className="overview-title">Assigned Students</span>
            <div className="overview-value">{assigned.length}</div>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon accent"><SparklesIcon size={22} /></div>
          <div>
            <span className="overview-title">Not Added Students</span>
            <div className="overview-value">{notAdded.length}</div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="add-student-trigger-btn">
          <UserPlus size={18} /> Assign Student
        </button>
      </div>

      {/* Main Content Table Card */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by student name..." 
              value={mainSearch} 
              onChange={(e) => setMainSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>SQUAD</th>
                <th>EMAIL</th>
                <th>LINKED PROFILES</th>
                <th className="align-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssigned.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No assigned students found.
                  </td>
                </tr>
              ) : (
                filteredAssigned.map((s) => {
                  const id = s.student_user_id || s.id;
                  return (
                    <tr key={id}>
                      <td>
                        <div className="student-info-cell">
                          <StudentAvatar name={s.name} />
                          <span className="student-name">{s.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="squad-badge">Squad {s.squad_id || "N/A"}</span>
                      </td>
                      <td className="email-cell">
                        <Mail size={13} /> <span>{s.email || "N/A"}</span>
                      </td>
                      <td>
                        <PlatformBadges student={s} />
                      </td>
                      <td className="align-right">
                        <div className="action-buttons">
                          <button onClick={() => setSelectedStudent(s)} className="btn-secondary">
                            <Activity size={14} /> Stats
                          </button>
                          <button 
                            onClick={() => handleUnassign(s)} 
                            disabled={loadingId === id}
                            className="btn-danger"
                          >
                            {loadingId === id ? <Loader2 size={14} className="spin-icon" /> : <UserX size={14} />}
                            Unassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Modal */}
      {selectedStudent && (
        <StudentStatsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {/* Assign Student Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h4>Assign Students</h4>
                <p className="subtext">Select students to add to your mentorship roster</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn"><X size={18} /></button>
            </div>

            <div className="modal-toolbar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={modalSearch} 
                  onChange={(e) => setModalSearch(e.target.value)} 
                />
              </div>
              <div className="filter-wrapper">
                <Filter size={14} />
                <select value={squadFilter} onChange={(e) => setSquadFilter(e.target.value)}>
                  {uniqueSquads.map((sq) => (
                    <option key={sq} value={sq}>
                      {sq === "All" ? "All Squads" : `Squad ${sq}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-student-list">
              {filteredNotAdded.length === 0 ? (
                <div className="empty-state">No unadded students match your criteria.</div>
              ) : (
                filteredNotAdded.map((s) => {
                  const id = s.id || s.student_user_id;
                  return (
                    <div key={id} className="available-student-item">
                      <div className="student-details">
                        <StudentAvatar name={s.name} />
                        <div>
                          <div className="student-name-row">
                            <strong>{s.name}</strong>
                            <span className="squad-tag">Squad {s.squad_id || "N/A"}</span>
                          </div>
                          <PlatformBadges student={s} />
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAssign(s)} 
                        disabled={loadingId === id}
                        className="btn-primary"
                      >
                        {loadingId === id ? <Loader2 size={14} className="spin-icon" /> : <Check size={14} />} 
                        Assign
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}