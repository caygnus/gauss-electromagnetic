"use client"

import { FileText, BookOpen, PenTool, Download } from "lucide-react"

const documents = [
 {
  icon: FileText,
  title: "Product Datasheet",
  description: "Complete technical specifications",
  size: "PDF - 2.4 MB",
 },
 {
  icon: BookOpen,
  title: "Installation Manual",
  description: "Step-by-step installation guide",
  size: "PDF - 5.8 MB",
 },
 {
  icon: PenTool,
  title: "Technical Drawing",
  description: "CAD files and dimensions",
  size: "DWG - 1.2 MB",
 },
]

export const DocumentationSection = () => {
 return (
  <section id="documentation" className="section-padding bg-background">
   <div className="container-industrial">
    <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
     Documentation
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
     {documents.map((doc, index) => {
      const IconComponent = doc.icon
      return (
       <div
        key={index}
        className="p-6 border border-border rounded hover:border-secondary transition-colors text-center"
       >
        <div className="w-14 h-14 bg-secondary/10 rounded flex items-center justify-center mx-auto mb-4">
         <IconComponent size={28} className="text-secondary" />
        </div>
        <h3 className="font-semibold text-primary mb-1">{doc.title}</h3>
        <p className="text-sm text-steel mb-2">{doc.description}</p>
        <p className="text-xs text-steel/60 mb-4">{doc.size}</p>
        <button className="inline-flex items-center gap-2 text-secondary font-medium text-sm hover:underline">
         <Download size={14} />
         Download
        </button>
       </div>
      )
     })}
    </div>
   </div>
  </section>
 )
}
