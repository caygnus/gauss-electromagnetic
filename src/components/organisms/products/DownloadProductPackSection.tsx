import {
    Download,
    FileText,
    Award,
    Layers,
    BookOpen,
    CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const packageItems = [
    { icon: FileText, label: "Product Datasheet" },
    { icon: Award, label: "Certificates" },
    { icon: Layers, label: "CAD Files" },
    { icon: BookOpen, label: "Installation Manual" },
    { icon: Layers, label: "Technical Drawings" },
    { icon: CheckCircle, label: "Compliance Docs" },
]

export const DownloadProductPackSection = () => {
    return (
        <section id="downloads" className="section-padding bg-background">
            <div className="container-industrial">
                <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-4">
                    Download Full Product Pack
                </h2>
                <p className="text-steel text-center mb-12">
                    Get complete technical documentation, certifications, and
                    CAD files in one package
                </p>

                <div className="max-w-2xl mx-auto bg-steel-light border border-border rounded-lg p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                            <Download size={32} className="text-secondary" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-primary text-center mb-6">
                        Complete Product Package
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {packageItems.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                        <CheckCircle
                                            size={12}
                                            className="text-charcoal"
                                        />
                                    </div>
                                    <span className="text-sm text-charcoal">
                                        {item.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-center">
                        <Button variant="industrial" size="lg">
                            <Download size={18} />
                            Download Full Pack (12.5 MB)
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
