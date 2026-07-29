import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../assets/kalvium-logo.svg";

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    useEffect(() => {
        const updateAuth = () => {
            setIsLoggedIn(!!localStorage.getItem("token"));
        };

        window.addEventListener("authChanged", updateAuth);

        return () => {
            window.removeEventListener("authChanged", updateAuth);
        };
    }, []);

    return (
        <header className="header">
            <div className="logo-container">
                <h1 className="head-name">
                    <img src={logo} alt="Kalvium logo" className="logo" />
                    <span>Kalvium</span>
                </h1>
            </div>

            <nav>
                <ul>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/students">Students</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>

                    <li className="login-btn">
                        {isLoggedIn ? (
                            <NavLink to="/dashboard">Dashboard</NavLink>
                        ) : (
                            <NavLink to="/login">Login</NavLink>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Navbar;