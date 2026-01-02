import type { Metadata } from "next"
import { generateMetadata as genMetadata } from "@/lib/seo"
import { ROUTES } from "@/lib/constants"
import { mediumPrioritySitemapConfig } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = genMetadata({
    title: "Contact Us",
    description:
        "Get in touch with our technical team for customized electrical solutions and expert consultation. High-precision support, global reach. Let's power your project together.",
    path: ROUTES.CONTACT,
    keywords: [
        "contact Gauss Electromagnetics",
        "electrical equipment enquiry",
        "reactor consultation",
        "technical support",
        "custom electrical solutions",
    ],
})

export const sitemapConfig = mediumPrioritySitemapConfig("monthly")

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: ROUTES.HOME },
        { name: "Contact Us", url: ROUTES.CONTACT },
    ])

    return (
        <>
            <StructuredData data={breadcrumbSchema} />
            {children}
        </>
    )
}
