import { Fragment, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import "./studentsinfo.css";

const students = [
  {
    id: "S101",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    Role: "Full Stack",
    
  },
  {
    id: "S102",
    name: "Priya Singh",
    email: "priya@gmail.com",
    Role: "Data Science",
    
  },
  {
    id: "S103",
    name: "Arjun Kumar",
    email: "arjun@gmail.com",
    Role: "Frontend",
    
  },
  {
    id: "S104",
    name: "Sneha",
    email: "sneha@gmail.com",
    Role: "Backend",
    
  },
];

const StudentsSection = () => {
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleStudent = (studentId) => {
    setExpandedStudentId((currentId) => (
      currentId === studentId ? null : studentId
    ));
  };

  return (
    <section className="students-section">
      <div className="students-header">
        <div>
          <h2>Students</h2>
          <p>Manage your assigned students.</p>
        </div>

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search students..."
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th aria-label="Expand student details"></th>
              
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const isExpanded = expandedStudentId === student.id;

              return (
                <Fragment key={student.id}>
                  <tr
                    className={`student-row ${isExpanded ? "is-expanded" : ""}`}
                    onClick={() => toggleStudent(student.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleStudent(student.id);
                      }
                    }}
                    tabIndex="0"
                    aria-expanded={isExpanded}
                    aria-label={`Show details for ${student.name}`}
                  >
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.Role}</td>
                    <td className="student-row-toggle">
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="student-expanded-row">
                      <td colSpan="5">
                        <div className="student-expanded-content">
                          <div className="student-expanded-heading">
                            <span>Student information</span>
                            <small>Assigned student</small>
                          </div>
                          <div className="student-info-grid">
                            <div>
                              <span>Student ID</span>
                              <strong>{student.id}</strong>
                            </div>
                            <div>
                              <span>Full name</span>
                              <strong>{student.name}</strong>
                            </div>
                            <div>
                              <span>Email address</span>
                              <strong>{student.email}</strong>
                            </div>
                            <div>
                              <span>Role</span>
                              <strong>{student.Role}</strong>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button>
          <FiChevronLeft />
        </button>

        <span>1</span>

        <button>
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
};

export default StudentsSection;