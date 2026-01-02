import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export const ProductCTASection = () => {
 return (
  <section className="py-16 bg-primary">
   <div className="container-industrial">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
     <div>
      <h2 className="text-2xl md:text-3xl font-bold text-background mb-2">
       Need a Custom Reactor Solution?
      </h2>
      <p className="text-background/70">
       Our engineering team is ready to design the perfect reactor for your
       application.
      </p>
     </div>
     <Button asChild variant="cta" size="lg">
      <Link href={ROUTES.CONTACT}>
       Enquire Now
       <ArrowRight size={18} />
      </Link>
     </Button>
    </div>
   </div>
  </section>
 )
}
