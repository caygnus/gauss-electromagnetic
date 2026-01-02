/**
 * Asset Paths
 * Centralized asset path constants for consistent image references across the application
 */

const ASSETS_BASE = "/assets"

export const ASSETS = {
    // Hero & Background Images
    HERO_BG: `${ASSETS_BASE}/hero-bg.jpg`,
    CONTACT_HERO_BG: `${ASSETS_BASE}/contact-hero-bg.jpg`,

    // Product Images
    REACTOR_PRODUCT: `${ASSETS_BASE}/reactor-product.jpg`,
    TRANSFORMER_PRODUCT: `${ASSETS_BASE}/transformer-product.jpg`,
    CIRCUIT_BREAKER: `${ASSETS_BASE}/circuit-breaker.jpg`,
    HARMONIC_REACTOR: `${ASSETS_BASE}/harmonic-reactor.jpg`,
    SERIES_REACTOR: `${ASSETS_BASE}/series-reactor.jpg`,
    SHUNT_REACTOR: `${ASSETS_BASE}/shunt-reactor.jpg`,
    AIR_CORE_REACTOR: `${ASSETS_BASE}/air-core-reactor.jpg`,

    // Team & Company Images
    DIRECTOR_PORTRAIT: `${ASSETS_BASE}/director-portrait.jpg`,
    ENGINEERS_TEAM: `${ASSETS_BASE}/engineers-team.jpg`,
    ENGINEERS_TEAM_ALT: `${ASSETS_BASE}/engineers-team(1).jpg`,
    TEAM_VISION: `${ASSETS_BASE}/team-vision.jpg`,
    FACTORY_FLOOR: `${ASSETS_BASE}/factory-floor.jpg`,

    // Certifications & Badges
    ISO_BADGE: `${ASSETS_BASE}/iso-badge.jpg`,
} as const

/**
 * Type for asset keys (for type safety)
 */
export type AssetKey = keyof typeof ASSETS

/**
 * Helper function to get asset path
 */
export const getAssetPath = (key: AssetKey): string => {
    return ASSETS[key]
}
