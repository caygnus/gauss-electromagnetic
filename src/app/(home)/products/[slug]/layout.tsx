import type { Metadata } from "next"
import { generateMetadata as genMetadata } from "@/lib/seo"
import { ROUTES, PRODUCT_SLUGS, ASSETS } from "@/lib/constants"
import { productSitemapConfig } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo"

// Product information mapping
const productMap: Record<
    string,
    {
        name: string
        description: string
        keywords: string[]
        image: string
    }
> = {
    [PRODUCT_SLUGS.HARMONIC_FILTER_REACTORS]: {
        name: "Harmonic Filter Reactors",
        description:
            "High-precision harmonic filter reactors designed to remove unwanted electrical noise (harmonics) and protect equipment in industrial power systems. Engineered for superior performance and reliability.",
        keywords: [
            "harmonic filter reactors",
            "harmonic filters",
            "power quality",
            "electrical noise reduction",
            "industrial reactors",
        ],
        image: "/assets/harmonic-reactor.jpg",
    },
    [PRODUCT_SLUGS.SERIES_REACTORS]: {
        name: "Series Reactors",
        description:
            "Series reactors used in series with power lines to limit short circuit currents and stabilize line voltage. Essential for power system protection and voltage regulation.",
        keywords: [
            "series reactors",
            "current limiting reactors",
            "short circuit protection",
            "voltage stabilization",
            "power line reactors",
        ],
        image: "/assets/series-reactor.jpg",
    },
    [PRODUCT_SLUGS.SHUNT_REACTORS]: {
        name: "Shunt Reactors",
        description:
            "Shunt reactors used to absorb excess reactive power and prevent over-voltage in long transmission lines. Critical for maintaining power system stability and efficiency.",
        keywords: [
            "shunt reactors",
            "reactive power compensation",
            "over-voltage protection",
            "transmission line reactors",
            "power system stability",
        ],
        image: "/assets/shunt-reactor.jpg",
    },
    [PRODUCT_SLUGS.AIR_CORE_REACTORS]: {
        name: "Air Core Reactors",
        description:
            "Air core reactors used where high currents and fast response are needed without risk of saturation. Ideal for filter applications and high-voltage substations.",
        keywords: [
            "air core reactors",
            "non-saturable reactors",
            "high current reactors",
            "filter reactors",
            "HV substation reactors",
        ],
        image: "/assets/air-core-reactor.jpg",
    },
}

export async function generateStaticParams() {
    return Object.values(PRODUCT_SLUGS).map((slug) => ({ slug }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const product = productMap[slug] || {
        name: "Product",
        description:
            "High-precision electrical equipment from Gauss Electromagnetics.",
        keywords: ["electrical equipment", "reactors"],
        image: "/assets/reactor-product.jpg",
    }

    return genMetadata({
        title: product.name,
        description: product.description,
        path: ROUTES.PRODUCTS_DETAIL(slug),
        keywords: product.keywords,
        ogImage: product.image,
        type: "product",
    })
}

export const sitemapConfig = productSitemapConfig()

// Product image mapping
const productImageMap: Record<string, string> = {
    [PRODUCT_SLUGS.HARMONIC_FILTER_REACTORS]: ASSETS.HARMONIC_REACTOR,
    [PRODUCT_SLUGS.SERIES_REACTORS]: ASSETS.SERIES_REACTOR,
    [PRODUCT_SLUGS.SHUNT_REACTORS]: ASSETS.SHUNT_REACTOR,
    [PRODUCT_SLUGS.AIR_CORE_REACTORS]: ASSETS.AIR_CORE_REACTOR,
}

export default function ProductDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    return (
        <ProductDetailLayoutClient params={params}>
            {children}
        </ProductDetailLayoutClient>
    )
}

async function ProductDetailLayoutClient({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const product = productMap[slug] || {
        name: "Product",
        description:
            "High-precision electrical equipment from Gauss Electromagnetics.",
        keywords: ["electrical equipment", "reactors"],
        image: ASSETS.REACTOR_PRODUCT,
    }

    const productImage = productImageMap[slug] || ASSETS.REACTOR_PRODUCT

    // Generate product schema
    const productSchema = generateProductSchema({
        name: product.name,
        description: product.description,
        image: productImage,
        category: "Electrical Equipment",
        brand: "Gauss Electromagnetics",
        offers: {
            availability: "https://schema.org/InStock",
            priceCurrency: "INR",
        },
    })

    // Generate breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: ROUTES.HOME },
        { name: "Products", url: ROUTES.PRODUCTS },
        { name: product.name, url: ROUTES.PRODUCTS_DETAIL(slug) },
    ])

    return (
        <>
            <StructuredData data={[productSchema, breadcrumbSchema]} />
            {children}
        </>
    )
}
