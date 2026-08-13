import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Search, Mail, Users, UserX, UserPlus, X, Check, Filter, 
  Loader2, Activity, ExternalLink, Code2, FileText, Clock, GitCommit, CheckCircle2, FolderGit2, AlertCircle, Briefcase
} from "lucide-react";
import { useCodingStats } from "../../hooks/useCodingStats";
import { 
  getAssignedStudents, 
  getStudents, 
  assignStudent, 
  unassignStudent,
} from "../../api/routes/MentorDashboard/main.js";
import { getLeaderboardData } from "../../api/routes/Public/leaderboard.js";
import "./assigned.css";

const isLeetCodeActiveThisWeek = (student) => {
  return !!student?.is_leetcode_active;
};

// Safely normalize UUID strings for Map lookups
const cleanUuid = (val) => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toLowerCase();
  return str.length > 0 ? str : null;
};

// Parse date/timestamp format and evaluate whether activity occurred within 7 days
const checkIsActive = (dateVal) => {
  if (dateVal === null || dateVal === undefined || dateVal === "") return false;

  if (typeof dateVal === 'boolean') return dateVal;

  let timestamp = NaN;

  if (dateVal instanceof Date) {
    timestamp = dateVal.getTime();
  } else if (typeof dateVal === 'number') {
    timestamp = dateVal < 1e11 ? dateVal * 1000 : dateVal;
  } else if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    
    // Numeric string (Unix timestamp)
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      timestamp = num < 1e11 ? num * 1000 : num;
    } else {
      let raw = trimmed.replace(" ", "T");
      if (raw.endsWith("+00") || raw.endsWith("-00")) {
        raw = raw.slice(0, -3) + "Z";
      }
      timestamp = new Date(raw).getTime();
    }
  }

  if (isNaN(timestamp)) return false;

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const diff = Date.now() - timestamp;

  return diff >= 0 && diff <= ONE_WEEK_MS;
};

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

const StudentAvatar = ({ student, name }) => {
  const [imgError, setImgError] = useState(false);

  const avatarUrl =
    student?.avatar_url ||
    student?.profile_pic ||
    student?.photo ||
    student?.avatar ||
    student?.image_url ||
    student?.profile_image;

  const displayName = student?.name || student?.full_name || name || "Student";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="student-avatar-img"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="student-avatar generic-avatar" title={displayName}>
      <span>{initials || "S"}</span>
    </div>
  );
};

const PlatformBadges = ({ student }) => {
  const platforms = [
    { key: "github", url: student.github, label: "GitHub", icon: <GithubIcon size={14} /> },
    { key: "leetcode", url: student.leetcode, label: "LeetCode", icon: <Code2 size={14} /> },
    { key: "linkedin", url: student.linkedin, label: "LinkedIn", icon: <LinkedinIcon size={14} /> }
  ].filter((p) => p.url);

  if (!platforms.length) return <span className="no-platforms-label">No linked profiles</span>;

  return (
    <div className="platform-chips-container">
      {platforms.map(({ key, url, label, icon }) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`platform-chip ${key}`}>
          {icon}
          <span className="chip-text">{label}</span>
        </a>
      ))}
    </div>
  );
};

const LeetCodeStatusBadge = ({ student }) => {
  if (!student.leetcode && !student.is_leetcode_active) {
    return <span className="status-badge no-profile">No LeetCode</span>;
  }
  const isActive = isLeetCodeActiveThisWeek(student);
  return isActive ? (
    <span className="status-badge active">
      <CheckCircle2 size={14} /> Active
    </span>
  ) : (
    <span className="status-badge inactive">
      <AlertCircle size={14} /> Inactive (&gt;1wk)
    </span>
  );
};

