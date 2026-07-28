import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import GoogleIcon from "../assets/icons8-google.svg";
import KalviumLogo from "../assets/kalvium-logo.svg";

import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isExiting, setIsExiting] = useState(false);

    const navigate = useNavigate()

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

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await fetch(
                "http://localhost:8000/api/auth/google",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: credentialResponse.credential
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || data.error) {
                showError("Access restricted: Please log in using an official @kalvium.community or @kalvium.com account.");
                return;
            }

            setErrorMessage("");
            console.log("Backend Response:", data);

            localStorage.setItem("token", data.token)

            localStorage.setItem("user", JSON.stringify(data.user))

            navigate("/profile")

        } catch (error) {
            console.log("Login Error:", error);
            showError("Access restricted: Please log in using an official @kalvium.community or @kalvium.com account.");
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

                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                console.log("Google Login Failed");
                                showError("Access restricted: Please log in using an official @kalvium.community or @kalvium.com account.");
                            }}
                        />
                        <Link to="/" className="back-home-btn">Back to Home</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}