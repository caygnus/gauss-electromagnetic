"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ASSETS, ROUTES } from "@/lib/constants"

export const HeroSection = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={ASSETS.HERO_BG}
                    alt="Hero Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-primary/60" />

            {/* Content */}
            <div className="container-industrial relative z-10">
                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 animate-fade-in">
                        High-Power Precision.
                        <br />
                        Global Reliability.
                    </h1>
                    <p
                        className="text-lg md:text-xl text-background/80 mb-8 max-w-2xl animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Engineered reactors and transformers delivering
                        efficiency, stability, and compact reliability for
                        critical power systems.
                    </p>
                    <div
                        className="flex flex-wrap gap-4 animate-fade-in"
                        style={{ animationDelay: "0.4s" }}
                    >
                        <Button asChild variant="hero" size="lg">
                            <Link href={ROUTES.PRODUCTS}>
                                Explore Flagship Products
                                <ArrowRight size={18} />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/60 animate-scroll-indicator">
                <ChevronDown size={32} />
            </div>
        </section>
    )
}
