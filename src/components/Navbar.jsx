import { NavLink } from "react-router-dom";
import "./Navbar.css"
import logo from "../assets/kalvium-logo.svg"

function Navbar(){
    return(
        <header className="header">
             <div className="logo-container">    
                <h1 className="head-name">
                    <img src={logo} alt="Kalvium logo" className="logo"/>
                    <span>Kalvium</span>
                </h1>
            </div>
        <nav>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/students">Students</NavLink></li>
                <li ><NavLink to="/about">About</NavLink></li>
                <li><NavLink to="/search"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
</svg>
</NavLink></li>
                <li className="login-btn"><NavLink to="/login">Login</NavLink></li>
            </ul>
        </nav>
        </header>
        

    );
}

export default Navbar;