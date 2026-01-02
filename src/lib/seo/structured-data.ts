/**
 * Structured Data (JSON-LD) Generators
 * Schema.org structured data for SEO and rich snippets
 */

import { SITE_CONFIG } from "./metadata"
import { ROUTES, PRODUCT_SLUGS } from "@/lib/constants"

/**
 * Organization Schema (LocalBusiness/Manufacturing)
 */
export interface OrganizationSchemaOptions {
    name?: string
    url?: string
    logo?: string
    description?: string
    address?: {
        street?: string
        city?: string
        state?: string
        postalCode?: string
        country?: string
    }
    contactPoint?: {
        telephone?: string
        email?: string
        contactType?: string
    }
    sameAs?: string[]
}

export function generateOrganizationSchema(
    options: OrganizationSchemaOptions = {}
): object {
    const {
        name = SITE_CONFIG.companyName,
        url = SITE_CONFIG.url,
        logo = `${SITE_CONFIG.url}/assets/iso-badge.jpg`,
        description = SITE_CONFIG.description,
        address = SITE_CONFIG.companyAddress,
        contactPoint = {
            telephone: SITE_CONFIG.contact.phone,
            email: SITE_CONFIG.contact.email,
            contactType: "Customer Service",
        },
        sameAs = [
            SITE_CONFIG.linkedinUrl,
            SITE_CONFIG.facebookUrl,
            `https://twitter.com/${SITE_CONFIG.twitterHandle.replace("@", "")}`,
        ].filter(Boolean),
    } = options

    return {
        "@context": "https://schema.org",
        "@type": "ManufacturingBusiness",
        name,
        url,
        logo: `${SITE_CONFIG.url}${logo}`,
        description,
        address: {
            "@type": "PostalAddress",
            streetAddress: address.street,
            addressLocality: address.city,
            addressRegion: address.state,
            postalCode: address.postalCode,
            addressCountry: address.country,
        },
        contactPoint: {
            "@type": "ContactPoint",
            telephone: contactPoint.telephone,
            email: contactPoint.email,
            contactType: contactPoint.contactType,
        },
        sameAs,
        foundingDate: "1999", // Approximate based on 25+ years experience
        numberOfEmployees: {
            "@type": "QuantitativeValue",
            value: "50-200",
        },
        areaServed: "Worldwide",
    }
}

/**
 * Product Schema
 */
export interface ProductSchemaOptions {
    name: string
    description: string
    image?: string | string[]
    sku?: string
    brand?: string
    category?: string
    offers?: {
        price?: string
        priceCurrency?: string
        availability?: string
        url?: string
    }
    aggregateRating?: {
        ratingValue: string
        reviewCount: string
    }
    additionalProperty?: Array<{
        name: string
        value: string
    }>
}

export function generateProductSchema(options: ProductSchemaOptions): object {
    const {
        name,
        description,
        image,
        sku,
        brand = SITE_CONFIG.companyName,
        category = "Electrical Equipment",
        offers,
        aggregateRating,
        additionalProperty = [],
    } = options

    const images = Array.isArray(image) ? image : image ? [image] : []

    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        brand: {
            "@type": "Brand",
            name: brand,
        },
        category,
        ...(sku && { sku }),
        ...(images.length > 0 && {
            image: images.map((img) =>
                img.startsWith("http") ? img : `${SITE_CONFIG.url}${img}`
            ),
        }),
    }

    if (offers) {
        schema.offers = {
            "@type": "Offer",
            price: offers.price || "0",
            priceCurrency: offers.priceCurrency || "INR",
            availability: offers.availability || "https://schema.org/InStock",
            url: offers.url || SITE_CONFIG.url,
        }
    }

    if (aggregateRating) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue,
            reviewCount: aggregateRating.reviewCount,
        }
    }

    if (additionalProperty.length > 0) {
        schema.additionalProperty = additionalProperty.map((prop) => ({
            "@type": "PropertyValue",
            name: prop.name,
            value: prop.value,
        }))
    }

    return schema
}

/**
 * BreadcrumbList Schema
 */
export interface BreadcrumbItem {
    name: string
    url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url.startsWith("http")
                ? item.url
                : `${SITE_CONFIG.url}${item.url}`,
        })),
    }
}

/**
 * WebSite Schema with SearchAction
 */
export function generateWebSiteSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        publisher: {
            "@type": "Organization",
            name: SITE_CONFIG.companyName,
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    }
}

/**
 * FAQ Schema
 */
export interface FAQItem {
    question: string
    answer: string
}

export function generateFAQSchema(items: FAQItem[]): object {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    }
}

/**
 * Service Schema
 */
export interface ServiceSchemaOptions {
    name: string
    description: string
    serviceType?: string
    areaServed?: string
    provider?: string
}

export function generateServiceSchema(options: ServiceSchemaOptions): object {
    const {
        name,
        description,
        serviceType = "Electrical Manufacturing",
        areaServed = "Worldwide",
        provider = SITE_CONFIG.companyName,
    } = options

    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        serviceType,
        areaServed,
        provider: {
            "@type": "Organization",
            name: provider,
        },
    }
}

/**
 * Article Schema (for blog posts, news, etc.)
 */
export interface ArticleSchemaOptions {
    headline: string
    description: string
    image?: string
    datePublished?: string
    dateModified?: string
    author?: string
    publisher?: string
}

export function generateArticleSchema(options: ArticleSchemaOptions): object {
    const {
        headline,
        description,
        image,
        datePublished,
        dateModified,
        author = SITE_CONFIG.companyName,
        publisher = SITE_CONFIG.companyName,
    } = options

    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        author: {
            "@type": "Organization",
            name: author,
        },
        publisher: {
            "@type": "Organization",
            name: publisher,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_CONFIG.url}/assets/iso-badge.jpg`,
            },
        },
    }

    if (image) {
        schema.image = image.startsWith("http")
            ? image
            : `${SITE_CONFIG.url}${image}`
    }

    if (datePublished) {
        schema.datePublished = datePublished
    }

    if (dateModified) {
        schema.dateModified = dateModified
    }

    return schema
}