const StudentStatsModal = ({ student, onClose }) => {
  const { github: githubStats, leetcode: leetcodeStats, loading: isFetchingStats } = useCodingStats(student?.github, student?.leetcode);
  const hasGitHubActivity = githubStats?.recentRepo || (githubStats?.recentEvents?.length > 0);
  const hasLeetCodeActivity = leetcodeStats?.recentSubmissions?.length > 0;
  const hasAnyActivity = hasGitHubActivity || hasLeetCodeActivity;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <StudentAvatar student={student} />
            <div>
              <div className="modal-title-row">
                <h3>{student.name || student.full_name}</h3>
                {student.squad_id && <span className="squad-badge">Squad {student.squad_id}</span>}
              </div>
              {student.title && <p className="subtext"><Briefcase size={14} /> {student.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="icon-btn close-btn" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {student.bio && <div className="modal-bio">"{student.bio}"</div>}

          <div className="modal-section">
            <h4 className="section-title">Contact Details</h4>
            <div className="contact-grid">
              {(student.kalvium_email || student.email) && (
                <div className="contact-item">
                  <Mail size={16} />
                  <div>
                    <span className="contact-label">Kalvium Email</span>
                    <span className="contact-value">{student.kalvium_email || student.email}</span>
                  </div>
                </div>
              )}
              {student.personal_email && (
                <div className="contact-item">
                  <Mail size={16} />
                  <div>
                    <span className="contact-label">Personal Email</span>
                    <span className="contact-value">{student.personal_email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-section">
            <div className="section-header">
              <h4 className="section-title">Coding Profiles & Stats</h4>
              {isFetchingStats && (
                <span className="fetching-badge">
                  <Loader2 size={12} className="spin-icon" /> Fetching live data...
                </span>
              )}
            </div>

            <div className="profiles-grid">
              {student.leetcode && (
                <div className="profile-card leetcode-card">
                  <div className="profile-card-header">
                    <div className="brand">
                      <Code2 size={20} /> <strong>LeetCode</strong>
                    </div>
                    <a href={student.leetcode} target="_blank" rel="noopener noreferrer" className="external-link">
                      Visit <ExternalLink size={14} />
                    </a>
                  </div>
                  {leetcodeStats && (
                    <div className="stats-row">
                      <div className="stat-box primary">
                        <span className="stat-val">{leetcodeStats.totalSolved || 0}</span>
                        <span className="stat-lbl">Solved</span>
                      </div>
                      <div className="stat-box easy">
                        <span className="stat-val">{leetcodeStats.easySolved || 0}</span>
                        <span className="stat-lbl">Easy</span>
                      </div>
                      <div className="stat-box medium">
                        <span className="stat-val">{leetcodeStats.mediumSolved || 0}</span>
                        <span className="stat-lbl">Medium</span>
                      </div>
                      <div className="stat-box hard">
                        <span className="stat-val">{leetcodeStats.hardSolved || 0}</span>
                        <span className="stat-lbl">Hard</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {student.github && (
                <div className="profile-card github-card">
                  <div className="profile-card-header">
                    <div className="brand">
                      <GithubIcon size={20} /> <strong>GitHub</strong>
                    </div>
                    <a href={student.github} target="_blank" rel="noopener noreferrer" className="external-link">
                      Visit <ExternalLink size={14} />
                    </a>
                  </div>
                  {githubStats && (
                    <div className="stats-row">
                      <div className="stat-box">
                        <span className="stat-val">{githubStats.followers || 0}</span>
                        <span className="stat-lbl">Followers</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-val">{githubStats.repos ?? githubStats.public_repos ?? 0}</span>
                        <span className="stat-lbl">Repos</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-val">{githubStats.contributions || 0}</span>
                        <span className="stat-lbl">Contributions</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="quick-links">
              {student.linkedin && (
                <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="quick-link linkedin-link">
                  <LinkedinIcon size={16} /> LinkedIn Profile
                </a>
              )}
              {student.resume_url && (
                <a href={student.resume_url} target="_blank" rel="noopener noreferrer" className="quick-link resume-link">
                  <FileText size={16} /> View Resume
                </a>
              )}
            </div>
          </div>

          <div className="modal-section">
            <h4 className="section-title">Recent Activity Feed</h4>
            {isFetchingStats ? (
              <div className="loading-state-inline">
                <Loader2 size={18} className="spin-icon" /> Loading activity...
              </div>
            ) : (
              <div className="activity-timeline">
                {githubStats?.recentRepo && (
                  <div className="timeline-item">
                    <div className="timeline-icon github"><FolderGit2 size={16} /></div>
                    <div className="timeline-content">
                      <p>Updated repository <strong>{githubStats.recentRepo}</strong></p>
                      <span className="timeline-meta"><Clock size={12} /> Latest Repository • GitHub</span>
                    </div>
                  </div>
                )}
                {githubStats?.recentEvents?.slice(0, 2).map((evt, idx) => (
                  <div key={`gh-${idx}`} className="timeline-item">
                    <div className="timeline-icon github"><GitCommit size={16} /></div>
                    <div className="timeline-content">
                      <p>{evt.message || evt.description || "Pushed code update"}</p>
                      <span className="timeline-meta"><Clock size={12} /> {evt.timeAgo || "Recently"} • {evt.repoName || "GitHub"}</span>
                    </div>
                  </div>
                ))}
                {leetcodeStats?.recentSubmissions?.slice(0, 2).map((sub, idx) => (
                  <div key={`lc-${idx}`} className="timeline-item">
                    <div className="timeline-icon leetcode"><CheckCircle2 size={16} /></div>
                    <div className="timeline-content">
                      <p>Solved <strong>{sub.title}</strong></p>
                      <span className="timeline-meta"><Clock size={12} /> {sub.timeAgo || "Recently"} • LeetCode</span>
                    </div>
                  </div>
                ))}
                {!hasAnyActivity && (
                  <div className="empty-activity">
                    <Activity size={24} />
                    <p>No recent submission or commit activity found.</p>
                  </div>
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
  const [activityFilter, setActivityFilter] = useState("all"); 

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignedData, allStudents, leaderboardData] = await Promise.all([
        getAssignedStudents(), 
        getStudents(),
        getLeaderboardData()
      ]);

      const leetcodeStatsMap = new Map();
      (leaderboardData || []).forEach((stat) => {
        [stat.user_id, stat.student_user_id, stat.student_id, stat.profile_id, stat.id].forEach((field) => {
          const key = cleanUuid(field);
          if (key) leetcodeStatsMap.set(key, stat);
        });
      });

      const fullProfileMap = new Map();
      (allStudents || []).forEach((student) => {
        [student.user_id, student.student_user_id, student.student_id, student.profile_id, student.id].forEach((field) => {
          const key = cleanUuid(field);
          if (key) fullProfileMap.set(key, student);
        });
      });

      const findInMap = (map, record) => {
        if (!record) return null;
        const keys = [
          record.user_id,
          record.student_user_id,
          record.student_id,
          record.profile_id,
          record.id
        ];
        for (const k of keys) {
          const cleaned = cleanUuid(k);
          if (cleaned && map.has(cleaned)) {
            return map.get(cleaned);
          }
        }
        return null;
      };

      const extractActivityStatus = (record, profile, stats) => {
        // Prioritize actual timestamp checks from leaderboard / profile / record
        const lastSolvedTimestamp = 
          stats?.last_solved_at || 
          stats?.last_solved || 
          stats?.last_submission_time || 
          stats?.last_submission_at || 
          stats?.last_active_at || 
          stats?.last_active || 
          profile?.last_solved_at || 
          profile?.last_solved || 
          record?.last_solved_at || 
          record?.last_solved;

        if (lastSolvedTimestamp !== undefined && lastSolvedTimestamp !== null) {
          return checkIsActive(lastSolvedTimestamp);
        }

        // Fallback to explicit boolean flags if timestamps aren't populated
        const directFlag = 
          record?.is_leetcode_active ?? 
          record?.is_active ?? 
          profile?.is_leetcode_active ?? 
          profile?.is_active ?? 
          stats?.is_leetcode_active ?? 
          stats?.is_active;

        if (directFlag !== undefined && directFlag !== null) {
          return Boolean(directFlag);
        }

        return false;
      };

      // Process assigned students
      const mergedAssigned = (assignedData || []).map((assignedStudent) => {
        const detailedProfile = findInMap(fullProfileMap, assignedStudent) || {};
        const liveStats = findInMap(leetcodeStatsMap, assignedStudent) || findInMap(leetcodeStatsMap, detailedProfile);

        const primaryUuid = cleanUuid(
          assignedStudent.user_id || 
          assignedStudent.student_user_id || 
          assignedStudent.student_id || 
          assignedStudent.profile_id || 
          assignedStudent.id ||
          detailedProfile.user_id ||
          detailedProfile.id
        );

        const isCurrentlyActive = extractActivityStatus(assignedStudent, detailedProfile, liveStats);

        return {
          ...detailedProfile,
          ...assignedStudent,
          uuid_key: primaryUuid,
          email: detailedProfile.kalvium_email || detailedProfile.personal_email || assignedStudent.email,
          leetcode: detailedProfile.leetcode || (liveStats ? `https://leetcode.com/u/${liveStats.leetcode_username}` : null),
          is_leetcode_active: isCurrentlyActive 
        };
      });

      const assignedUuidsSet = new Set(
        mergedAssigned.map((s) => s.uuid_key).filter(Boolean)
      );

      // Process unassigned students
      const filteredNotAdded = (allStudents || [])
        .filter((student) => {
          const studentUuid = cleanUuid(
            student.user_id || 
            student.student_user_id || 
            student.student_id || 
            student.profile_id || 
            student.id
          );
          return !assignedUuidsSet.has(studentUuid);
        })
        .map((student) => {
          const primaryUuid = cleanUuid(
            student.user_id || 
            student.student_user_id || 
            student.student_id || 
            student.profile_id || 
            student.id
          );
          const liveStats = findInMap(leetcodeStatsMap, student);
          const isCurrentlyActive = extractActivityStatus(student, null, liveStats);

          return { 
            ...student,
            uuid_key: primaryUuid,
            leetcode: student.leetcode || (liveStats ? `https://leetcode.com/u/${liveStats.leetcode_username}` : null),
            is_leetcode_active: isCurrentlyActive 
          };
        });

      setAssigned(mergedAssigned);
      setNotAdded(filteredNotAdded);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async (s) => {
    const id = s.uuid_key || s.user_id || s.id || s.student_user_id;
    setLoadingId(id);
    try {
      await assignStudent(id, s.squad_id || s.squad);
      setAssigned((prev) => [...prev, { ...s, uuid_key: id }]);
      setNotAdded((prev) => prev.filter((item) => item.uuid_key !== id));
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnassign = async (s) => {
    const id = s.uuid_key || s.user_id || s.student_user_id || s.id;
    setLoadingId(id);
    try {
      await unassignStudent(id);
      setAssigned((prev) => prev.filter((item) => item.uuid_key !== id));
      setNotAdded((prev) => [...prev, s]);
    } finally {
      setLoadingId(null);
    }
  };

  const activeCount = useMemo(() => assigned.filter(isLeetCodeActiveThisWeek).length, [assigned]);

  const filteredAssigned = useMemo(() => {
    return assigned.filter((s) => {
      const matchName = (s.name || s.full_name || "").toLowerCase().includes(mainSearch.toLowerCase());
      const isActive = isLeetCodeActiveThisWeek(s);
      const matchActivity = activityFilter === "all" ? true : activityFilter === "active" ? isActive : !isActive;
      return matchName && matchActivity;
    });
  }, [assigned, mainSearch, activityFilter]);

  const filteredNotAddedList = useMemo(
    () => notAdded.filter((s) => {
      const matchName = (s.name || s.full_name || "").toLowerCase().includes(modalSearch.toLowerCase());
      const matchSquad = squadFilter === "All" || String(s.squad_id) === squadFilter;
      return matchName && matchSquad;
    }),
    [notAdded, modalSearch, squadFilter]
  );

  const uniqueSquads = useMemo(() => ["All", ...Array.from(new Set(notAdded.map((s) => String(s.squad_id)).filter(Boolean)))], [notAdded]);

  if (loading) {
    return (
      <div className="full-page-loader">
        <Loader2 size={48} className="spin-icon" />
        <p>Loading your mentorship roster...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Overview Cards */}
      <div className="metrics-grid">
        <div className="metric-card bg-black">
          <div className="metric-icon bg-red">
            <Users size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Assigned Mentees</span>
            <span className="metric-value">{assigned.length}</span>
          </div>
        </div>

        <div 
          className={`metric-card interactive ${activityFilter === 'active' ? 'active-filter' : ''}`}
          onClick={() => setActivityFilter(activityFilter === 'active' ? 'all' : 'active')}
        >
          <div className="metric-icon bg-red">
            <Activity size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Active This Week</span>
            <span className="metric-value">{activeCount}</span>
            <span className="metric-hint">LeetCode submissions</span>
          </div>
        </div>

        <button 
          className="btn-primary assign-btn-large" 
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={20} /> Assign New Students
        </button>
      </div>

      {/* Main Content Area */}
      <div className="content-card">
        <div className="content-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search assigned students..." 
              value={mainSearch}
              onChange={(e) => setMainSearch(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <Filter size={18} className="text-muted" />
            <select 
              value={activityFilter} 
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="all">All Activity Statuses</option>
              <option value="active">Active (This Week)</option>
              <option value="inactive">Inactive (&gt;1 Week)</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Squad</th>
                <th>Email Address</th>
                <th>LeetCode Status</th>
                <th>Linked Profiles</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssigned.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table-state">
                    <div className="empty-message">
                      <UserX size={36} />
                      <p>No assigned students matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssigned.map((student) => {
                  const studentKey = student.uuid_key || student.user_id || student.id;
                  const isProcessing = loadingId === studentKey;

                  return (
                    <tr key={studentKey}>
                      <td data-label="Student Details">
                        <div className="student-profile-cell">
                          <StudentAvatar student={student} />
                          <div className="student-info">
                            <span className="student-name">{student.name || student.full_name}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Squad">
                        {student.squad_id ? (
                          <span className="squad-badge">Squad {student.squad_id}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td data-label="Email Address">
                        <span className="email-text">{student.email || "N/A"}</span>
                      </td>
                      <td data-label="LeetCode Status">
                        <LeetCodeStatusBadge student={student} />
                      </td>
                      <td data-label="Linked Profiles">
                        <PlatformBadges student={student} />
                      </td>
                      <td data-label="Actions" className="text-right">
                        <div className="actions-cell">
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Activity size={14} /> Stats
                          </button>
                          <button 
                            className="btn-danger btn-sm"
                            disabled={isProcessing}
                            onClick={() => handleUnassign(student)}
                          >
                            {isProcessing ? <Loader2 size={14} className="spin-icon" /> : <UserX size={14} />}
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

      {/* Assign Students Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <UserPlus size={20} className="text-muted" />
                <h3>Assign Students to Roster</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="icon-btn" aria-label="Close"><X size={20} /></button>
            </div>

            <div className="modal-filters">
              <div className="search-box">
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search available students..." 
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                />
              </div>

              <div className="filter-box">
                <Filter size={18} className="text-muted" />
                <select value={squadFilter} onChange={(e) => setSquadFilter(e.target.value)}>
                  {uniqueSquads.map((squad) => (
                    <option key={squad} value={squad}>
                      {squad === "All" ? "All Squads" : `Squad ${squad}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="assign-list">
              {filteredNotAddedList.length === 0 ? (
                <div className="empty-activity">
                  <p>No available students found to assign.</p>
                </div>
              ) : (
                filteredNotAddedList.map((student) => {
                  const studentKey = student.uuid_key || student.user_id || student.id;
                  const isProcessing = loadingId === studentKey;

                  return (
                    <div key={studentKey} className="assign-list-item">
                      <div className="assign-student-info">
                        <StudentAvatar student={student} />
                        <div>
                          <h4>
                            {student.name || student.full_name}
                            {student.squad_id && <span className="squad-badge sm">Squad {student.squad_id}</span>}
                          </h4>
                          <span className="email-text">{student.email || student.kalvium_email || "N/A"}</span>
                        </div>
                      </div>

                      <button 
                        className="btn-primary btn-sm"
                        disabled={isProcessing}
                        onClick={() => handleAssign(student)}
                      >
                        {isProcessing ? <Loader2 size={14} className="spin-icon" /> : <Check size={14} />}
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

      {/* Student Details / Stats Modal */}
      {selectedStudent && (
        <StudentStatsModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
}