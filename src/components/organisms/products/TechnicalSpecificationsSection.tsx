const electricalSpecs = [
 { label: "Rated Voltage", value: "690-1000V AC/DC" },
 { label: "Rated Current", value: "630A - 1600A" },
 { label: "Breaking Capacity", value: "85 kA at 415V" },
 { label: "Poles", value: "3P, 4P" },
 { label: "Trip Class", value: "10, 20, 30" },
]

const physicalSpecs = [
 { label: "Dimensions (WxHxD)", value: "289 x 318 x 180 mm" },
 { label: "Weight", value: "9.8 kg" },
 { label: "Operating Temp", value: "-25°C to 70°C" },
 { label: "IP Rating", value: "IP54 (Standard)" },
 { label: "Mechanical Life", value: "25,000 operations" },
]

export const TechnicalSpecificationsSection = () => {
 return (
  <section id="specifications" className="section-padding bg-steel-light">
   <div className="container-industrial">
    <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
     Technical Specifications
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
     {/* Electrical Characteristics */}
     <div>
      <div className="bg-primary text-background px-6 py-3 rounded-t font-medium">
       Electrical Characteristics
      </div>
      <div className="bg-background border border-t-0 border-border rounded-b overflow-hidden">
       {electricalSpecs.map((spec, index) => (
        <div
         key={index}
         className="flex justify-between px-6 py-4 border-b border-border last:border-b-0"
        >
         <span className="text-steel">{spec.label}</span>
         <span className="font-medium text-charcoal">{spec.value}</span>
        </div>
       ))}
      </div>
     </div>

     {/* Physical & Environmental */}
     <div>
      <div className="bg-secondary text-charcoal px-6 py-3 rounded-t font-medium">
       Physical & Environmental
      </div>
      <div className="bg-background border border-t-0 border-border rounded-b overflow-hidden">
       {physicalSpecs.map((spec, index) => (
        <div
         key={index}
         className="flex justify-between px-6 py-4 border-b border-border last:border-b-0"
        >
         <span className="text-steel">{spec.label}</span>
         <span className="font-medium text-charcoal">{spec.value}</span>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  </section>
 )
}
