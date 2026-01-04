/**
 * Application Routes
 * Centralized route constants for consistent navigation across the application
 */

export const ROUTES = {
    HOME: "/",
    ABOUT: "/about",
    PRODUCTS: "/products",
    PRODUCTS_DETAIL: (slug: string) => `/products/${slug}`,
    CERTIFICATIONS: "/certifications",
    CONTACT: "/contact",
    PRIVACY: "/privacy",
    TERMS: "/terms",
    SUPPORT: "/support",
    AUTH: {
        CALLBACK: "/auth/callback",
    },
} as const

/**
 * Product slugs for dynamic routing
 */
export const PRODUCT_SLUGS = {
    HARMONIC_FILTER_REACTORS: "harmonic-filter-reactors",
    SERIES_REACTORS: "series-reactors",
    SHUNT_REACTORS: "shunt-reactors",
    AIR_CORE_REACTORS: "air-core-reactors",
} as const

/**
 * Helper function to get product detail route
 */
export const getProductRoute = (slug: string): string => {
    return ROUTES.PRODUCTS_DETAIL(slug)
}
