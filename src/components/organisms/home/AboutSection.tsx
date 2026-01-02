import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { ASSETS, ROUTES } from "@/lib/constants"

const highlights = [
    {
        image: ASSETS.FACTORY_FLOOR,
        title: "25+ Years of Trusted Experience",
    },
    {
        image: ASSETS.REACTOR_PRODUCT,
        title: "International Standard Quality",
    },
    {
        image: ASSETS.TRANSFORMER_PRODUCT,
        title: "Wide Range of Electrical Products",
    },
    {
        image: ASSETS.FACTORY_FLOOR,
        title: "Customer Centric Service",
    },
]

export const AboutSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                    {/* Left Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                            About us
                        </h2>
                        <Link
                            href={ROUTES.ABOUT}
                            className="inline-flex items-center gap-2 text-secondary font-medium hover:gap-3 transition-all border-b border-secondary pb-1"
                        >
                            See Our Brand Story
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Right Content */}
                    <div>
                        <p className="text-steel leading-relaxed">
                            Gauss Electromagnetics is a Nashik-based
                            manufacturer of quality electrical products like
                            APFC panels, transformers, VFD chokes, and harmonic
                            filter reactors. With over 25 years of experience,
                            we use premium materials, modern manufacturing, and
                            strict testing to ensure every product is reliable
                            and long-lasting. We focus on understanding customer
                            needs and provide honest service, fair pricing, and
                            on-time delivery – becoming a trusted partner for
                            all power-solution requirements.
                        </p>
                    </div>
                </div>

                {/* Highlight Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {highlights.map((item, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden aspect-square rounded"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/70 transition-colors" />
                            <div className="absolute inset-0 flex items-end p-4">
                                <p className="text-background text-sm md:text-base font-medium text-center w-full">
                                    {item.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
