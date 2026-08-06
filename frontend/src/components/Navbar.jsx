import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ArrowRight } from "lucide-react";
import logo from "../assets/kalvium-logo.svg";
import { useAuthStatus } from "../hooks/useAuthStatus";

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStatus();

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate(isAuthenticated ? "/dashboard" : "/login");
    };

    return (
        <header className="header">
            <div className="logo-container">
                <h1 className="head-name">
                    <img
                        src={logo}
                        alt="Kalvium logo"
                        className="logo"
                    />
                    <span>Kalvium</span>
                </h1>
            </div>

            <nav>
                <ul>
                    <li className="nav-btn">
                        <NavLink to="/">Home</NavLink>
                    </li>

                    <li className="nav-btn">
                        <NavLink to="/students">Students</NavLink>
                    </li>

                    <li className="nav-btn">
                        <NavLink to="/about">About</NavLink>
                    </li>

                    <li className="btn-log">
                        <a
                            href="#"
                            onClick={handleLoginClick}
                            className="login-link"
                        >
                            {isAuthenticated ? "Dashboard" : "Login"}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Navbar;