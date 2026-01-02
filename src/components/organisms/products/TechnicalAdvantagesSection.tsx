import { Activity, Shield, Clock, Zap, HardHat, Settings } from "lucide-react"

const advantages = [
    {
        icon: Activity,
        title: "Improved Grid Stability",
        description:
            "Advanced design ensures consistent power quality and voltage regulation across all load conditions.",
    },
    {
        icon: Shield,
        title: "High Insulation Levels",
        description:
            "Premium insulation materials and design standards ensure safe operation in demanding environments.",
    },
    {
        icon: Clock,
        title: "Long Lifecycle Performance",
        description:
            "Robust construction and quality materials deliver decades of reliable service with minimal maintenance.",
    },
    {
        icon: Zap,
        title: "Low Energy Losses",
        description:
            "Optimized core and high-efficiency windings minimize power losses and operating costs.",
    },
    {
        icon: HardHat,
        title: "Heavy Industrial Design",
        description:
            "Engineered to withstand harsh industrial conditions including extreme temperatures and vibrations.",
    },
    {
        icon: Settings,
        title: "Custom Engineering",
        description:
            "Tailored solutions designed to meet specific application requirements and performance criteria.",
    },
]

export const TechnicalAdvantagesSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                        Technical Advantages
                    </h2>
                    <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
                    <p className="text-steel max-w-2xl mx-auto">
                        Engineered for performance, built for reliability
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advantages.map((advantage, index) => {
                        const IconComponent = advantage.icon
                        return (
                            <div
                                key={index}
                                className="p-6 bg-background border border-border rounded hover:border-secondary transition-colors group"
                            >
                                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                                    <IconComponent
                                        size={24}
                                        className="text-background group-hover:text-charcoal transition-colors"
                                    />
                                </div>
                                <h3 className="font-semibold text-primary mb-2">
                                    {advantage.title}
                                </h3>
                                <p className="text-sm text-steel leading-relaxed">
                                    {advantage.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
