/**
 * SEO Automation Utilities
 * Route scanning, metadata validation, and SEO health checking
 */

import type { Metadata } from "next"
import { SITE_CONFIG } from "./metadata"
import type { SitemapConfig } from "./page-metadata"

/**
 * SEO Health Check Result
 */
export interface SEOHealthCheck {
    hasTitle: boolean
    hasDescription: boolean
    hasOgImage: boolean
    hasCanonical: boolean
    titleLength: number
    descriptionLength: number
    titleValid: boolean
    descriptionValid: boolean
    issues: string[]
    warnings: string[]
}

/**
 * Validate metadata
 */
export function validateMetadata(metadata: Metadata): SEOHealthCheck {
    const issues: string[] = []
    const warnings: string[] = []

    // Check title
    let title = ""
    if (typeof metadata.title === "string") {
        title = metadata.title
    } else if (metadata.title && typeof metadata.title === "object") {
        title =
            ("default" in metadata.title ? metadata.title.default : "") ||
            ("template" in metadata.title ? metadata.title.template : "") ||
            ""
    }
    const hasTitle = !!title
    const titleLength = title.length
    const titleValid = titleLength > 0 && titleLength <= 60

    if (!hasTitle) {
        issues.push("Missing title")
    } else if (titleLength > 60) {
        warnings.push(
            `Title is too long (${titleLength} characters, recommended: ≤60)`
        )
    } else if (titleLength < 30) {
        warnings.push(
            `Title is too short (${titleLength} characters, recommended: 30-60)`
        )
    }

    // Check description
    const description = metadata.description || ""
    const hasDescription = !!description
    const descriptionLength = description.length
    const descriptionValid =
        descriptionLength >= 120 && descriptionLength <= 160

    if (!hasDescription) {
        issues.push("Missing description")
    } else if (descriptionLength > 160) {
        warnings.push(
            `Description is too long (${descriptionLength} characters, recommended: ≤160)`
        )
    } else if (descriptionLength < 120) {
        warnings.push(
            `Description is too short (${descriptionLength} characters, recommended: 120-160)`
        )
    }

    // Check OpenGraph image
    const hasOgImage =
        !!metadata.openGraph?.images ||
        (Array.isArray(metadata.openGraph?.images) &&
            metadata.openGraph.images.length > 0)

    if (!hasOgImage) {
        warnings.push("Missing OpenGraph image")
    }

    // Check canonical URL
    const hasCanonical = !!metadata.alternates?.canonical

    if (!hasCanonical) {
        warnings.push("Missing canonical URL")
    }

    return {
        hasTitle,
        hasDescription,
        hasOgImage,
        hasCanonical,
        titleLength,
        descriptionLength,
        titleValid,
        descriptionValid,
        issues,
        warnings,
    }
}

/**
 * Generate canonical URL helper
 */
export function generateCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${SITE_CONFIG.url}${cleanPath}`
}

/**
 * Validate sitemap config
 */
export function validateSitemapConfig(config: SitemapConfig): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (config.priority !== undefined) {
        if (config.priority < 0 || config.priority > 1) {
            errors.push(
                `Priority must be between 0.0 and 1.0, got ${config.priority}`
            )
        }
    }

    if (config.changefreq !== undefined) {
        const validFreqs = [
            "always",
            "hourly",
            "daily",
            "weekly",
            "monthly",
            "yearly",
            "never",
        ]
        if (!validFreqs.includes(config.changefreq)) {
            errors.push(
                `Invalid changefreq: ${config.changefreq}. Must be one of: ${validFreqs.join(", ")}`
            )
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Route information for sitemap generation
 */
export interface RouteInfo {
    path: string
    priority: number
    changefreq: SitemapConfig["changefreq"]
    lastmod?: string
}

/**
 * Extract route info from sitemap config
 */
export function extractRouteInfo(
    path: string,
    config: SitemapConfig
): RouteInfo | null {
    if (config.include === false) {
        return null
    }

    return {
        path,
        priority: config.priority ?? 0.7,
        changefreq: config.changefreq ?? "weekly",
        lastmod:
            config.lastmod instanceof Date
                ? config.lastmod.toISOString()
                : config.lastmod,
    }
}
