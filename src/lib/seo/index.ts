/**
 * SEO Utilities - Barrel Export
 */

export * from "./metadata"
export * from "./structured-data"
export * from "./sitemap-decorator"
export * from "./automation"

// Export page-metadata types but not validateSitemapConfig (already in automation)
export type { SitemapConfig, PageMetadata } from "./page-metadata"
export { defaultSitemapConfig, extractSitemapConfig } from "./page-metadata"
