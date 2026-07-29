import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio";
import Students from "./pages/Students";
import About from "./pages/About/About";
import EditProfile from "./pages/EditProfile/EditProfile";
import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Footer from './components/Footer'
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio"
import Students from "./pages/Students"
import About from "./pages/About/About"
import ErrorPage from "./pages/ErrorPage/404page"; 
import EditStudent from "./pages/EditStudent"

function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== "/login";
  const showFooter =
    location.pathname !== "/login" &&
    location.pathname !== "/editprofile";

  return (
    <>
      <title>Kalvium Portfolio | Home</title>

      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/students" element={<Students />} />
        <Route path="/manage" element={<IndividualStudentPortfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/editprofile" element={<EditProfile />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
    {showNavbar && <Navbar />}
    
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path='/students' element={<Students/>}/>
      <Route path='/manage' element={<IndividualStudentPortfolio/>}/>
      <Route path="/about" element={<About />}/>
      <Route path="/profile" element={<EditStudent />}></Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
    {showNavbar && <Footer/ >}
  </>
  )
}

export default App;