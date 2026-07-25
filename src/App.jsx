import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"

function App() {
  const location = useLocation();
  
  
  const showNavbar = location.pathname !== '/login';

  return(
  <>
    
    {showNavbar && <Navbar />}
    
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  </>
  )
}

export default App