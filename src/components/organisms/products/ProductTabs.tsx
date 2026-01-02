"use client"

import { cn } from "@/lib/utils"

const tabs = [
 { id: "overview", label: "Overview" },
 { id: "specifications", label: "Specifications" },
 { id: "documentation", label: "Documentation" },
 { id: "certifications", label: "Certifications" },
 { id: "downloads", label: "Downloads" },
]

interface ProductTabsProps {
 activeTab: string
 onTabChange: (tabId: string) => void
}

export const ProductTabs = ({ activeTab, onTabChange }: ProductTabsProps) => {
 return (
  <div className="border-b border-border bg-background sticky top-20 z-40">
   <div className="container-industrial">
    <div className="flex gap-8 overflow-x-auto">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       onClick={() => onTabChange(tab.id)}
       className={cn(
        "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
        activeTab === tab.id
         ? "border-secondary text-primary"
         : "border-transparent text-steel hover:text-primary"
       )}
      >
       {tab.label}
      </button>
     ))}
    </div>
   </div>
  </div>
 )
}
