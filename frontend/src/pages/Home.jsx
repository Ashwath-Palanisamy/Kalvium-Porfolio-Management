import "./Home.css";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import {
  FiUsers,
  FiFolder,
  FiGithub,
  FiFileText,
  FiCode,
} from "react-icons/fi";
import { LuBadgeCheck } from "react-icons/lu";
import Heroimage from "./image.png";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  
  const [featuredStudents, setFeaturedStudents] = useState([]);

  const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};


useEffect(() => {
  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    const students = data.map((student) => ({
      id: student.id,
      name: student.name || "Unknown",
      title: student.title || "Student",

      avatar:
        student.avatar_url?.trim()
          ? student.avatar_url
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              student.name || "Student"
            )}&background=0D8ABC&color=fff&size=256`,
    }));

    setFeaturedStudents(
      shuffleArray(students).slice(0, 4)
    );
  };

  fetchStudents();
}, []);

  return (
    <div>
      {/* Hero section */}
      <section className="hero container">
        <div className="hero-text">
          <h1 className="hero-headline">
            BUILD. <span className="accent">SHOWCASE.</span> <br />
            <span className="accent">GROW</span> TOGETHER.
          </h1>
          <p className="hero-subtext">
            A community platform built by Kalvium students, for Kalvium students. <br />
            Showcase your projects, share your technical proof-of-work, <br />
            and inspire your peers through one interactive profile. <br />
          </p>
          <div className="hero-buttons">
            <NavLink to="/students" className="btn btn-primary">
              Explore Profiles →
            </NavLink>
            {isLoggedIn ? (
              <NavLink to="/dashboard" className="btn btn-secondary">
                Manage Portfolio →
              </NavLink>
            ) : (
              <NavLink to="/login" className="btn btn-secondary">
                Login →
              </NavLink>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <img
            src={Heroimage}
            alt="Kalvium student showcase preview"
            className="hero-image"
            width="300px"
          />
        </div>
      </section>

      {/* Highlights Strip (Replaced Fake Stats) */}
      <section className="stats-bar">
        <div className="stat">
          <div className="stat-number" style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            🚀 Build in Public
          </div>
          <div className="stat-label">Share real-world student projects</div>
        </div>
        <div className="stat">
          <div className="stat-number" style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            ⚡ Proof of Work
          </div>
          <div className="stat-label">GitHub & Live Demo links</div>
        </div>
        <div className="stat">
          <div className="stat-number" style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            🤝 Peer Inspiration
          </div>
          <div className="stat-label">Learn & grow with fellow builders</div>
        </div>
      </section>

      {/* Featured Students */}
      <section className="featured-container">
        <h3>Featured Builders</h3>
        <div className="students">
          {featuredStudents.map((student) => (
            <div className="student-card" key={student.id}>
              <img
                src={student.avatar}
                alt={student.name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    student.name
                  )}&background=0D8ABC&color=fff&size=256`;
                }}
              />

              <h4>{student.name}</h4>
              
              <p>{student.title}</p>
              
              <NavLink
                to={`/student/${student.id}`}
                className="student-redirect"
              >
                View Profile →
              </NavLink>
            </div>
          ))}
        </div>

        <div className="view-all-container">
          <NavLink to="/students" className="home-all-student">
            Explore All Profiles ▶
          </NavLink>
        </div>
      </section>

      {/* Why Platform Section */}
      <section className="why-section">
        <h3>Why Join the Student Showcase?</h3>

        <div className="why-container">
          <div className="why-item">
            <div className="icon-circle">
              <LuBadgeCheck size={28} color="#ff3b3b" />
            </div>
            <p>Developer<br />Digital Identity</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiUsers size={28} color="#ff3b3b" />
            </div>
            <p>Peer & Community<br />Inspiration</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiFolder size={28} color="#ff3b3b" />
            </div>
            <p>Project & Skill<br />Exhibition</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiGithub size={28} color="#ff3b3b" />
            </div>
            <p>GitHub & Live<br />Demo Showcase</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiFileText size={28} color="#ff3b3b" />
            </div>
            <p>Centralized<br />Proof of Work</p>
          </div>

          <div className="why-item">
            <div className="icon-circle">
              <FiCode size={28} color="#ff3b3b" />
            </div>
            <p>Build in Public<br />Culture</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Showcase Your Work?</h2>
        <p>"Build in Public. Inspire Your Community."</p>

        {isLoggedIn ? (
          <NavLink to="/dashboard" className="btn-create-portfolio">
            Update Profile →
          </NavLink>
        ) : (
          <NavLink to="/login" className="btn-create-portfolio">
            Sign In & Build Profile →
          </NavLink>
        )}

      </section>
    </div>
  );
}

export default Home;