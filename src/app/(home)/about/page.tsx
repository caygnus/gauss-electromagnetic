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

export const metadata = {
 title: "About Us | Gauss Electromagnetics",
 description:
  "Learn about Gauss Electromagnetics - Precision manufacturing engineered for a resilient, global grid.",
}

const AboutPage = () => {
 return (
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
 )
}

export default AboutPage
