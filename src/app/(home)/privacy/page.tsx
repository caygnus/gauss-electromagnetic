import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"

export const metadata = {
 title: "Privacy Policy | Gauss Electromagnetics",
 description:
  "Privacy policy and data protection information for Gauss Electromagnetics.",
}

const PrivacyPage = () => {
 return (
  <div className="min-h-screen">
   <Header />
   <main className="pt-20">
    {/* Hero */}
    <section className="py-16 bg-primary">
     <div className="container-industrial text-center text-background">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-background/70 max-w-2xl mx-auto">
       Your privacy is important to us. This policy explains how we collect,
       use, and protect your information.
      </p>
     </div>
    </section>

    {/* Content */}
    <section className="section-padding bg-background">
     <div className="container-industrial max-w-4xl">
      <div className="prose prose-lg max-w-none">
       <div className="space-y-6 text-steel">
        <div>
         <h2 className="text-2xl font-bold text-primary mb-4">
          Information We Collect
         </h2>
         <p>
          We collect information that you provide directly to us when you
          contact us, request a quote, or use our services. This may include
          your name, email address, phone number, company name, and any other
          information you choose to provide.
         </p>
        </div>

        <div>
         <h2 className="text-2xl font-bold text-primary mb-4">
          How We Use Your Information
         </h2>
         <p>
          We use the information we collect to respond to your inquiries,
          provide technical support, process orders, and improve our services.
          We do not sell or share your personal information with third parties
          for marketing purposes.
         </p>
        </div>

        <div>
         <h2 className="text-2xl font-bold text-primary mb-4">Data Security</h2>
         <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction.
         </p>
        </div>

        <div>
         <h2 className="text-2xl font-bold text-primary mb-4">Contact Us</h2>
         <p>
          If you have any questions about this Privacy Policy, please contact us
          through our contact page.
         </p>
        </div>

        <div className="pt-4 border-t border-border">
         <p className="text-sm text-steel/60">
          Last updated: {new Date().getFullYear()}
         </p>
        </div>
       </div>
      </div>
     </div>
    </section>
   </main>
   <Footer />
  </div>
 )
}

export default PrivacyPage
