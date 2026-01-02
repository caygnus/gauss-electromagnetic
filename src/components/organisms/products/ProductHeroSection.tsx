import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ASSETS, ROUTES } from "@/lib/constants"

export const ProductHeroSection = () => {
 return (
  <section className="pt-20 bg-primary">
   <div className="container-industrial">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12 lg:py-20">
     {/* Product Image */}
     <div className="order-2 lg:order-1">
      <div className="w-full max-w-md mx-auto relative aspect-square rounded shadow-lg">
       <Image
        src={ASSETS.REACTOR_PRODUCT}
        alt="Industrial Reactor"
        fill
        className="object-cover rounded"
       />
      </div>
     </div>

     {/* Content */}
     <div className="order-1 lg:order-2 text-background">
      <span className="inline-block px-4 py-1 bg-secondary text-charcoal text-sm font-medium rounded mb-4">
       Power Solutions
      </span>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
       Reactors
      </h1>
      <p className="text-xl text-background/80 mb-4">
       Advanced Industrial Reactors
      </p>
      <p className="text-background/70 mb-8 leading-relaxed max-w-lg">
       High-precision reactors designed for power stability, performance, and
       safety across industrial applications.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
       <Button asChild variant="cta" size="lg">
        <Link href={ROUTES.CONTACT}>
         Enquire Now
         <ArrowRight size={18} />
        </Link>
       </Button>
       <Button
        variant="outline"
        size="lg"
        className="bg-transparent border-background text-background hover:bg-background/10"
       >
        <Download size={18} />
        Download Catalog
       </Button>
      </div>

      <a
       href="#support"
       className="inline-flex items-center gap-2 text-background/70 hover:text-secondary transition-colors text-sm"
      >
       <Headphones size={16} />
       Get Technical Support
      </a>
     </div>
    </div>
   </div>
  </section>
 )
}
