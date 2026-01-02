import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import {
    HeroSection,
    CompanyIntroSection,
    WhyChooseUsSection,
    AboutSection,
    CertificationsSection,
    CTASection,
} from "@/components/organisms/home"

export const metadata = {
    title: "Gauss Electromagnetics - High-Power Precision. Global Reliability.",
    description:
        "Leading manufacturer of high-precision electrical equipment including reactors, transformers, VFD chokes, and harmonic filter reactors for industrial applications worldwide.",
}

const HomePage = () => {
    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <HeroSection />
                <CompanyIntroSection />
                <WhyChooseUsSection />
                <AboutSection />
                <CertificationsSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
