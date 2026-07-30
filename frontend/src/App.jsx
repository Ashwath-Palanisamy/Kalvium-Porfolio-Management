import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Footer from "./components/Footer";
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio.jsx";
import Students from "./pages/Students.jsx";
import About from "./pages/About/About.jsx";
import EditProfile from "./pages/studentdashboard/EditProfile.jsx";

function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== "/login" && location.pathname !== "/dashboard";
  const showFooter =
    location.pathname !== "/login" &&
    location.pathname !== "/dashboard";

  return (
    <>
      <title>Kalvium Portfolio | Home</title>

      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/students" element={<Students />} />
        <Route path="/profile/:id" element={<IndividualStudentPortfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<EditProfile />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

export default App;