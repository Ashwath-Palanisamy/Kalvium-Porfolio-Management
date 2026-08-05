import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Navbar.css";
import logo from "../assets/kalvium-logo.svg";

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
    const getSession = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        setIsLoggedIn(!!session);
    };

    getSession();

    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
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