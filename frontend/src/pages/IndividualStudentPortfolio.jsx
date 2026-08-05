import "./IndividualStudentPortfolio.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


export default function IndividualStudentPortfolio() {

    const { id } = useParams();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const fetchStudent = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
    
        if (error) {
          console.log(error);
          setLoading(false);
          return;
        }
    
        setStudent(data);
        setLoading(false);
      };
  
      fetchStudent();
    }, [id]);
    

    if (loading) {
          return <h2>Loading...</h2>;
        }

    if (!student) {
          return <h2>Student not found</h2>;
        }

    return (
        <div id="portfolio-background">

            <title>Kalvium Portfolio | Peers</title>

            <div id="left-side-color">

  {/* Contact Card */}
  <div className="coding-profile-card">
    <h2>Contact & Links</h2>

    <div className="contact-list">

      {/* Email */}
      <a
        href={student.email ? `mailto:${student.email}` : "#"}
        className="contact-item"
      >
        <div className="contact-icon">📧</div>

        <div className="contact-details">
          <span className="contact-label">Email</span>
          <span className="contact-text">
            {student.email || "No email available"}
          </span>
        </div>
      </a>

      {/* LinkedIn */}
      {student.linkedin && (
        <a
          href={student.linkedin}
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <div className="contact-icon">💼</div>

          <div className="contact-details">
            <span className="contact-label">LinkedIn</span>
            <span className="contact-text">
              {student.linkedin}
            </span>
          </div>
        </a>
      )}

      {/* GitHub */}
      {student.github && (
        <a
          href={student.github}
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <div className="contact-icon">🐙</div>

          <div className="contact-details">
            <span className="contact-label">GitHub</span>
            <span className="contact-text">
              {student.github}
            </span>
          </div>
        </a>
      )}

      {/* LeetCode */}
      {student.leetcode && (
        <a
          href={student.leetcode}
          target="_blank"
          rel="noreferrer"
          className="contact-item"
        >
          <div className="contact-icon">🟨</div>

          <div className="contact-details">
            <span className="contact-label">LeetCode</span>
            <span className="contact-text">
              {student.leetcode}
            </span>
          </div>
        </a>
      )}

    </div>
  </div>

</div>
            
            <div id="right-side-color">
                <div className="main-content-container">
                    
                    {/* Header Section (Profile Placeholder, Name & Bio) */}
                    <header className="profile-header">
                        <div className="profile-identity">
                            <div className="profile-avatar">
                                <img
                                    src={
                                      student.avatar_url?.trim()
                                        ? student.avatar_url
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            student.name
                                          )}&background=0D8ABC&color=fff&size=256`
                                    }
                                    alt={student.name}
                                    className="profile-avatar"
                                />
                            </div>
                            <div className="profile-titles">
                                <h1 className="student-name">{student.name}</h1>
                                <h2 className="student-title">{student.title}</h2>
                            </div>
                        </div>

                        <p className="student-bio">
                            {student.bio}
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
                            <a href={`mailto:${student.email}`} className="action-btn primary-btn">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Send Email
                            </a>

                            <a href={`/resume.pdf`} target="_blank" rel="noreferrer" className="action-btn secondary-btn">
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