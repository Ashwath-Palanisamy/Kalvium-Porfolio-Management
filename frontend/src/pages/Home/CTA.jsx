import "./CTA.css"
import { NavLink, useNavigate } from "react-router-dom"
import { FaArrowRightLong } from "react-icons/fa6"
import { useAuthStatus } from "../../hooks/useAuthStatus";
export default function CTA() {

    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStatus();

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate(isAuthenticated ? "/dashboard" : "/login");
    };
    return (
        <section className="cta-band" aria-labelledby="cta-title">
            <div className="cta-band__container">
                <h2 id="cta-title">
                    Ready to Build Your Professional Portfolio?
                </h2>
                <p>Join the Kalvium community and showcase your journey.</p>
                <nav
                    className="cta-band__actions"
                    aria-label="Call to action links"
                >
                    <NavLink
                        to="/students"
                        className="cta-band__button cta-band__button--light"
                    >
                        <span>Explore Students</span>
                        <FaArrowRightLong aria-hidden="true" />
                    </NavLink>
                    <NavLink
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        href="#"
                        onClick={handleLoginClick}
                        className="cta-band__button cta-band__button--ghost"
                    >
                        <span>{isAuthenticated ? "Dashboard" : "Login"}</span>
                        <FaArrowRightLong aria-hidden="true" />
                    </NavLink>
                </nav>
            </div>
        </section>
    )
}
