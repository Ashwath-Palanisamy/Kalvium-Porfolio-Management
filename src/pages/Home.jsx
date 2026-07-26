import "./Home.css"
import { NavLink } from "react-router-dom";

function Home() {
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
            <a href="#" className="btn btn-secondary">Manage Portfolio →</a>
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
        <h3>Features Students</h3>
        <div className="students">

          <div className="student-card">
            <img src="sfad" alt="profile-1" />
            <h4>Dhinesh</h4>
            <p>AI Developer</p>
            <button>View Profile →</button>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-2" />
            <h4>Ashwath</h4>
            <p>AI Developer</p>
            <button>View Profile →</button>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-3" />
            <h4>Ashwin</h4>
            <p>AI Developer</p>
            <button>View Profile →</button>
          </div>

          <div className="student-card">
            <img src="sfad" alt="profile-4" />
            <h4>Nithya</h4>
            <p>AI Developer</p>
            <button>View Profile →</button>
          </div>

        </div>
      </section>
    </div>

    
  );
}

export default Home;