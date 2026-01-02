/**
 * Sitemap Decorator/Annotation System
 * Utilities for managing sitemap configuration via page exports
 */

import type { SitemapConfig } from "./page-metadata"

/**
 * Sitemap configuration type that can be exported from pages
 */
export type PageSitemapConfig = SitemapConfig

/**
 * Helper to create sitemap config with defaults
 */
export function createSitemapConfig(
    config: Partial<SitemapConfig> = {}
): SitemapConfig {
    return {
        include: config.include ?? true,
        priority: config.priority ?? 0.7,
        changefreq: config.changefreq ?? "weekly",
        lastmod: config.lastmod,
        additionalPaths: config.additionalPaths,
    }
}

/**
 * Exclude page from sitemap
 */
export const excludeFromSitemap: SitemapConfig = {
    include: false,
}

/**
 * High priority page (e.g., homepage)
 */
export function highPrioritySitemapConfig(
    changefreq: SitemapConfig["changefreq"] = "daily"
): SitemapConfig {
    return {
        include: true,
        priority: 1.0,
        changefreq,
    }
}

/**
 * Medium priority page (e.g., main category pages)
 */
export function mediumPrioritySitemapConfig(
    changefreq: SitemapConfig["changefreq"] = "weekly"
): SitemapConfig {
    return {
        include: true,
        priority: 0.8,
        changefreq,
    }
}

/**
 * Low priority page (e.g., legal pages, support)
 */
export function lowPrioritySitemapConfig(
    changefreq: SitemapConfig["changefreq"] = "monthly"
): SitemapConfig {
    return {
        include: true,
        priority: 0.5,
        changefreq,
    }
}

/**
 * Product page sitemap config
 */
export function productSitemapConfig(lastmod?: Date): SitemapConfig {
    return {
        include: true,
        priority: 0.9,
        changefreq: "monthly",
        lastmod: lastmod?.toISOString(),
    }
}
