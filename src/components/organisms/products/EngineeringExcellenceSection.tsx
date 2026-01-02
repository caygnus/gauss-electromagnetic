import { Check } from "lucide-react"

const benefits = [
 "Voltage stabilization and power quality improvement",
 "Harmonic control and filtering",
 "Power flow management and optimization",
 "Enhanced system reliability and protection",
]

export const EngineeringExcellenceSection = () => {
 return (
  <section className="section-padding bg-background">
   <div className="container-industrial">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
     {/* Left Content */}
     <div>
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
       Engineering Excellence in Power Control
      </h2>
      <div className="space-y-4 text-steel leading-relaxed">
       <p>
        GAUSS TECH reactors are engineered to deliver superior performance in
        power systems, ensuring optimal voltage regulation, harmonic mitigation,
        and enhanced grid stability. Our reactors are designed with precision to
        meet the demanding requirements of modern industrial applications.
       </p>
       <p>
        Built with high-grade materials and advanced manufacturing processes,
        our reactor solutions provide reliable operation under the most
        challenging conditions. From power factor correction to current
        limiting, our comprehensive range addresses every power quality
        challenge.
       </p>
      </div>
     </div>

     {/* Right Content - Benefits */}
     <div className="bg-steel-light rounded p-8">
      <h3 className="text-lg font-semibold text-primary mb-6">Key Benefits</h3>
      <ul className="space-y-4">
       {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-3">
         <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <Check size={12} className="text-charcoal" />
         </div>
         <span className="text-steel">{benefit}</span>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </div>
  </section>
 )
}
