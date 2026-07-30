import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio";
import Students from "./pages/Students";
import About from "./pages/About/About";
import EditProfile from "./pages/studentdashboard/EditProfile";
import ErrorPage from "./pages/ErrorPage/404page";
import AuthGate from "./components/AuthGate"; 

function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== "/login" && !location.pathname.startsWith("/dashboard");
  const showFooter = location.pathname !== "/login" && !location.pathname.startsWith("/dashboard");

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
        
        {/* Protected Dashboard Route wrapped securely with AuthGate */}
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <EditProfile />
            </AuthGate>
          }
        />
        
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

export default App;