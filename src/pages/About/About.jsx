import Coder from "./Low code development-amico.svg";
import {
  FaCode,
  FaPaintBrush,
  FaRobot,
  FaLaptopCode,
  FaServer,
  FaChartPie,
} from "react-icons/fa";

import "./About.css";

function About() {
  const communities = [
    {
      icon: <FaCode />,
      title: "Developers",
    },
    {
      icon: <FaPaintBrush />,
      title: "Designers",
    },
    {
      icon: <FaRobot />,
      title: "AI Engineers",
    },

    {
      icon: <FaChartPie />,
      title: "Data Scientists",
    },
  ];

  return (
    <div className="about-page">
      {/* ================= HERO SECTION ================= */}

      <section className="about-hero">
        <div className="about-container">
          {/* Left Side */}
          <div className="hero-content">
            <p className="hero-tag">ABOUT THE KALVIUM PORTFOLIO</p>

            <h1 className="about-headline">
              More Than A Platform.
              <br />A Launchpad for Talent.
            </h1>

            <p className="hero-description">
              Kalvium Portfolio empowers students to showcase their skills,
              projects, and achievements in one professional identity. We
              connect talent with opportunities and help students build a future
              they deserve.
            </p>

            <button className="hero-btn">Our Story →</button>
          </div>

          {/* Right Side */}
          <div className="about-img">
            <div className="hero-circle">
              {/* Top */}
              <div className="circle-item top">
                <div className="icon-box">📁</div>
                <p>Projects</p>
              </div>

              {/* Left */}
              <div className="circle-item left">
                <div className="icon-box">🏆</div>
                <p>Achievements</p>
              </div>

              {/* Right */}
              <div className="circle-item right">
                <div className="icon-box">👥</div>
                <p>Recruiters</p>
              </div>

              {/* Bottom */}
              <div className="circle-item bottom">
                <div className="icon-box">📊</div>
                <p>Opportunities</p>
              </div>

              {/* Center */}
              <div className="center-image">
                <img
                  src={Coder}
                  alt="Kalvium Portfolio Illustration"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY SECTION ================= */}

      <section className="why-section">
        <div className="why-container">
          {/* Left */}

          <div className="why-left">
            <p className="why-tag">WHY WE BUILT THIS</p>
            <h2 className="why-title">
              "Talent deserves
              <br />
              to be discovered."
            </h2>
            <div className="red-line"></div>
          </div>

          {/* Right */}
          <div className="why-right">
            <p>
              Students do incredible work, but their achievements are scattered
              across multiple platforms and rarely seen by the right people.
            </p>
            <p>
              Kalvium Portfolio brings everything together in one place— making
              it simple to showcase, connect, and grow.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div>
              <h3>500+</h3>
              <p>Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚀</div>

            <div>
              <h3>1000+</h3>
              <p>Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div>
              <h3>150+</h3>
              <p>Internships</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div>
              <h3>50+</h3>
              <p>Recruiter Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Platform Section ================= */}

      <section className="platform-section">
        <h2 className="section-heading">MEET THE PLATFORM</h2>

        <div className="platform-grid">
          <div className="platform-card">
            <div className="platform-icon">📁</div>

            <h3>Projects</h3>
            <p>
              Showcase your best work with rich project details, tech stack and
              links.
            </p>
          </div>

          <div className="platform-card">
            <div className="platform-icon">💻</div>
            <h3>Skills</h3>
            <p>
              Highlight your technical and soft skills with proficiency levels.
            </p>
          </div>
          <div className="platform-card">
            <div className="platform-icon">🏆</div>

            <h3>Achievements</h3>
            <p>Display certifications, hackathons, awards and milestones.</p>
          </div>

          <div className="platform-card">
            <div className="platform-icon">🌐</div>

            <h3>Portfolio</h3>
            <p>Create a professional portfolio that reflects your journey and accomplishments.</p>
          </div>
        </div>
      </section>

      {/* ================= OUR PHILOSOPHY ================= */}

      <section className="philosophy-section">
        <h2 className="section-heading">OUR PHILOSOPHY</h2>
        <div className="philosophy-grid">
          {/* Card 1 */}
          <div className="philosophy-card">
            <div className="philosophy-icon red">💡</div>
            <div>
              <h3>Simplicity</h3>
              <p>
                A clean and minimal platform that keeps the focus on what truly
                matters — your work.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="philosophy-card">
            <div className="philosophy-icon green">🛡️</div>
            <div>
              <h3>Authenticity</h3>
              <p>
                Every project, every achievement represents the real effort of
                students.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="philosophy-card">
            <div className="philosophy-icon orange">🎯</div>
            <div>
              <h3>Opportunity</h3>
              <p>
                We connect talent with the right opportunities and help students
                take the next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= JOURNEY SECTION ================= */}

      <section className="journey-section">
        <h2 className="section-heading">THE STUDENT JOURNEY</h2>
        <div className="journey-container">
          <div className="journey-step">
            <div className="step-icon">🔑</div>
            <h4>Login Account</h4>
            <p>Sign in and start your journey.</p>
          </div>

          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-icon">👤</div>
            <h4>Build Profile</h4>
            <p>Add your details and skills.</p>
          </div>

          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-icon">📂</div>
            <h4>Upload Projects</h4>
            <p>Showcase your amazing work.</p>
          </div>

          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-icon">🏆</div>
            <h4>Earn Achievements</h4>
            <p>Add certifications and awards.</p>
          </div>

          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-icon">🔗</div>
            <h4>Share Portfolio</h4>
            <p>Share your portfolio with anyone.</p>
          </div>

          <div className="journey-arrow">→</div>
          <div className="journey-step">
            <div className="step-icon">🌱</div>
            <h4>Continue Growing</h4>
            <p>Keep learning, building, and improving every day.</p>
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY SECTION ================= */}

      <section className="technology-section">
        <h2 className="section-heading">TECHNOLOGIES WE USE</h2>

        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">⚛️</div>
            <h3>React</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🟢</div>
            <h3>Node.js</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🍃</div>
            <h3>MongoDB</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🚀</div>
            <h3>Express.js</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">☁️</div>
            <h3>Cloudinary</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🔐</div>
            <h3>JWT Auth</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">🐙</div>
            <h3>GitHub</h3>
          </div>

          <div className="tech-card">
            <div className="tech-icon">▲</div>
            <h3>Vercel</h3>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY SECTION ================= */}

      <section className="community-section">
        <h2 className="section-heading">OUR COMMUNITY</h2>
        <div className="community-grid">
          {communities.map((item, index) => (
            <div className="community-card" key={index}>
              <div className="community-icon">{item.icon}</div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
        <p className="community-text">
          And many more talented students from diverse domains.
        </p>
      </section>

      {/*====================End of the section============= */}
    </div>
  );
}

export default About;
