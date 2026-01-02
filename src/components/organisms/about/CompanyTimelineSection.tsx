"use client"

import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const milestones = [
 {
  year: "1994",
  title: "Establishment of Gauss Electromagnetics, Nashik",
  description:
   "The beginning of our journey in engineering reliable electrical power solutions built on decades of expertise, technical precision, and a commitment to improving our products to meet evolving industrial demands.",
 },
 {
  year: "1995",
  title: "First full-scale production facility becomes operational",
  description:
   "Starts supplying reactors and custom-built electrical components to regional OEMs and factories.",
 },
 {
  year: "2000",
  title: "Expansion into harmonic-filter reactors & APFC solutions",
  description:
   "Introduces new product lines to support rapidly growing industrial power-quality needs.",
 },
]

export const CompanyTimelineSection = () => {
 return (
  <section className="section-padding bg-steel-light">
   <div className="container-industrial">
    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-12">
     Company history & Milestone Timeline
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
     {/* Left - Milestones */}
     <div className="space-y-8">
      {milestones.map((milestone, index) => (
       <div key={index} className="border-l-2 border-primary pl-6 pb-6">
        <h3 className="font-semibold text-primary mb-2">{milestone.title}</h3>
        <p className="text-sm text-steel leading-relaxed">
         {milestone.description}
        </p>
       </div>
      ))}

      <Button
       variant="ghost"
       className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
      >
       <ArrowDown size={16} />
       Continue
      </Button>
     </div>

     {/* Right - Large Years */}
     <div className="flex flex-col justify-center items-center lg:items-end">
      <div className="text-[8rem] md:text-[12rem] font-bold text-primary leading-none">
       1994
      </div>
      <div className="text-[6rem] md:text-[8rem] font-bold text-steel/30 leading-none -mt-8">
       1995
      </div>
     </div>
    </div>
   </div>
  </section>
 )
}
