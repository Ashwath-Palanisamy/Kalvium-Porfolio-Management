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
            The official portfolio platform for Kalvium students.
            Showcase projects, achievements, skills, certifications,
            and connect with recruiters through one profile.
        
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn btn-primary">Explore Portfolios →</a>
            <a href="#" className="btn btn-secondary">Create Portfolio →</a>
          </div>
        </div>
        <div className="hero-visual">
          {/* device mockup goes here later */}
          <img src="/hero-mockup.png" alt="Kalvium portfolio preview" className="hero-image" />
        </div>
      </section>
      <section className="stats-bar">
        <div className="stat">
        <div className="stat-number">n+</div>
        <div className="stat-label">Students</div>
        </div>
        <div className="stat">
        <div className="stat-number">n+</div>
        <div className="stat-label">Projects</div>
        </div>
        <div className="stat">
        <div className="stat-number">n+</div>
        <div className="stat-label">Internships</div>
        </div>
      </section>
    </div>
    
    
  );
}

export default Home;