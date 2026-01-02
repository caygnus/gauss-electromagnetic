import { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/lib/seo"
import { ROUTES, PRODUCT_SLUGS } from "@/lib/constants"

/**
 * Generate sitemap for the website
 * This integrates with next-sitemap for automated generation
 * and also provides a fallback sitemap using Next.js App Router API
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SITE_CONFIG.url

    // Static routes with their priorities and change frequencies
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}${ROUTES.ABOUT}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}${ROUTES.PRODUCTS}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}${ROUTES.CERTIFICATIONS}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}${ROUTES.CONTACT}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}${ROUTES.SUPPORT}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}${ROUTES.PRIVACY}`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}${ROUTES.TERMS}`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ]

    // Dynamic product routes
    const productRoutes: MetadataRoute.Sitemap = Object.values(
        PRODUCT_SLUGS
    ).map((slug) => ({
        url: `${baseUrl}${ROUTES.PRODUCTS_DETAIL(slug)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.9,
    }))

    return [...staticRoutes, ...productRoutes]
}
