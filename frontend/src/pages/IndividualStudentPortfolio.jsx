import "./IndividualStudentPortfolio.css"

export default function IndividualStudentPortfolio() {
    return (
        <div id="portfolio-background">

            <title>Kalvium Portfolio | Peers</title>

            <div id="left-side-color">

                
                {/* LeetCode Info Box */}
                <div className="coding-profile-card">
                    <div className="leetcode-header">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.609-2.636a5.055 5.055 0 0 0-2.445-1.337l2.467-2.503c.516-.514.498-1.366-.037-1.901-.535-.535-1.387-.552-1.902-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.833s.513 2.851 1.494 3.833l10.105 10.101c.515.515 1.366.498 1.901-.038.536-.535.553-1.387.038-1.902l-2.609-2.636a5.055 5.055 0 0 0 2.445-1.337l-2.467 2.503z"/>
                        </svg>
                        <h2>LeetCode</h2>
                    </div>
                    
                    <div className="leetcode-username">@student_coder</div>
                    
                    <div className="leetcode-stats-main">
                        <div className="stat-box">
                            <span className="stat-label">Rank</span>
                            <span className="stat-value">124,592</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Solved</span>
                            <span className="stat-value">342</span>
                        </div>
                    </div>

                    <div className="leetcode-difficulty">
                        <div className="diff-item easy">
                            <span className="diff-label">Easy</span>
                            <span className="diff-count">150</span>
                        </div>
                        <div className="diff-item medium">
                            <span className="diff-label">Medium</span>
                            <span className="diff-count">142</span>
                        </div>
                        <div className="diff-item hard">
                            <span className="diff-label">Hard</span>
                            <span className="diff-count">50</span>
                        </div>
                    </div>
                </div>

                {/* GitHub Info Box */}
                <div className="coding-profile-card">
                    <div className="github-header">
                        <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor">
                            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                        <h2>GitHub</h2>
                    </div>

                    <div className="github-username">@student_coder</div>

                    <div className="github-stats-main">
                        <div className="stat-box">
                            <span className="stat-label">Repos</span>
                            <span className="stat-value">42</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Followers</span>
                            <span className="stat-value">18</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Stars</span>
                            <span className="stat-value">128</span>
                        </div>
                    </div>

                    <div className="github-recent-activity">
                        <div className="activity-item">
                            <span className="activity-label">Latest Repo</span>
                            <span className="activity-value">student-portfolio-api</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-label">Last Active</span>
                            <span className="activity-value">Today, 2:30 PM</span>
                        </div>
                    </div>
                </div>

                {/* Contact & Socials Card */}
                <div className="coding-profile-card">
                    <div className="contact-card-header">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <h2>Contact & Links</h2>
                    </div>

                    <div className="contact-list">
                        <a href="mailto:alex.johnson@example.com" className="contact-item">
                            <div className="contact-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <div className="contact-details">
                                <span className="contact-label">Email</span>
                                <span className="contact-text">alex.johnson@example.com</span>
                            </div>
                        </a>

                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="contact-item">
                            <div className="contact-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.74a1.6 1.6 0 0 0-1.61 1.6 1.6 1.6 0 0 0 1.61 1.6 1.6 1.6 0 0 0 1.6-1.6 1.61 1.61 0 0 0-1.6-1.6z"/>
                                </svg>
                            </div>
                            <div className="contact-details">
                                <span className="contact-label">LinkedIn</span>
                                <span className="contact-text">in/alexjohnson</span>
                            </div>
                        </a>

                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            </div>
                            <div className="contact-details">
                                <span className="contact-label">Location</span>
                                <span className="contact-text">San Francisco, CA</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <div id="right-side-color">
                <div className="main-content-container">
                    
                    {/* Header Section (Profile Placeholder, Name & Bio) */}
                    <header className="profile-header">
                        <div className="profile-identity">
                            <div className="profile-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <div className="profile-titles">
                                <h1 className="student-name">Alex Johnson</h1>
                                <h2 className="student-title">Full Stack Developer & Computer Science Student</h2>
                            </div>
                        </div>

                        <p className="student-bio">
                            Passionate software engineering student with a strong foundation in algorithmic problem solving and full-stack web development. I love building scalable applications, designing clean UI/UX, and exploring new backend technologies. Constantly learning, building, and sharing my knowledge.
                        </p>
                    </header>

                    {/* Projects Section */}
                    <section className="projects-section">
                        <h3 className="section-title">Featured Projects</h3>
                        
                        <div className="projects-grid">
                            
                            <div className="project-card">
                                <div className="project-info">
                                    <h4 className="project-title">E-Commerce REST API</h4>
                                    <p className="project-desc">A robust backend API built with Node.js and Express, featuring JWT authentication, Stripe payment integration, and a MongoDB database for product management.</p>
                                </div>
                                <div className="project-tags">
                                    <span className="tag">Node.js</span>
                                    <span className="tag">Express</span>
                                    <span className="tag">MongoDB</span>
                                </div>
                            </div>

                            <div className="project-card">
                                <div className="project-info">
                                    <h4 className="project-title">Developer Dashboard</h4>
                                    <p className="project-desc">A dynamic React dashboard that aggregates and visualizes data from LeetCode, GitHub, and WakaTime to display real-time coding statistics.</p>
                                </div>
                                <div className="project-tags">
                                    <span className="tag">React</span>
                                    <span className="tag">CSS3</span>
                                    <span className="tag">APIs</span>
                                </div>
                            </div>

                            <div className="project-card">
                                <div className="project-info">
                                    <h4 className="project-title">Pathfinding Visualizer</h4>
                                    <p className="project-desc">An interactive web application that visualizes Dijkstra's and A* pathfinding algorithms using a customizable grid system to help students learn graph theory.</p>
                                </div>
                                <div className="project-tags">
                                    <span className="tag">JavaScript</span>
                                    <span className="tag">Algorithms</span>
                                </div>
                            </div>
                            
                            <div className="project-card">
                                <div className="project-info">
                                    <h4 className="project-title">AI Chat Interface</h4>
                                    <p className="project-desc">A clean, responsive frontend interface built for interacting with large language models, featuring markdown rendering and conversation history.</p>
                                </div>
                                <div className="project-tags">
                                    <span className="tag">Next.js</span>
                                    <span className="tag">Tailwind</span>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Let's Connect CTA Section */}
                    <section className="contact-section">
                        <h3 className="section-title">Get In Touch</h3>
                        <p className="contact-intro">
                            I'm currently seeking software engineering internship and full-time opportunities. Feel free to reach out if you'd like to collaborate or chat!
                        </p>

                        <div className="contact-actions">
                            <a href="mailto:alex.johnson@example.com" className="action-btn primary-btn">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Send Email
                            </a>

                            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="action-btn secondary-btn">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                View Resume
                            </a>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
};