import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { ArrowRight, Menu, X } from "lucide-react";
import logo from "../assets/kalvium-logo.svg";
import { useAuthStatus } from "../hooks/useAuthStatus";

function Navbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, loading } = useAuthStatus();

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    
    const handleLoginClick = (e) => {
        e.preventDefault();
        closeMenu();

        if (loading) return;

        if (isAuthenticated) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <NavLink to="/" className="head-name" onClick={closeMenu}>
                        <img
                            src={logo}
                            alt="Kalvium logo"
                            className="logo"
                        />
                        <span>Kalvium</span>
                        <span className="beta-badge">Beta</span>
                    </NavLink>
                </div>

                
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMenu}
                    aria-label="Toggle Navigation Menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                
                <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
                    <ul>
                        <li className="nav-btn">
                            <NavLink to="/" onClick={closeMenu}>
                                Home
                            </NavLink>
                        </li>

                        <li className="nav-btn">
                            <NavLink to="/students" onClick={closeMenu}>
                                Students
                            </NavLink>
                        </li>

                        <li className="nav-btn">
                            <NavLink to="/leaderboard" onClick={closeMenu}>
                                Leaderboard
                            </NavLink>
                        </li>

                        <li className="btn-log">
                            <a
                                href="#"
                                onClick={handleLoginClick}
                                className="login-link"
                            >
                                {loading ? "Loading..." : isAuthenticated ? "Dashboard" : "Login"}
                                <ArrowRight size={16} className="login-icon" />
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;