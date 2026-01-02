import { Shield } from "lucide-react"

const certifications = [
 { name: "ISO 9001:2015", label: "Quality" },
 { name: "CE Certified", label: "European" },
 { name: "IEC 60947", label: "Standard" },
 { name: "RoHS Compliant", label: "Environmental" },
 { name: "UL 489", label: "Safety" },
]

export const CertificationsStandardsSection = () => {
 return (
  <section id="certifications" className="section-padding bg-steel-light">
   <div className="container-industrial">
    <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-4">
     Certifications & Standards
    </h2>
    <p className="text-steel text-center mb-12">
     Globally recognized and certified for industrial applications
    </p>

    <div className="flex flex-wrap justify-center gap-6">
     {certifications.map((cert, index) => (
      <div
       key={index}
       className="w-28 h-28 bg-background border border-border rounded flex flex-col items-center justify-center p-4 hover:border-secondary transition-colors"
      >
       <Shield size={32} className="text-primary mb-2" />
       <span className="text-xs font-medium text-primary text-center">
        {cert.name}
       </span>
      </div>
     ))}
    </div>
   </div>
  </section>
 )
}
