import Image from "next/image"

export const WhyChooseUsSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-10">
                    Why Choose us
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 rounded overflow-hidden">
                    {/* Left Content - Navy Background */}
                    <div className="bg-primary p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-background mb-4">
                            Engineering Precision
                            <br />
                            You Can Trust
                        </h3>
                        <div className="w-20 h-1 bg-secondary mb-6" />
                        <p className="text-background/80 leading-relaxed">
                            High-accuracy designs and strict quality control for
                            dependable performance. Our commitment to precision
                            engineering ensures every product meets the highest
                            standards.
                        </p>
                    </div>

                    {/* Right Content - Image */}
                    <div className="relative aspect-[4/3] lg:aspect-auto">
                        <Image
                            src="/assets/engineers-team.jpg"
                            alt="Engineering team reviewing blueprints"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
