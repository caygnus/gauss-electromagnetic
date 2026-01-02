/**
 * Page Metadata Types & Helpers
 * Type-safe page metadata interface and sitemap configuration
 */

/**
 * Sitemap configuration for pages
 * Export this from page files to control sitemap inclusion
 */
export interface SitemapConfig {
    /** Include this page in sitemap (default: true) */
    include?: boolean
    /** Priority 0.0-1.0 (default: 0.7) */
    priority?: number
    /** Change frequency (default: 'weekly') */
    changefreq?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
    /** Last modified date (optional) */
    lastmod?: string | Date
    /** Additional paths to include (for dynamic routes) */
    additionalPaths?: Array<{
        path: string
        priority?: number
        changefreq?: SitemapConfig["changefreq"]
        lastmod?: string | Date
    }>
}

/**
 * Default sitemap configuration
 */
export const defaultSitemapConfig: Required<
    Omit<SitemapConfig, "lastmod" | "additionalPaths">
> = {
    include: true,
    priority: 0.7,
    changefreq: "weekly",
}

/**
 * Page metadata interface
 */
export interface PageMetadata {
    title: string
    description: string
    keywords?: string[]
    path: string
    ogImage?: string
    noIndex?: boolean
    noFollow?: boolean
    type?: "website" | "article" | "product"
    sitemap?: SitemapConfig
}

/**
 * Extract sitemap config from page metadata
 */
export function extractSitemapConfig(
    metadata: PageMetadata
): SitemapConfig | null {
    if (metadata.sitemap?.include === false) {
        return null
    }

    return {
        include: metadata.sitemap?.include ?? defaultSitemapConfig.include,
        priority: metadata.sitemap?.priority ?? defaultSitemapConfig.priority,
        changefreq:
            metadata.sitemap?.changefreq ?? defaultSitemapConfig.changefreq,
        lastmod: metadata.sitemap?.lastmod,
        additionalPaths: metadata.sitemap?.additionalPaths,
    }
}

/**
 * Validate sitemap config
 */
export function validateSitemapConfig(config: SitemapConfig): boolean {
    if (
        config.priority !== undefined &&
        (config.priority < 0 || config.priority > 1)
    ) {
        return false
    }

    const validChangefreq = [
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
    ]
    if (
        config.changefreq !== undefined &&
        !validChangefreq.includes(config.changefreq)
    ) {
        return false
    }

    return true
}
