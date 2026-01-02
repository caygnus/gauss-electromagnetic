"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ASSETS, ROUTES } from "@/lib/constants"

const categories = ["Custom", "Reactors", "Transformers", "Chokes", "Inductors"]

const products = {
 Reactors: {
  image: ASSETS.REACTOR_PRODUCT,
  title: "Reactors",
  description: "High-precision reactors designed for power stability",
 },
 Transformers: {
  image: ASSETS.TRANSFORMER_PRODUCT,
  title: "Transformers",
  description: "We can build the perfect solution for your needs",
 },
 Custom: {
  image: ASSETS.FACTORY_FLOOR,
  title: "Custom Solutions",
  description: "Tailored engineering for your requirement",
 },
 Chokes: {
  image: ASSETS.REACTOR_PRODUCT,
  title: "VFD Chokes",
  description: "High-performance chokes for variable frequency drives",
 },
 Inductors: {
  image: ASSETS.TRANSFORMER_PRODUCT,
  title: "Inductors",
  description: "Precision inductors for power electronics",
 },
}

export const CompanyIntroSection = () => {
 const [activeCategory, setActiveCategory] = useState("Reactors")

 return (
  <section className="section-padding bg-background">
   <div className="container-industrial">
    {/* Heading */}
    <div className="text-center mb-12">
     <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 uppercase tracking-wide">
      A Leading Indian Manufacturer in Power
      <br />
      Quality & Electrical Solutions
     </h2>
     <p className="text-steel max-w-2xl mx-auto">
      Empowering industries with reliable, efficient and long-lasting electrical
      products engineered for high performance.
     </p>
    </div>

    {/* Category Tabs */}
    <div className="flex flex-wrap justify-center gap-2 md:gap-6 mb-12">
     {categories.map((category) => (
      <button
       key={category}
       onClick={() => setActiveCategory(category)}
       className={`px-4 py-2 text-sm md:text-base font-medium transition-colors ${
        activeCategory === category
         ? "text-primary border-b-2 border-secondary"
         : "text-steel hover:text-primary"
       }`}
      >
       {category}
      </button>
     ))}
    </div>

    {/* Product Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {Object.entries(products)
      .slice(0, 3)
      .map(([key, product]) => (
       <Link
        key={key}
        href={ROUTES.PRODUCTS}
        className="group relative overflow-hidden aspect-[4/3] rounded"
       >
        <Image
         src={product.image}
         alt={product.title}
         fill
         className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
         <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
         <p className="text-sm text-background/70">{product.description}</p>
        </div>
       </Link>
      ))}
    </div>
   </div>
  </section>
 )
}
