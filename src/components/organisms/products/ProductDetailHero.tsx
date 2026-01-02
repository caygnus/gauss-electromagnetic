"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download, Headphones, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ASSETS, ROUTES } from "@/lib/constants"

interface ProductDetailHeroProps {
    productId?: string
    productName?: string
    productCategory?: string
}

export const ProductDetailHero = ({
    productId: _productId,
    productName = "CygnusPro X500",
    productCategory = "Reactor",
}: ProductDetailHeroProps) => {
    return (
        <section className="pt-20 bg-primary">
            <div className="container-industrial">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-background/60 py-4">
                    <Link
                        href={ROUTES.PRODUCTS}
                        className="hover:text-secondary transition-colors"
                    >
                        Product
                    </Link>
                    <ChevronRight size={14} />
                    <Link
                        href={ROUTES.PRODUCTS}
                        className="hover:text-secondary transition-colors"
                    >
                        {productCategory}
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-background">{productName}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 lg:py-12">
                    {/* Product Image */}
                    <div className="order-2 lg:order-1">
                        <div className="w-full max-w-sm mx-auto relative aspect-square rounded shadow-lg">
                            <Image
                                src={ASSETS.CIRCUIT_BREAKER}
                                alt={productName}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2 text-background">
                        <span className="inline-block px-4 py-1 bg-secondary text-charcoal text-sm font-medium rounded mb-4">
                            Best Product
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {productName}
                        </h1>
                        <p className="text-xl text-background/80 mb-4">
                            Advanced Industrial Reactor
                        </p>
                        <p className="text-background/70 mb-8 leading-relaxed max-w-lg">
                            Next-generation protection system engineered for
                            high-voltage industrial applications. Delivers
                            unmatched reliability, precision control, and
                            seamless integration with modern automation systems.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <Button asChild variant="cta" size="lg">
                                <Link href={ROUTES.CONTACT}>
                                    Enquire Now
                                    <ArrowRight size={18} />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-transparent border-background text-background hover:bg-background/10"
                            >
                                <Download size={18} />
                                Download Datasheet
                            </Button>
                        </div>

                        <a
                            href="#support"
                            className="inline-flex items-center gap-2 text-background/70 hover:text-secondary transition-colors text-sm"
                        >
                            <Headphones size={16} />
                            Get Technical Support
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
