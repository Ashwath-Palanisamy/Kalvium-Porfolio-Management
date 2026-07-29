import { useState, useRef } from "react";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Trophy,
  FileText,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Mail,
  Link2,
  Globe,
  Code2,
  Upload,
  ArrowLeft,
  X,
} from "lucide-react";
import "./EditProfile.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Profile", icon: User },
  { label: "Projects", icon: FolderKanban },
  { label: "Achievements", icon: Trophy },
  { label: "Resume", icon: FileText },
  { label: "Settings", icon: Settings },
];


export default function ProfileManager() {
  const [activeNav, setActiveNav] = useState("Profile");
  const [bio, setBio] = useState(
    "Passionate developer with a strong interest in Artificial Intelligence and Full Stack Development. Always eager to build, and solve real-world problems."
  );
  const bioLimit = 300;
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };
  return (
    <div className="pm-app">
      {/* ---------- Sidebar ---------- */}
      <aside className="pm-sidebar">
        <div className="pm-brand">
          <div className="pm-brand-mark">K</div>
          <div className="pm-brand-text">
            <span className="pm-brand-title">KALVIUM</span>
            <span className="pm-brand-sub">PROFILE MANAGER</span>
          </div>
        </div>

        <nav className="pm-nav">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`pm-nav-item ${activeNav === label ? "is-active" : ""}`}
              onClick={() => setActiveNav(label)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="pm-completion-card">
          <div className="pm-ring" style={{ "--pct": 85 }}>
            <span className="pm-ring-value">85%</span>
          </div>
          <p className="pm-completion-label">Profile Completion</p>
          <p className="pm-completion-hint">Great job! Keep it up 🚀</p>
        </div>

        <button className="pm-logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="pm-main">
        <header className="pm-topbar">
          <div className="pm-welcome">
            <span className="pm-wave">👋</span>
            <div>
              <span className="pm-welcome-sub">Welcome back,</span>
              <strong className="pm-welcome-name">Dhinesh Babu</strong>
            </div>
          </div>
          <div className="pm-topbar-actions">
            <button className="pm-icon-btn">
              <Bell size={18} />
            </button>
            <div className="pm-avatar-chip">
              <span>DB</span>
            </div>
            <ChevronDown size={16} className="pm-chevron" />
          </div>
        </header>

        <div className="pm-page-head">
          <button className="pm-back-btn">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Edit Student Profile</h1>
            <p>Update your information and keep your profile up to date.</p>
          </div>
          <button className="pm-save-btn pm-save-top">Save Changes</button>
        </div>

        <div className="pm-content">
          {/* ----- Left profile card ----- */}
          <section className="pm-profile-card">
            <div className="pm-profile-photo">
              <User size={40} strokeWidth={1.5} />
              <button className="pm-photo-edit" aria-label="Change photo">
                <Upload size={12} />
              </button>
            </div>
            <h2 className="pm-profile-name">Dhinesh Babu</h2>
            <span className="pm-profile-role">Applied At Student</span>

            <div className="pm-profile-meta">
              <div className="pm-meta-row">
                <Mail size={14} />
                <span>dhinesh@kalvium.community</span>
              </div>
              <div className="pm-meta-row">
                <FileText size={14} />
                <span>Squad ID 12</span>
              </div>
            </div>

            <div className="pm-resume-box">
              <span className="pm-resume-label">Resume</span>
              <div className="pm-resume-drop">
                <FileText size={26} strokeWidth={1.5} />
                <p>Upload Your Resume (PDF)</p>
                <span>Only PDF files are allowed</span>
              </div>
              <span className="pm-resume-hint">PDF Only &nbsp;·&nbsp; Max 5MB</span>
            </div>
          </section>

          {/* ----- Right form ----- */}
          <section className="pm-form">
            <FormSection title="Personal Information" icon={User}>
              <div className="pm-grid-2">
                <Field label="Name (Standard)" defaultValue="Dhinesh Babu" />
                <Field
                  label="Kalvium Email (Standard)"
                  defaultValue="dhinesh@kalvium.community"
                  disabled
                />
                <Field
                  label="Personal Email (Changeable)"
                  defaultValue="dhinesh@gmail.com"
                  leftIcon={<Mail size={14} />}
                />
                <Field label="Squad Id (Standard)" defaultValue="Squad 12" disabled />
              </div>
            </FormSection>

            <FormSection title="Professional Information" icon={FolderKanban}>
              <div className="pm-grid-2">
                <Field label="Title (Changeable)" defaultValue="Full Stack Developer" />
                <div className="pm-field">
                  <label>Resume (Uploadable · PDF Only)</label>
                  <div className="pm-file-input">
                    <button type="button" onClick={handleButtonClick} className="pm-choose-btn">
                      Choose PDF File
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                    />

                    {fileName && (
                      <p className="file-name">
                        Selected File: {fileName}
                      </p>
                    )}
                    <span>my_resume.pdf</span>
                  </div>
                  <span className="pm-field-hint">PDF format only, max size 5MB</span>
                </div>
              </div>
            </FormSection>

            <FormSection title="Social Links" icon={Link2}>
              <div className="pm-grid-3">
                <Field
                  label="GitHub"
                  defaultValue="https://github.com/dhinesh-babu"
                  leftIcon={<Code2 size={14} />}
                />
                <Field
                  label="LinkedIn"
                  defaultValue="https://linkedin.com/in/dhinesh-babu"
                  leftIcon={<Globe size={14} />}
                />
                <Field
                  label="LeetCode"
                  defaultValue="https://leetcode.com/u/dhinesh7"
                  leftIcon={<Link2 size={14} />}
                />
              </div>
            </FormSection>

            <FormSection title="Bio (Editable)" icon={FileText}>
              <div className="pm-field">
                <textarea
                  className="pm-textarea"
                  maxLength={bioLimit}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
                <span className="pm-char-count">
                  {bio.length} / {bioLimit} characters
                </span>
              </div>
            </FormSection>

            <div className="pm-form-actions">
              <button className="pm-cancel-btn">
                <X size={16} />
                Cancel
              </button>
              <button className="pm-save-btn">Save Changes</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="pm-section">
      <div className="pm-section-title">
        <Icon size={16} />
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, defaultValue, disabled, leftIcon }) {
  return (
    <div className="pm-field">
      <label>{label}</label>
      <div className={`pm-input-wrap ${disabled ? "is-disabled" : ""}`}>
        {leftIcon && <span className="pm-input-icon">{leftIcon}</span>}
        <input
          type="text"
          defaultValue={defaultValue}
          disabled={disabled}
          className={leftIcon ? "has-icon" : ""}
        />
      </div>
    </div>
  );
}