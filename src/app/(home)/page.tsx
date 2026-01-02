import type { Metadata } from "next"
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
import { generateMetadata as genMetadata } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo"
import { highPrioritySitemapConfig } from "@/lib/seo"

export const metadata: Metadata = genMetadata({
    title: "Gauss Electromagnetics - High-Power Precision. Global Reliability.",
    description:
        "Leading manufacturer of high-precision electrical equipment including reactors, transformers, VFD chokes, and harmonic filter reactors for industrial applications worldwide.",
    path: "/",
    keywords: [
        "reactors",
        "transformers",
        "VFD chokes",
        "harmonic filter reactors",
        "electrical equipment manufacturer",
        "industrial power solutions",
        "Nashik electrical manufacturer",
        "India electrical equipment",
    ],
    ogImage: "/assets/hero-bg.jpg",
})

export const sitemapConfig = highPrioritySitemapConfig("daily")

const HomePage = () => {
    const organizationSchema = generateOrganizationSchema()
    const websiteSchema = generateWebSiteSchema()

    return (
        <>
            <StructuredData data={[organizationSchema, websiteSchema]} />
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
        </>
    )
}

export default HomePage
