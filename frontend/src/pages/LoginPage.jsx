import "./LoginPage.css"
import GoogleIcon from "../assets/icons8-google.svg"
import KalviumLogo from "../assets/kalvium-logo.svg"

import { GoogleLogin } from "@react-oauth/google"

export default function LoginPage() {

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


        console.log("Backend Response:");
        console.log(data);

        } catch (error) {
             console.log("Login Error:", error);
        }
    }

    return (
        <div className="login">

            <title>Kalvium Portfolio | Profile Manager</title>

            <section className="login-left-side">
                <h1>Kalvium <span style={{"color": "red"}}>Portfolio</span></h1>
                <p>Build Your Future.<br />Showcase Your Talent</p>
            </section>

            <section className="login-right-side">
                <div className="top-header">
                    <p><img src={KalviumLogo}/>Kalvium | Profile Manager</p>
                </div>
                <hr/>
                <p></p>
                <div className="google-login-container">
                    <div className="google-login-card">
                        <p>Welcome back!</p>
                        <p>Login to continue to Profile Manager</p>

                        <GoogleLogin 
                            onSuccess={handleGoogleLogin}

                            onError={() =>{
                                console.log("Google Login Failed")
                            }}
                        />
                    </div>
                </div>
            </section>
        </div>
    );

};