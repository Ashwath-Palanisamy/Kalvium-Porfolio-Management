import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Footer from './components/Footer'
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio"
import Students from "./pages/Students"
import SearchPage from "./pages/searchPage"
import About from "./pages/About/About"

function App() {
  const location = useLocation();
  
  
  const showNavbar = location.pathname !== '/login';

  return(
  <>
    
    {showNavbar && <Navbar />}
    
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path='/students' element={<Students/>}/>
      <Route path='/manage' element={<IndividualStudentPortfolio/>}/>
      <Route path="/search" element={<SearchPage/>}/>
      <Route path="/about" element={<About />}/>
      
    </Routes>
    {showNavbar && <Footer/ >}
  </>
  )
}

export default App