import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import {
 ProductHeroSection,
 EngineeringExcellenceSection,
 ReactorPortfolioSection,
 TechnicalAdvantagesSection,
 ProductCTASection,
} from "@/components/organisms/products"

export const metadata = {
 title: "Products - Reactors & Electrical Solutions | Gauss Electromagnetics",
 description:
  "High-precision reactors designed for power stability, performance, and safety across industrial applications.",
}

const ProductsPage = () => {
 return (
  <div className="min-h-screen">
   <Header />
   <main>
    <ProductHeroSection />
    <EngineeringExcellenceSection />
    <ReactorPortfolioSection />
    <TechnicalAdvantagesSection />
    <ProductCTASection />
   </main>
   <Footer />
  </div>
 )
}

export default ProductsPage
