import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Footer from './components/Footer'
import PublicStudentPortfolio from "./pages/IndividualStudentPortfolio"
import IndividualStudentPortfolio from "./pages/IndividualStudentPortfolio"

function App() {
  const location = useLocation();
  
  
  const showNavbar = location.pathname !== '/login';

  return(
  <>
    
    {showNavbar && <Navbar />}
    
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path='/students' element={<IndividualStudentPortfolio/>}/>
    </Routes>
    {showNavbar && <Footer/ >}
  </>
  )
}

export default App