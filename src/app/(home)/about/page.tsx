import type { Metadata } from "next"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import {
    AboutHeroSection,
    WhoWeAreSection,
    CompanyTimelineSection,
    VisionMissionValuesSection,
    DirectorQuoteSection,
} from "@/components/organisms/about"
import { CTASection } from "@/components/organisms/home"
import { generateMetadata as genMetadata } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateBreadcrumbSchema } from "@/lib/seo"
import { ROUTES } from "@/lib/constants"
import { mediumPrioritySitemapConfig } from "@/lib/seo"

export const metadata: Metadata = genMetadata({
    title: "About Us",
    description:
        "Learn about Gauss Electromagnetics - A trusted electrical manufacturing company with over 25 years of experience delivering high-quality power-solution products for industries across India and global markets.",
    path: ROUTES.ABOUT,
    keywords: [
        "about Gauss Electromagnetics",
        "electrical manufacturer India",
        "Nashik electrical company",
        "25 years experience",
        "power solutions manufacturer",
    ],
})

export const sitemapConfig = mediumPrioritySitemapConfig("monthly")

const AboutPage = () => {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: ROUTES.HOME },
        { name: "About Us", url: ROUTES.ABOUT },
    ])

    return (
        <>
            <StructuredData data={breadcrumbSchema} />
            <div className="min-h-screen">
                <Header />
                <main>
                    <AboutHeroSection />
                    <WhoWeAreSection />
                    <CompanyTimelineSection />
                    <VisionMissionValuesSection />
                    <DirectorQuoteSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </>
    )
}

export default AboutPage
