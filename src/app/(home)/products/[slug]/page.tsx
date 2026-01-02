"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import {
    ProductDetailHero,
    ProductTabs,
    ProductOverviewSection,
    TechnicalSpecificationsSection,
    DocumentationSection,
    CertificationsStandardsSection,
    DownloadProductPackSection,
    ProductDetailCTA,
} from "@/components/organisms/products"

const ProductDetailPage = () => {
    const params = useParams()
    const [activeTab, setActiveTab] = useState("overview")

    const productSlug = params?.slug as string

    // Map slug to product details
    const getProductDetails = (slug: string) => {
        const productMap: Record<string, { name: string; category: string }> = {
            "harmonic-filter-reactors": {
                name: "Harmonic Filter Reactors",
                category: "Reactors",
            },
            "series-reactors": {
                name: "Series Reactors",
                category: "Reactors",
            },
            "shunt-reactors": {
                name: "Shunt Reactors",
                category: "Reactors",
            },
            "air-core-reactors": {
                name: "Air Core Reactors",
                category: "Reactors",
            },
        }

        return (
            productMap[slug] || {
                name: "CygnusPro X500",
                category: "Reactor",
            }
        )
    }

    const productDetails = getProductDetails(productSlug)

    const scrollToSection = (sectionId: string) => {
        setActiveTab(sectionId)
        // Use setTimeout to avoid calling setState synchronously in effect
        setTimeout(() => {
            const element = document.getElementById(sectionId)
            if (element) {
                const offset = 140 // Account for sticky header and tabs
                const top = element.offsetTop - offset
                window.scrollTo({ top, behavior: "smooth" })
            }
        }, 0)
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <ProductDetailHero
                    productId={productSlug}
                    productName={productDetails.name}
                    productCategory={productDetails.category}
                />
                <ProductTabs
                    activeTab={activeTab}
                    onTabChange={scrollToSection}
                />
                <ProductOverviewSection />
                <TechnicalSpecificationsSection />
                <DocumentationSection />
                <CertificationsStandardsSection />
                <DownloadProductPackSection />
                <ProductDetailCTA />
            </main>
            <Footer />
        </div>
    )
}

export default ProductDetailPage
