import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Trophy,
  FileText,
  Settings,
  LogOut,
  Mail,
  Link2,
  Globe,
  Code2,
  Upload,
  ArrowLeft,
  X,
  CheckCircle2,
  Lock,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

import kalviumLogo from "../../assets/kalvium-logo.svg";
import "./EditProfile.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Profile", icon: User },
  { label: "Projects", icon: FolderKanban },
  { label: "Achievements", icon: Trophy },
  { label: "Resume", icon: FileText },
  { label: "Settings", icon: Settings },
];

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Profile");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "name",
    kalviumEmail: "example@kalvium.community",
    personalEmail: "",
    squadId: "",
    title: "",
    github: "",
    linkedin: "",
    leetcode: "",
  });

  const [bio, setBio] = useState("");
  const bioLimit = 300;
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };
  const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Notify Navbar that auth status changed
        window.dispatchEvent(new Event("authChanged"));

        navigate("/");
  }
  return (
    <div className="pm-layout">
      {/* Collapsible Sidebar */}
      <aside className={`pm-sidebar ${isCollapsed ? "is-collapsed" : ""}`}>
        <div className="pm-brand-header">
          {/* Hide logo and brand title when collapsed */}
          {!isCollapsed && (
            <div className="pm-brand">
              <div className="pm-brand-mark">
                <img src={kalviumLogo} alt="Kalvium Logo" className="pm-logo-img" />
              </div>
              <div className="pm-brand-text">
                <span className="pm-brand-title">KALVIUM</span>
                <span className="pm-brand-sub">PROFILE MANAGER</span>
              </div>
            </div>
          )}
          <button
            type="button"
            className="pm-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="pm-nav">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`pm-nav-item ${activeNav === label ? "is-active" : ""}`}
              onClick={() => setActiveNav(label)}
              title={isCollapsed ? label : ""}
            >
              <Icon size={18} strokeWidth={2} />
              {!isCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button (shows icon-only when collapsed) */}
        <button
          type="button"
          className="pm-logout"
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="pm-main">
        {/* Header Status Bar */}
        <header className="pm-topbar">
          <div className="pm-welcome">
            <span className="pm-wave">👋</span>
            <div>
              <span className="pm-welcome-sub">Welcome back,</span>
              <strong className="pm-welcome-name">
                {isLoading ? (
                  <span className="skeleton skeleton-text width-100"></span>
                ) : (
                  profile.name || "Student"
                )}
              </strong>
            </div>
          </div>
          <div className="pm-topbar-actions">
            <button type="button" className="pm-icon-btn" aria-label="Notifications">
              <ArrowLeft size={50} />Logout
            </button>
            
          </div>
        </header>

        {/* Page Head */}
        <div className="pm-page-head">
          <button
            type="button"
            className="pm-icon-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
          <div>
            <h1>Edit Student Profile</h1>
            <p>Update your information and keep your portfolio up to date.</p>
          </div>
        </div>

        {/* Form and Preview Grid */}
        <div className="pm-content-grid">
          {/* Profile Overview Card */}
          <section className="pm-profile-card">
            {isLoading ? (
              <div className="pm-card-skeleton-wrap">
                <div className="skeleton skeleton-avatar"></div>
                <div className="skeleton skeleton-text width-60 mt-12"></div>
                <div className="skeleton skeleton-text width-40 mt-8"></div>
                <div className="skeleton skeleton-block mt-20"></div>
              </div>
            ) : (
              <>
                <div className="pm-profile-photo-container">
                  <div className="pm-profile-photo">
                    <User size={38} strokeWidth={1.5} />
                  </div>
                  <button
                    type="button"
                    className="pm-photo-edit"
                    title="Change photo"
                    aria-label="Change photo"
                  >
                    <Upload size={12} />
                  </button>
                </div>

                <h2 className="pm-profile-name">{profile.name || "Student Name"}</h2>
                <span className="pm-profile-role">
                  {profile.title || "Student Role"}
                </span>

                <div className="pm-profile-meta">
                  <div className="pm-meta-row">
                    <Mail size={14} />
                    <span>{profile.kalviumEmail || "student@kalvium.community"}</span>
                  </div>
                  <div className="pm-meta-row">
                    <FileText size={14} />
                    <span>{profile.squadId || "Squad "}</span>
                  </div>
                </div>

                <div className="pm-resume-status-card">
                  <div className="pm-status-header">
                    <CheckCircle2
                      size={15}
                      className={fileName ? "text-success" : "text-muted"}
                    />
                    <span>{fileName ? "Resume Uploaded" : "No Resume"}</span>
                  </div>
                  <p className="pm-resume-filename">
                    {fileName || "No document selected"}
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Form */}
          <form className="pm-form" onSubmit={(e) => e.preventDefault()}>
            <FormSection title="Personal Information" icon={User}>
              {isLoading ? (
                <FormSkeleton count={4} />
              ) : (
                <div className="pm-grid-2">
                  <Field
                    label="Name "
                    placeholder="e.g. name"
                    value={profile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled
                  />
                  <Field
                    label="Kalvium Email "
                    placeholder="e.g. example@kalvium.community"
                    value={profile.kalviumEmail}
                    onChange={(e) => handleChange("kalviumEmail", e.target.value)}
                    disabled
                  />
                  <Field
                    label="Personal Email"
                    placeholder="e.g. exmaple@gmail.com"
                    value={profile.personalEmail}
                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                    leftIcon={<Mail size={14} />}
                  />
                  <Field
                    label="Squad "
                    placeholder="e.g. Squad 12"
                    value={profile.squadId}
                    onChange={(e) => handleChange("squadId", e.target.value)}
                  />
                </div>
              )}
            </FormSection>

            <FormSection title="Professional Information" icon={FolderKanban}>
              {isLoading ? (
                <FormSkeleton count={2} />
              ) : (
                <div className="pm-grid-2">
                  <Field
                    label="Title / Role"
                    placeholder="e.g. Full Stack Developer"
                    value={profile.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                  <div className="pm-field">
                    <label>Resume (PDF Only)</label>
                    <div className="pm-file-input">
                      <button
                        type="button"
                        onClick={handleButtonClick}
                        className="pm-choose-btn"
                      >
                        Choose File
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        style={{ display: "none" }}
                      />
                      <span className="pm-file-name-text">
                        {fileName ? fileName : "No file selected"}
                      </span>
                    </div>
                    <span className="pm-field-hint">
                      PDF format only, maximum size 5MB
                    </span>
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Social Links" icon={Link2}>
              {isLoading ? (
                <FormSkeleton count={3} />
              ) : (
                <div className="pm-grid-3">
                  <Field
                    label="GitHub"
                    placeholder="https://github.com/username"
                    value={profile.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                    leftIcon={<Code2 size={14} />}
                  />
                  <Field
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/username"
                    value={profile.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    leftIcon={<Globe size={14} />}
                  />
                  <Field
                    label="LeetCode"
                    placeholder="https://leetcode.com/u/username"
                    value={profile.leetcode}
                    onChange={(e) => handleChange("leetcode", e.target.value)}
                    leftIcon={<Link2 size={14} />}
                  />
                </div>
              )}
            </FormSection>

            <FormSection title="Bio" icon={FileText}>
              {isLoading ? (
                <div className="skeleton skeleton-block height-100"></div>
              ) : (
                <div className="pm-field">
                  <textarea
                    className="pm-textarea"
                    maxLength={bioLimit}
                    placeholder="Write a brief bio about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                  <span className="pm-char-count">
                    {bio.length} / {bioLimit} characters
                  </span>
                </div>
              )}
            </FormSection>

            {!isLoading && (
              <div className="pm-form-actions">
                <button type="button" className="pm-cancel-btn">
                  <X size={15} />
                  Cancel
                </button>
                <button type="submit" className="pm-save-btn">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
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

function Field({ label, value, onChange, placeholder, disabled, leftIcon }) {
  return (
    <div className="pm-field">
      <div className="pm-field-label-wrap">
        <label>{label}</label>
        {disabled && <Lock size={12} className="pm-lock-icon" title="Standard field" />}
      </div>
      <div className={`pm-input-wrap ${disabled ? "is-disabled" : ""}`}>
        {leftIcon && <span className="pm-input-icon">{leftIcon}</span>}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={leftIcon ? "has-icon" : ""}
        />
      </div>
    </div>
  );
}

function FormSkeleton({ count }) {
  return (
    <div className={`pm-grid-${count > 2 ? count : 2}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pm-field">
          <div className="skeleton skeleton-text width-40"></div>
          <div className="skeleton skeleton-input"></div>
        </div>
      ))}
    </div>
  );
}