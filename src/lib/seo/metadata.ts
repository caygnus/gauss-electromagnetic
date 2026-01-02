/**
 * SEO Metadata Configuration & Utilities
 * Centralized SEO configuration and helper functions for generating metadata
 */

import type { Metadata } from "next"

/**
 * Site Configuration
 * These values can be overridden via environment variables
 */
export const SITE_CONFIG = {
    name: "Gauss Electromagnetics",
    shortName: "Gauss",
    description:
        "Leading manufacturer of high-precision electrical equipment including reactors, transformers, VFD chokes, and harmonic filter reactors for industrial applications worldwide.",
    url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.gausselectromagnetics.com",
    ogImage: "/assets/hero-bg.jpg",
    locale: "en_US",
    type: "website",
    twitterHandle:
        process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@gausselectromagnetics",
    linkedinUrl:
        process.env.NEXT_PUBLIC_LINKEDIN_URL ||
        "https://linkedin.com/company/gausselectromagnetics",
    facebookUrl:
        process.env.NEXT_PUBLIC_FACEBOOK_URL ||
        "https://facebook.com/gausselectromagnetics",
    companyName: "Gauss Electromagnetics",
    companyAddress: {
        street: process.env.NEXT_PUBLIC_COMPANY_STREET || "Nashik, Maharashtra",
        city: "Nashik",
        state: "Maharashtra",
        country: "India",
        postalCode: process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE || "",
    },
    contact: {
        email:
            process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
            "info@gausselectromagnetics.com",
        phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 XXX XXX XXXX",
    },
} as const

/**
 * Default metadata for all pages
 */
export const defaultMetadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
        default: `${SITE_CONFIG.name} - High-Power Precision. Global Reliability.`,
        template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    keywords: [
        "reactors",
        "transformers",
        "VFD chokes",
        "harmonic filter reactors",
        "series reactors",
        "shunt reactors",
        "air core reactors",
        "electrical equipment",
        "industrial electrical",
        "power solutions",
        "Nashik",
        "India",
        "Gauss Electromagnetics",
    ],
    authors: [{ name: SITE_CONFIG.companyName }],
    creator: SITE_CONFIG.companyName,
    publisher: SITE_CONFIG.companyName,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: SITE_CONFIG.locale,
        url: SITE_CONFIG.url,
        siteName: SITE_CONFIG.name,
        title: `${SITE_CONFIG.name} - High-Power Precision. Global Reliability.`,
        description: SITE_CONFIG.description,
        images: [
            {
                url: SITE_CONFIG.ogImage,
                width: 1200,
                height: 630,
                alt: SITE_CONFIG.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE_CONFIG.name} - High-Power Precision. Global Reliability.`,
        description: SITE_CONFIG.description,
        images: [SITE_CONFIG.ogImage],
        creator: SITE_CONFIG.twitterHandle,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        // Add verification codes when available
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
        // yahoo: 'your-yahoo-verification-code',
    },
}

/**
 * Generate page-specific metadata
 */
export interface GenerateMetadataOptions {
    title: string
    description: string
    path?: string
    keywords?: string[]
    ogImage?: string
    noIndex?: boolean
    noFollow?: boolean
    type?: "website" | "article" | "product"
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    canonical?: string
}

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(options: GenerateMetadataOptions): Metadata {
    const {
        title,
        description,
        path = "",
        keywords = [],
        ogImage,
        noIndex = false,
        noFollow = false,
        type = "website",
        publishedTime,
        modifiedTime,
        authors,
        canonical,
    } = options

    const url = `${SITE_CONFIG.url}${path}`
    const imageUrl = ogImage
        ? ogImage.startsWith("http")
            ? ogImage
            : `${SITE_CONFIG.url}${ogImage}`
        : `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`

    const openGraphType = type === "product" ? "website" : type

    const metadata: Metadata = {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        authors: authors ? authors.map((name) => ({ name })) : undefined,
        alternates: {
            canonical: canonical || url,
        },
        openGraph: {
            type: openGraphType,
            url,
            title,
            description,
            siteName: SITE_CONFIG.name,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(authors && { authors }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
            creator: SITE_CONFIG.twitterHandle,
        },
        robots: {
            index: !noIndex,
            follow: !noFollow,
            googleBot: {
                index: !noIndex,
                follow: !noFollow,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    }

    return metadata
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${SITE_CONFIG.url}${cleanPath}`
}

/**
 * Generate OpenGraph image URL
 */
export function getOgImageUrl(imagePath?: string): string {
    if (!imagePath) {
        return `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`
    }
    if (imagePath.startsWith("http")) {
        return imagePath
    }
    return `${SITE_CONFIG.url}${imagePath}`
}
