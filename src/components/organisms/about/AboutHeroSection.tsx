import Image from "next/image"
import { ASSETS } from "@/lib/constants"

export const AboutHeroSection = () => {
    return (
        <section className="relative pt-20">
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
            <div className="absolute inset-0 bg-primary/70" />

            {/* Content */}
            <div className="relative container-industrial py-20 md:py-28">
                <h1 className="text-4xl md:text-5xl font-bold text-background mb-4">
                    About Us
                </h1>
                <p className="text-xl text-secondary-white max-w-2xl">
                    Precision manufacturing engineered for a resilient, global
                    grid.
                </p>
            </div>
        </section>
    )
}
