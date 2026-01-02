/**
 * Structured Data Component
 * Injects JSON-LD structured data into pages for SEO
 */

import Script from "next/script"

export interface StructuredDataProps {
    /** JSON-LD structured data object */
    data: object | object[]
    /** Optional ID for the script tag */
    id?: string
}

/**
 * StructuredData Component
 * Renders JSON-LD structured data as a script tag
 */
export function StructuredData({ data, id }: StructuredDataProps) {
    const jsonLd = Array.isArray(data) ? data : [data]

    return (
        <>
            {jsonLd.map((item, index) => (
                <Script
                    key={id || `structured-data-${index}`}
                    id={id || `structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(item, null, 0),
                    }}
                />
            ))}
        </>
    )
}
