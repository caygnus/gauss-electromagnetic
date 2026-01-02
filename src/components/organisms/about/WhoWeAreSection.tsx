const stats = [
    {
        value: "500+",
        label: "Successful Installations\nAcross Industries",
    },
    {
        value: "12+",
        label: "Active Industrial\nClients",
    },
    {
        value: "200+",
        label: "Custom-Engineered\nElectrical Products",
    },
]

export const WhoWeAreSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                    {/* Left - Title */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Who are we ?
                        </h2>
                    </div>

                    {/* Right - Description */}
                    <div className="space-y-4 text-steel leading-relaxed">
                        <p>
                            Gauss Electromagnetics is a trusted electrical
                            manufacturing company delivering high-quality
                            power-solution products for industries across India
                            and global markets. With over 25 years of
                            experience, we combine engineering expertise,
                            precision manufacturing, and strict quality-control
                            to create products that enhance power reliability,
                            stability, and safety.
                        </p>
                        <p>
                            Our commitment is to provide long-lasting solutions
                            that help our customers operate efficiently, reduce
                            energy losses, and achieve consistent performance in
                            their electrical systems.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                                {stat.value}
                            </div>
                            <p className="text-steel whitespace-pre-line">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
