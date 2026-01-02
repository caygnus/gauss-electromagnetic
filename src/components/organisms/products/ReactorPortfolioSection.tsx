import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ASSETS, PRODUCT_SLUGS, getProductRoute } from "@/lib/constants"

const reactors = [
    {
        image: ASSETS.HARMONIC_REACTOR,
        title: "Harmonic Filter Reactors",
        description:
            "To remove unwanted electrical noise (harmonics) and protect equipment in industrial power systems.",
        slug: PRODUCT_SLUGS.HARMONIC_FILTER_REACTORS,
    },
    {
        image: ASSETS.SERIES_REACTOR,
        title: "Series Reactors",
        description:
            "Used in series with power lines to limit short circuit currents and stabilize line volts.",
        slug: PRODUCT_SLUGS.SERIES_REACTORS,
    },
    {
        image: ASSETS.SHUNT_REACTOR,
        title: "Shunt Reactors",
        description:
            "Used to absorb excess reactive power and prevent over-voltage in long transmission lines.",
        slug: PRODUCT_SLUGS.SHUNT_REACTORS,
    },
    {
        image: ASSETS.AIR_CORE_REACTOR,
        title: "Air Core Reactors",
        description:
            "Used where high currents and fast response are needed, without risk to saturation (like in filter and HV substations).",
        slug: PRODUCT_SLUGS.AIR_CORE_REACTORS,
    },
]

export const ReactorPortfolioSection = () => {
    return (
        <section className="section-padding bg-steel-light">
            <div className="container-industrial">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                        Our Reactor Portfolio
                    </h2>
                    <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
                    <p className="text-steel max-w-2xl mx-auto">
                        Comprehensive range of reactor solutions engineered for
                        diverse industrial applications
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reactors.map((reactor, index) => (
                        <div
                            key={index}
                            className="bg-background rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-square overflow-hidden relative">
                                <Image
                                    src={reactor.image}
                                    alt={reactor.title}
                                    fill
                                    className="object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-primary mb-2">
                                    {reactor.title}
                                </h3>
                                <p className="text-sm text-steel mb-4 leading-relaxed">
                                    {reactor.description}
                                </p>
                                <Button
                                    asChild
                                    variant="industrial"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Link href={getProductRoute(reactor.slug)}>
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
