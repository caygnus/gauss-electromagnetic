import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export const ProductDetailCTA = () => {
    return (
        <section className="py-16 bg-primary">
            <div className="container-industrial text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-background mb-4">
                    Looking for High-Precision Electrical Equipment?
                </h2>
                <p className="text-background/70 mb-8 max-w-2xl mx-auto">
                    Our engineering team is ready to help you find the perfect
                    solution for your industrial needs
                </p>
                <Button asChild variant="cta" size="lg">
                    <Link href={ROUTES.CONTACT}>
                        Enquire Now
                        <ArrowRight size={18} />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
