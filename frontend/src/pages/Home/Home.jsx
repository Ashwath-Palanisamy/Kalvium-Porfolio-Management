import Hero from "./Hero"
import AboutPlatform from "./AboutPlatform"
import HowItWorks from "./HowItWorks"
import Features from "./Features"
import CTA from "./CTA"
import RandomStudent from "./RandomStudent.jsx"

export default function Home() {
    return (
        <main>
            <Hero />
            <AboutPlatform />
            <RandomStudent />
            <HowItWorks />
            <Features />
            <CTA />
        </main>
    )
}
