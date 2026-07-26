import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Footer from './components/Footer'
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio"
import Students from "./pages/Students"

function App() {
  const location = useLocation();
  
  
  const showNavbar = location.pathname !== '/login';

  return(
  <>
      <title>Kalvium Portfolio | Home</title>
    {showNavbar && <Navbar />}
    
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path='/students' element={<Students/>}/>
    </Routes>
    {showNavbar && <Footer/ >}
  </>
  )
}

export default App