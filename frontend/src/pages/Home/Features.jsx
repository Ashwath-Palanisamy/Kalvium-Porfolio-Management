import "./Features.css"
import {
    FaChartSimple,
    FaCode,
    FaCompassDrafting,
    FaFileCircleCheck,
    FaMagnifyingGlass,
    FaShieldHalved,
    FaTimeline,
    FaUsers,
} from "react-icons/fa6"

const featureItems = [
    {
        title: "Portfolio Builder",
        text: "Create a professional profile in minutes.",
        icon: FaCompassDrafting,
    },
    {
        title: "Project Gallery",
        text: "Showcase your best academic projects.",
        icon: FaCode,
    },
    {
        title: "Certificates",
        text: "Upload and organize your achievements.",
        icon: FaFileCircleCheck,
    },
    {
        title: "Resume Showcase",
        text: "Present verified student resumes professionally.",
        icon: FaChartSimple,
    },
    {
        title: "Skills Timeline",
        text: "Track your learning and growth journey.",
        icon: FaTimeline,
    },
    {
        title: "Mentor Dashboard",
        text: "Mentors can review and support students.",
        icon: FaUsers,
    },
    {
        title: "Search Students",
        text: "Discover and connect within Kalvium.",
        icon: FaMagnifyingGlass,
    },
    {
        title: "Secure Authentication",
        text: "Only Kalvium students and mentors can login.",
        icon: FaShieldHalved,
    },
]

export default function Features() {
    return (
        <>
            <section
                className="features"
                aria-labelledby="platform-features-title"
            >
                <div className="features__container">
                    <header>
                        <p className="features__eyebrow">PLATFORM FEATURES</p>
                        <h2 id="platform-features-title">Platform Features</h2>
                    </header>
                    <div className="features__grid">
                        {featureItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <article
                                    key={item.title}
                                    className="features__card"
                                >
                                    <span
                                        className="features__icon"
                                        aria-hidden="true"
                                    >
                                        <Icon />
                                    </span>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            )
                        })}
                    </div>
                </div>
            </section>
        </>
    )
}
