import type { Metadata } from "next"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import { generateMetadata as genMetadata } from "@/lib/seo"
import { StructuredData } from "@/components/seo"
import { generateBreadcrumbSchema } from "@/lib/seo"
import { ROUTES } from "@/lib/constants"
import { lowPrioritySitemapConfig } from "@/lib/seo"

export const metadata: Metadata = genMetadata({
    title: "Terms of Service",
    description:
        "Terms of service and usage conditions for Gauss Electromagnetics website and services. Please read these terms carefully before using our website.",
    path: ROUTES.TERMS,
    keywords: [
        "terms of service",
        "usage conditions",
        "website terms",
        "legal",
    ],
})

export const sitemapConfig = lowPrioritySitemapConfig("yearly")

const TermsPage = () => {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: ROUTES.HOME },
        { name: "Terms of Service", url: ROUTES.TERMS },
    ])

    return (
        <>
            <StructuredData data={breadcrumbSchema} />
            <div className="min-h-screen">
                <Header />
                <main className="pt-20">
                    {/* Hero */}
                    <section className="py-16 bg-primary">
                        <div className="container-industrial text-center text-background">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-background/70 max-w-2xl mx-auto">
                                Please read these terms carefully before using
                                our website or services.
                            </p>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="section-padding bg-background">
                        <div className="container-industrial max-w-4xl">
                            <div className="prose prose-lg max-w-none">
                                <div className="space-y-6 text-steel">
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-4">
                                            Acceptance of Terms
                                        </h2>
                                        <p>
                                            By accessing and using this website,
                                            you accept and agree to be bound by
                                            the terms and provision of this
                                            agreement. If you do not agree to
                                            these terms, please do not use our
                                            website.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-4">
                                            Use License
                                        </h2>
                                        <p>
                                            Permission is granted to temporarily
                                            download one copy of the materials
                                            on our website for personal,
                                            non-commercial transitory viewing
                                            only. This is the grant of a
                                            license, not a transfer of title.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-4">
                                            Disclaimer
                                        </h2>
                                        <p>
                                            The materials on our website are
                                            provided on an 'as is' basis. We
                                            make no warranties, expressed or
                                            implied, and hereby disclaim and
                                            negate all other warranties
                                            including, without limitation,
                                            implied warranties or conditions of
                                            merchantability, fitness for a
                                            particular purpose, or
                                            non-infringement of intellectual
                                            property or other violation of
                                            rights.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-4">
                                            Limitations
                                        </h2>
                                        <p>
                                            In no event shall Gauss
                                            Electromagnetics or its suppliers be
                                            liable for any damages (including,
                                            without limitation, damages for loss
                                            of data or profit, or due to
                                            business interruption) arising out
                                            of the use or inability to use the
                                            materials on our website.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-primary mb-4">
                                            Revisions
                                        </h2>
                                        <p>
                                            We may revise these terms of service
                                            at any time without notice. By using
                                            this website you are agreeing to be
                                            bound by the then current version of
                                            these terms of service.
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm text-steel/60">
                                            Last updated:{" "}
                                            {new Date().getFullYear()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    )
}

export default TermsPage
