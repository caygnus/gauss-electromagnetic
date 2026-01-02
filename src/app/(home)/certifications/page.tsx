import Image from "next/image"
import { Check, Award, Shield, FileCheck } from "lucide-react"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"

const certifications = [
 {
  icon: Award,
  title: "ISO 9001:2015",
  subtitle: "Quality Management System",
  description:
   "Certified for maintaining international quality standards in manufacturing processes and customer satisfaction.",
 },
 {
  icon: Shield,
  title: "CE Marking",
  subtitle: "European Conformity",
  description:
   "Products comply with European health, safety, and environmental protection standards.",
 },
 {
  icon: FileCheck,
  title: "BIS Certification",
  subtitle: "Bureau of Indian Standards",
  description:
   "Products meet the quality and safety standards set by the Bureau of Indian Standards.",
 },
]

const achievements = [
 "Over 5000+ successful installations worldwide",
 "Trusted by Fortune 500 companies",
 "Zero defect manufacturing track record",
 "On-time delivery rate of 98%",
 "24/7 technical support availability",
 "Continuous R&D investments",
]

export const metadata = {
 title: "Certifications & Achievements | Gauss Electromagnetics",
 description:
  "Our commitment to quality is validated by international certifications and recognized achievements.",
}

const CertificationsPage = () => {
 return (
  <div className="min-h-screen">
   <Header />
   <main className="pt-20">
    {/* Hero */}
    <section className="py-16 bg-primary">
     <div className="container-industrial text-center text-background">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
       Certifications & Achievements
      </h1>
      <p className="text-background/70 max-w-2xl mx-auto">
       Our commitment to quality is validated by international certifications
       and recognized achievements.
      </p>
     </div>
    </section>

    {/* Certifications Grid */}
    <section className="section-padding bg-background">
     <div className="container-industrial">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
       {certifications.map((cert, index) => {
        const IconComponent = cert.icon
        return (
         <div
          key={index}
          className="p-8 border border-border rounded hover:border-secondary transition-colors"
         >
          <div className="w-16 h-16 bg-primary rounded flex items-center justify-center mb-6">
           <IconComponent size={32} className="text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-1">{cert.title}</h3>
          <p className="text-secondary font-medium mb-4">{cert.subtitle}</p>
          <p className="text-steel leading-relaxed">{cert.description}</p>
         </div>
        )
       })}
      </div>

      {/* ISO Badge Section */}
      <div className="bg-steel-light rounded p-8 md:p-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
         <Image
          src="/assets/iso-badge.jpg"
          alt="ISO Certification Badge"
          width={256}
          height={256}
          className="w-48 h-48 md:w-64 md:h-64 object-contain"
         />
        </div>
        <div>
         <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          Quality Management Excellence
         </h2>
         <p className="text-steel leading-relaxed mb-6">
          Our ISO 9001:2015 certification demonstrates our commitment to
          maintaining the highest standards in quality management. Every product
          we manufacture undergoes rigorous testing and quality checks to ensure
          reliability and performance.
         </p>
         <div className="w-24 h-1 bg-secondary" />
        </div>
       </div>
      </div>
     </div>
    </section>

    {/* Achievements */}
    <section className="section-padding bg-steel-light">
     <div className="container-industrial">
      <h2 className="text-3xl font-bold text-primary text-center mb-12">
       Our Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {achievements.map((achievement, index) => (
        <div
         key={index}
         className="flex items-center gap-4 bg-background p-4 rounded"
        >
         <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
          <Check size={16} className="text-charcoal" />
         </div>
         <span className="text-charcoal font-medium">{achievement}</span>
        </div>
       ))}
      </div>
     </div>
    </section>
   </main>
   <Footer />
  </div>
 )
}

export default CertificationsPage
