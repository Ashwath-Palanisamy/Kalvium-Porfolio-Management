import "./RandomStudent.css";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFeaturedStudents } from "../../api/routes/Public/StudentInfo";


function Home() {
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
      try {
        const data = await getFeaturedStudents();

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

        setFeaturedStudents(students);
      } catch (error) {
        console.error("Error fetching featured students:", error);
      }
    };

    fetchStudents();
  }, []);

  return (
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
  );
}

export default Home;