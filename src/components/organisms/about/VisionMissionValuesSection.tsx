import Image from "next/image"

export const VisionMissionValuesSection = () => {
    return (
        <section className="bg-background">
            <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Vision - Large Card */}
                <div className="relative aspect-square md:aspect-auto md:row-span-1">
                    <Image
                        src="/assets/team-vision.jpg"
                        alt="Our Vision"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/60" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <span className="text-secondary-white text-sm font-medium mb-2">
                            Vision
                        </span>
                        <p className="text-background text-sm leading-relaxed">
                            To be the most trusted name in India's
                            electrical-power equipment industry delivering
                            reliable, efficient and world-class solutions that
                            power industries safely and sustainably.
                        </p>
                    </div>
                </div>

                {/* Mission Card */}
                <div className="relative aspect-square">
                    <Image
                        src="/assets/factory-floor.jpg"
                        alt="Our Mission"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-background text-2xl font-bold">
                            Mission
                        </span>
                    </div>
                </div>

                {/* Values Card */}
                <div className="relative aspect-square">
                    <Image
                        src="/assets/team-vision.jpg"
                        alt="Our Values"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-charcoal text-2xl font-bold">
                            Values
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
