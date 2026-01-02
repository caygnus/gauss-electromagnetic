import Link from "next/link"
import { Zap, Linkedin, Twitter, Youtube } from "lucide-react"
import { ROUTES } from "@/lib/constants"

const productLinks = [
 { label: "Reactors", href: ROUTES.PRODUCTS },
 { label: "Transformers", href: ROUTES.PRODUCTS },
 { label: "Chokes", href: ROUTES.PRODUCTS },
 { label: "Inductors", href: ROUTES.PRODUCTS },
]

const supportLinks = [
 { label: "Documentation", href: ROUTES.SUPPORT },
 { label: "Technical Support", href: ROUTES.SUPPORT },
 { label: "Training", href: ROUTES.SUPPORT },
 { label: "Downloads", href: ROUTES.SUPPORT },
]

const companyLinks = [
 { label: "About Us", href: ROUTES.ABOUT },
 { label: "Products", href: ROUTES.PRODUCTS },
 { label: "Contact Us", href: ROUTES.CONTACT },
]

export const Footer = () => {
 return (
  <footer className="bg-primary text-primary-foreground">
   <div className="container-industrial py-12 md:py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
     {/* Company Info */}
     <div className="space-y-4">
      <Link href={ROUTES.HOME} className="flex items-center gap-2">
       <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
        <Zap className="w-5 h-5 text-charcoal" />
       </div>
       <span className="text-lg font-bold">Gauss Electromagnetics</span>
      </Link>
      <p className="text-sm text-primary-foreground/70 leading-relaxed">
       Leading manufacturer of high-precision electrical equipment for
       industrial applications worldwide.
      </p>
      <div className="flex gap-3 pt-2">
       <a
        href="#"
        className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-secondary hover:text-charcoal transition-colors"
       >
        <Linkedin size={18} />
       </a>
       <a
        href="#"
        className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-secondary hover:text-charcoal transition-colors"
       >
        <Twitter size={18} />
       </a>
       <a
        href="#"
        className="w-9 h-9 bg-primary-foreground/10 rounded flex items-center justify-center hover:bg-secondary hover:text-charcoal transition-colors"
       >
        <Youtube size={18} />
       </a>
      </div>
     </div>

     {/* Products */}
     <div>
      <h4 className="font-semibold mb-4">Products</h4>
      <ul className="space-y-3">
       {productLinks.map((link) => (
        <li key={link.label}>
         <Link
          href={link.href}
          className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
         >
          {link.label}
         </Link>
        </li>
       ))}
      </ul>
     </div>

     {/* Support */}
     <div>
      <h4 className="font-semibold mb-4">Support</h4>
      <ul className="space-y-3">
       {supportLinks.map((link) => (
        <li key={link.label}>
         <Link
          href={link.href}
          className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
         >
          {link.label}
         </Link>
        </li>
       ))}
      </ul>
     </div>

     {/* Company */}
     <div>
      <h4 className="font-semibold mb-4">Company</h4>
      <ul className="space-y-3">
       {companyLinks.map((link) => (
        <li key={link.label}>
         <Link
          href={link.href}
          className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
         >
          {link.label}
         </Link>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </div>

   {/* Bottom Bar */}
   <div className="border-t border-primary-foreground/10">
    <div className="container-industrial py-6 flex flex-col md:flex-row justify-between items-center gap-4">
     <p className="text-sm text-primary-foreground/60">
      © 2024 GAUSS ELECTROMAGNETICS. All rights reserved.
     </p>
     <div className="flex gap-6">
      <Link
       href={ROUTES.PRIVACY}
       className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors"
      >
       Privacy Policy
      </Link>
      <Link
       href={ROUTES.TERMS}
       className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors"
      >
       Terms of Service
      </Link>
     </div>
    </div>
   </div>
  </footer>
 )
}
