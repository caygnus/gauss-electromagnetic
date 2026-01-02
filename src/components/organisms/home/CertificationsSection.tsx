"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export const CertificationsSection = () => {
    return (
        <section className="section-padding bg-background">
            <div className="container-industrial">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                        Certifications & Achievements
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border border-border text-steel hover:border-primary hover:text-primary transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 rounded-full border border-secondary bg-secondary/10 text-secondary hover:bg-secondary hover:text-charcoal transition-colors"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* ISO Badge */}
                    <div className="flex justify-center">
                        <Image
                            src="/assets/iso-badge.jpg"
                            alt="ISO 9001:2015 Certification"
                            width={256}
                            height={256}
                            className="w-48 h-48 md:w-64 md:h-64 object-contain"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <span className="text-secondary font-medium">
                            Prominent
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-primary mt-2 mb-4">
                            ISO 9001: Quality Management Certification
                        </h3>
                        <p className="text-steel leading-relaxed">
                            For meeting global standards in quality control,
                            efficient processes, customer satisfaction, and
                            continuous improvement.
                        </p>
                        <div className="w-24 h-1 bg-secondary mt-6" />
                    </div>
                </div>
            </div>
        </section>
    )
}
