import "./Home.css"
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FiUsers, FiFolder, FiGithub, FiFileText, FiBriefcase, FiGlobe, FiWifi, FiUser } from "react-icons/fi";
import { LuBadgeCheck, LuCpu } from "react-icons/lu";
import { SiFlutter } from "react-icons/si";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <div>

      

      {/* Hero section */}
      <section className="hero container">
        <div className="hero-text">
          <h1 className="hero-headline">
            BUILD. <span className="accent">SHOWCASE.</span> <br />
            <span className="accent">GET</span> DISCOVERED.
          </h1>
          <p className="hero-subtext">
            The official portfolio platform for Kalvium students. <br />
            Showcase projects, achievements, skills, certifications, <br />
            and connect with recruiters through one profile. <br />
          </p>
          <div className="hero-buttons">
            <NavLink to="/students" className="btn btn-primary">Explore Portfolios →</NavLink>
            {isLoggedIn ? (
              <NavLink to="/manage" className="btn btn-secondary">Manage Portfolio →</NavLink>
            ) : (
              <NavLink to="/login" className="btn btn-secondary">Login →</NavLink>
            )}
          </div>
        </div>
        <div className="hero-visual">
          {/* device mockup goes here later */}
          <img src="/hero-mockup.png" alt="Kalvium portfolio preview" className="hero-image" />
        </div>
      </section>

      <section className="stats-bar">
        <div className="stat">
          <div className="stat-number">500+</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat">
          <div className="stat-number">1000+</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat">
          <div className="stat-number">150+</div>
          <div className="stat-label">Internships</div>
        </div>
      </section>

      {/* students scroll */}
      <section className="featured-container">
        <h3>Featured Students</h3>
        <div className="students">
          <div className="student-card">
            <img src="sfad" alt="profile-1" />
            <h4>Dhinesh</h4>
            <p>AI Developer</p>
            {/* Updated to link to individual student ID */}
            <NavLink to="/student/1" className="student-redirect">View Profile →</NavLink>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-2" />
            <h4>Ashwath</h4>
            <p>AI Developer</p>
            {/* Updated to link to individual student ID */}
            <NavLink to="/student/2" className="student-redirect">View Profile →</NavLink>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-3" />
            <h4>Ashwin</h4>
            <p>AI Developer</p>
            {/* Updated to link to individual student ID */}
            <NavLink to="/student/3" className="student-redirect">View Profile →</NavLink>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-4" />
            <h4>Nithya</h4>
            <p>AI Developer</p>
            {/* Updated to link to individual student ID */}
            <NavLink to="/student/4" className="student-redirect">View Profile →</NavLink>
        </div>

        <div className="view-all-container">
          <NavLink to="/students" className="home-all-student">View All Students ▶</NavLink>
        </div>
        </div> {/* Added missing closing tag for .students */}
      </section>

      <section className="why-section">
        <h3>Why Kalvium Portfolio?</h3>

        <div className="why-container">
          <div className="why-item">
            <div className="icon-circle">
              <LuBadgeCheck size={28} color="#ff3b3b" />
            </div>
            <p>Professional<br/>Digital Identity</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiUsers size={28} color="#ff3b3b" />
            </div>
            <p>Recruiter<br/>Friendly</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiFolder size={28} color="#ff3b3b" />
            </div>
            <p>Showcase Projects<br/>& Certifications</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiGithub size={28} color="#ff3b3b" />
            </div>
            <p>GitHub & LinkedIn<br/>Integration</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiFileText size={28} color="#ff3b3b" />
            </div>
            <p>Resume<br/>Download</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiBriefcase size={28} color="#ff3b3b" />
            </div>
            <p>Internship<br/>Ready</p>
          </div>
        </div>
      </section>

      <section className="recent-projects-section">
        <h3>Recent Projects</h3>
        
        <div className="projects-container">
          
          <div className="project-card card-ai">
            <div className="card-icon">
              <LuCpu size={48} color="#a855f7" />
            </div>
            <div className="card-bottom">
              <div className="card-text">
                <h4>AI</h4>
                <p>Smart AI Assistant</p>
              </div>
              <button className="card-arrow">→</button>
            </div>
          </div>

          <div className="project-card card-web">
            <div className="card-icon">
              <FiGlobe size={48} color="#22c55e" />
            </div>
            <div className="card-bottom">
              <div className="card-text">
                <h4>Web</h4>
                <p>E-Commerce Platform</p>
              </div>
              <button className="card-arrow">→</button>
            </div>
          </div>

          <div className="project-card card-flutter">
            <div className="card-icon">
              <SiFlutter size={48} color="#3b82f6" />
            </div>
            <div className="card-bottom">
              <div className="card-text">
                <h4>Flutter</h4>
                <p>Task Management App</p>
              </div>
              <button className="card-arrow">→</button>
            </div>
          </div>

          <div className="project-card card-iot">
            <div className="card-icon">
              <FiWifi size={48} color="#f97316" />
            </div>
            <div className="card-bottom">
              <div className="card-text">
                <h4>IoT</h4>
                <p>Smart Home System</p>
              </div>
              <button className="card-arrow">→</button>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Build Your Portfolio?</h2>
        <p>"One Profile. Endless Opportunities."</p>
        
        {isLoggedIn ? (
          <NavLink to="/manage" className="btn-create-portfolio">
            Manage Portfolio →
          </NavLink>
        ) : (
          <NavLink to="/login" className="btn-create-portfolio">
            Login Account →
          </NavLink>
        )}
        
      </section>
    </div>
  );
}

export default Home;