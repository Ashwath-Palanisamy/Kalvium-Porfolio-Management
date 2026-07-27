import { Link } from "react-router-dom";
import "./LoginPage.css"
import GoogleIcon from "../assets/icons8-google.svg"
import KalviumLogo from "../assets/kalvium-logo.svg"


export default function LoginPage() {

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

                        <button ><img src={GoogleIcon}></img>Login with Google</button>
                        <Link to="/" className="back-home-btn">Back to Home</Link>
                    </div>
                </div>
            </section>
        </div>
    );

};