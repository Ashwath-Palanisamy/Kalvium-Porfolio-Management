import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import GoogleIcon from "../assets/icons8-google.svg";
import KalviumLogo from "../assets/kalvium-logo.svg";
import { supabase } from "../lib/supabase.js";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isExiting, setIsExiting] = useState(false);

    // Intercept database rejections when redirected back here from Google/Supabase
    useEffect(() => {
        const handleAuthCallbackErrors = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const errorCode = queryParams.get("error_code");
            const errorDescription = queryParams.get("error_description");

            if (errorCode || errorDescription) {
                showError("Access Denied: You must use an official @kalvium.com or @kalvium.community email address.");
                
                // Clear out any partial tokens and strip the error text from the URL bar
                await supabase.auth.signOut();
                window.history.replaceState(null, "", window.location.pathname);
            }
        };

        handleAuthCallbackErrors();
    }, []);

    useEffect(() => {
        if (!errorMessage) return;

        setIsExiting(false);

        const displayTimer = setTimeout(() => {
            setIsExiting(true);
        }, 10000);

        return () => clearTimeout(displayTimer);
    }, [errorMessage]);

    useEffect(() => {
        if (!isExiting) return;

        const exitTimer = setTimeout(() => {
            setErrorMessage("");
            setIsExiting(false);
        }, 400);

        return () => clearTimeout(exitTimer);
    }, [isExiting]);

    const showError = (msg) => {
        setIsExiting(false);
        setErrorMessage(msg);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // Redirect back to login page so blocked users are caught here
                redirectTo: "http://localhost:5173/login"
            }
        });

        if (error) {
            showError(error.message);
        }
    };

    return (
        <div className="login">
            {errorMessage && (
                <div className={`error-toast ${isExiting ? "slide-out" : ""}`}>
                    <div className="error-icon-box">!</div>
                    <span className="error-message-text">{errorMessage}</span>
                </div>
            )}

            <title>Kalvium Portfolio | Profile Manager</title>

            <section className="login-left-side">
                <h1>Kalvium <span style={{ "color": "red" }}>Portfolio</span></h1>
                <p>Build Your Future.<br />Showcase Your Talent</p>
            </section>

            <section className="login-right-side">
                <div className="top-header">
                    <p><img src={KalviumLogo} alt="Kalvium Logo" />Kalvium | Profile Manager</p>
                </div>
                <hr />
                <div className="google-login-container">
                    <div className="google-login-card">
                        <p>Welcome back!</p>
                        <p>Login to continue to Profile Manager</p>

                        <button className="google-btn-login" onClick={handleGoogleLogin}>
                            <img src={GoogleIcon} alt="google"/>
                            Continue With Google
                        </button>
                        <Link to="/" className="back-home-btn">Back to Home</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}