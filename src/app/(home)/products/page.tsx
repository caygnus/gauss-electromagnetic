import type { Metadata } from "next"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import {
    ProductHeroSection,
    EngineeringExcellenceSection,
    ReactorPortfolioSection,
    TechnicalAdvantagesSection,
    ProductCTASection,
} from "@/components/organisms/products"
import { generateMetadata as genMetadata } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateBreadcrumbSchema } from "@/lib/seo"
import { ROUTES } from "@/lib/constants"
import { mediumPrioritySitemapConfig } from "@/lib/seo"

export const metadata: Metadata = genMetadata({
    title: "Products - Reactors & Electrical Solutions",
    description:
        "Explore our comprehensive range of high-precision reactors, transformers, and electrical solutions. Harmonic filter reactors, series reactors, shunt reactors, and air core reactors designed for power stability, performance, and safety across industrial applications.",
    path: ROUTES.PRODUCTS,
    keywords: [
        "reactors",
        "harmonic filter reactors",
        "series reactors",
        "shunt reactors",
        "air core reactors",
        "transformers",
        "VFD chokes",
        "electrical equipment",
        "industrial power solutions",
    ],
})

export const sitemapConfig = mediumPrioritySitemapConfig("weekly")

const ProductsPage = () => {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: ROUTES.HOME },
        { name: "Products", url: ROUTES.PRODUCTS },
    ])

    return (
        <>
            <StructuredData data={breadcrumbSchema} />
            <div className="min-h-screen">
                <Header />
                <main>
                    <ProductHeroSection />
                    <EngineeringExcellenceSection />
                    <ReactorPortfolioSection />
                    <TechnicalAdvantagesSection />
                    <ProductCTASection />
                </main>
                <Footer />
            </div>
        </>
    )
}

export default ProductsPage
