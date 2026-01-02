import { Zap, Wifi, Globe } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "High-Voltage Rated",
        description:
            "Certified for 600V-1500V applications with superior arc suppression and fault detection.",
    },
    {
        icon: Wifi,
        title: "Smart Integration",
        description:
            "IoT-ready with Modbus, Profinet, and Ethernet/IP protocols for seamless automation.",
    },
    {
        icon: Globe,
        title: "Global Certified",
        description:
            "Meets IED 60947, UL 489, and CB standards for worldwide deployment confidence.",
    },
]

export const ProductOverviewSection = () => {
    return (
        <section id="overview" className="section-padding bg-background">
            <div className="container-industrial">
                <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-4">
                    Product Overview
                </h2>
                <p className="text-steel text-center max-w-3xl mx-auto mb-12">
                    The CygnusPro X500 represents a breakthrough in industrial
                    circuit protection technology. Designed for mission-critical
                    applications in manufacturing, energy, and infrastructure
                    sectors, it combines advanced safety features with
                    intelligent monitoring capabilities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                            <div
                                key={index}
                                className="text-center p-6 border border-border rounded hover:border-secondary transition-colors"
                            >
                                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconComponent
                                        size={28}
                                        className="text-charcoal"
                                    />
                                </div>
                                <h3 className="font-semibold text-primary mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-steel leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
