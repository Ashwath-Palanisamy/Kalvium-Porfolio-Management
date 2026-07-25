import "./Footer.css";
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
    
            {/* Logo Section */}
            <div className="footer-logo">
                <h1>KALVIUM</h1>
                <p>
                    Empowering Kalvium students to showcase their talent and build a
                    brighter future.
                </p>
    
            <div className="social-icons">
                <FaGithub/ >
                <FaInstagram/ >
                <FaLinkedin/ >
                <FaYoutube/ >
            </div>
            </div>
    
            {/* About */}
            <div className="footer-section">
                <h2>About</h2>
                <ul>
                    <li>About Us</li>
                    <li>How It Works</li>
                    <li>Features</li>
                </ul>
            </div>
    
            {/* Students */}
            <div className="footer-section">
                <h2>Students</h2>
                <ul>
                    <li>All Students</li>
                    <li>Top Developers</li>
                    <li>Leaderboard</li>
                </ul>
            </div>
    
            {/* Contact */}
            <div className="footer-section">
                <h2>Contact</h2>
                <ul>
                    <li>Reach Us</li>
                    <li>Support</li>
                    <li>FAQ</li>
                </ul>
            </div>
    
            {/* Legal */}
            <div className="footer-section">
                <h2>Legal</h2>
                <ul>
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                    <li>Cookie Policy</li>
                </ul>
            </div>
    
            </div>
    
            <p className="copyright">
                © 2026 Kalvium Portfolio. All rights reserved.
            </p>
        </footer>
  );
}

export default Footer;