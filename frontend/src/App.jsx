import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio";
import Students from "./pages/Students";
import About from "./pages/About/About";
import EditProfile from "./pages/studentdashboard/EditProfile";
import ErrorPage from "./pages/ErrorPage/404page";


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
        
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

export default App;