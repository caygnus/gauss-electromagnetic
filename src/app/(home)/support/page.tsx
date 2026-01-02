import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import { FileText, BookOpen, Download, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import Link from "next/link"

export const metadata = {
    title: "Support & Resources | Gauss Electromagnetics",
    description:
        "Access technical documentation, support resources, training materials, and downloads for our electrical products.",
}

const SupportPage = () => {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                {/* Hero */}
                <section className="py-16 bg-primary">
                    <div className="container-industrial text-center text-background">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Support & Resources
                        </h1>
                        <p className="text-background/70 max-w-2xl mx-auto">
                            Access technical documentation, support resources,
                            and training materials for our electrical products.
                        </p>
                    </div>
                </section>

                {/* Support Sections */}
                <section className="section-padding bg-background">
                    <div className="container-industrial">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Documentation */}
                            <div className="p-6 border border-border rounded hover:border-secondary transition-colors">
                                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-4">
                                    <FileText
                                        size={24}
                                        className="text-secondary"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">
                                    Documentation
                                </h3>
                                <p className="text-sm text-steel mb-4">
                                    Product datasheets, installation manuals,
                                    and technical specifications.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={ROUTES.PRODUCTS}>
                                        View Products
                                    </Link>
                                </Button>
                            </div>

                            {/* Technical Support */}
                            <div className="p-6 border border-border rounded hover:border-secondary transition-colors">
                                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-4">
                                    <Headphones
                                        size={24}
                                        className="text-secondary"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">
                                    Technical Support
                                </h3>
                                <p className="text-sm text-steel mb-4">
                                    Get expert assistance from our technical
                                    team for your application needs.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={ROUTES.CONTACT}>
                                        Contact Support
                                    </Link>
                                </Button>
                            </div>

                            {/* Training */}
                            <div className="p-6 border border-border rounded hover:border-secondary transition-colors">
                                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-4">
                                    <BookOpen
                                        size={24}
                                        className="text-secondary"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">
                                    Training
                                </h3>
                                <p className="text-sm text-steel mb-4">
                                    Training programs and educational resources
                                    for installation and maintenance.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={ROUTES.CONTACT}>
                                        Request Training
                                    </Link>
                                </Button>
                            </div>

                            {/* Downloads */}
                            <div className="p-6 border border-border rounded hover:border-secondary transition-colors">
                                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-4">
                                    <Download
                                        size={24}
                                        className="text-secondary"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-2">
                                    Downloads
                                </h3>
                                <p className="text-sm text-steel mb-4">
                                    Download CAD files, technical drawings, and
                                    product documentation packages.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={ROUTES.PRODUCTS}>
                                        Browse Products
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default SupportPage
