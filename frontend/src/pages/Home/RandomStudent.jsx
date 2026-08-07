import "./RandomStudent.css";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAllStudents } from "../../api/routes/Public/StudentInfo.js";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function Home() {
  const [featuredStudents, setFeaturedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const responseData = await getAllStudents();

        // 🔍 DEBUG LOG 1: Check what your API actually returns
        console.log("1. Raw API Response from getAllStudents():", responseData);

        // Normalize response whether backend returns an array or an object like { data: [...] } or { profiles: [...] }
        const profilesList = Array.isArray(responseData)
          ? responseData
          : responseData?.data || responseData?.profiles || [];

        // 🔍 DEBUG LOG 2: Inspect the first item structure
        if (profilesList.length > 0) {
          console.log("2. First Student Profile Object Keys:", Object.keys(profilesList[0]));
          console.log("3. First Student Profile Full Data:", profilesList[0]);
        } else {
          console.warn("⚠️ API returned an empty list of profiles!");
        }

        const students = profilesList
          .map((student) => {
            // Check all potential ID column keys (snake_case, camelCase, etc.)
            const actualId =
              student.user_id ||
              student.userId ||
              student.id ||
              student._id ||
              student.student_id ||
              student.studentId;

            if (!actualId) {
              console.error("❌ Profile missing a recognized ID property:", student);
              return null;
            }

            return {
              id: actualId,
              name: student.name || "Unknown",
              title: student.title || "Student",
              avatar: student.avatar_url?.trim()
                ? student.avatar_url
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    student.name || "Student"
                  )}&background=0D8ABC&color=fff&size=256`,
            };
          })
          .filter(Boolean);

        if (isMounted) {
          setFeaturedStudents(shuffleArray(students).slice(0, 4));
        }
      } catch (err) {
        console.error("❌ Unexpected error fetching students via API:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="featured-container">
      <h3>Featured Builders</h3>

      {loading ? (
        <div className="students">
          {[1, 2, 3, 4].map((n) => (
            <div className="student-card skeleton-card" key={n}>
              <div className="skeleton-avatar" />
              <div className="skeleton-text" />
            </div>
          ))}
        </div>
      ) : (
        <div className="students">
          {featuredStudents.map((student) => (
            <div className="student-card" key={student.id}>
              <img
                src={student.avatar}
                alt={student.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    student.name
                  )}&background=0D8ABC&color=fff&size=256`;
                }}
              />

              <h4>{student.name}</h4>
              <p>{student.title}</p>

              <NavLink
                to={`/portfolio/${student.id}`}
                className="student-redirect"
              >
                View Profile →
              </NavLink>
            </div>
          ))}
        </div>
      )}

      <div className="view-all-container">
        <NavLink to="/students" className="home-all-student">
          Explore All Profiles ▶
        </NavLink>
      </div>
    </section>
  );
}

export default Home;