import React from "react";
import "./LoginPage.css"
import GoogleIcon from "../assets/icons8-google.svg"


export default function LoginPage() {

    return (
        <div className="login">
            <section className="login-left-side">
                <h1>Kalvium <span style={{"color": "red"}}>Portfolio</span></h1>
                <p>Build Your Future.<br />Showcase Your Talent</p>
            </section>

            <section className="login-right-side">
                <div className="top-header">
                    <p>Kalvium | Profile Manager</p>
                </div>
                <p></p>
                <div className="google-login-container">
                    <div className="google-login-card">
                        <p>Welcome back!</p>
                        <p>Login to continue to Profile Manager</p>

                        <button ><img src={GoogleIcon}></img>Login with Google</button>
                    </div>
                </div>
            </section>
        </div>
    );

};