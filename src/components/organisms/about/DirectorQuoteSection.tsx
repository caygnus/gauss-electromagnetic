import Image from "next/image"
import { ASSETS } from "@/lib/constants"

export const DirectorQuoteSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-4xl mx-auto">
                    {/* Portrait */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary">
                        <Image
                            src={ASSETS.DIRECTOR_PORTRAIT}
                            alt="Director Portrait"
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Quote */}
                    <div>
                        <blockquote className="text-lg md:text-xl text-charcoal leading-relaxed mb-4 italic">
                            "At Gauss Electromagnetics, our goal has always been
                            simple – engineer products that industries can trust
                            for decades. Reliability is not just our promise,
                            it's our culture."
                        </blockquote>
                        <div>
                            <p className="font-semibold text-primary">
                                Gauri Nambiar, Director
                            </p>
                            <p className="text-sm text-steel">
                                Gauss Electromagnetics
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
