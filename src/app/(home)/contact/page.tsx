"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Phone, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layouts"
import { Footer } from "@/components/layouts"
import { ASSETS } from "@/lib/constants"
import { submitContactForm } from "./actions"
import { toast } from "react-hot-toast"
import type { ContactFormData } from "@/types"

const ContactPage = () => {
 const [formData, setFormData] = useState<ContactFormData>({
  name: "",
  email: "",
  phone: "",
  company: "",
  productInterest: "reactors",
  message: "",
 })
 const [isSubmitting, setIsSubmitting] = useState(false)

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  setIsSubmitting(true)

  try {
   const result = await submitContactForm(formData)

   if (result.success) {
    toast.success(
     result.message || "Thank you for your enquiry! We'll get back to you soon."
    )
    // Reset form after successful submission
    setFormData({
     name: "",
     email: "",
     phone: "",
     company: "",
     productInterest: "reactors",
     message: "",
    })
   } else {
    toast.error(result.error || "Failed to submit enquiry. Please try again.")
   }
  } catch (error) {
   console.error("Error submitting form:", error)
   toast.error("An unexpected error occurred. Please try again later.")
  } finally {
   setIsSubmitting(false)
  }
 }

 const handleChange = (
  e: React.ChangeEvent<
   HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
 ) => {
  const { name, value } = e.target
  setFormData((prev) => ({ ...prev, [name]: value }))
 }

 return (
  <div className="min-h-screen">
   <Header />
   <main className="pt-20">
    {/* Hero with Background */}
    <section className="relative py-24 md:py-32">
     <div className="absolute inset-0">
      <Image
       src={ASSETS.CONTACT_HERO_BG}
       alt="Contact Hero Background"
       fill
       className="object-cover"
       priority
      />
     </div>
     <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/40" />

     <div className="relative container-industrial">
      <h1 className="text-4xl md:text-5xl font-bold text-background mb-4">
       Contact Our Experts
      </h1>
      <p className="text-xl text-secondary-white max-w-2xl">
       High-precision support, global reach. Let's power your Project together
      </p>
     </div>
    </section>

    {/* Contact Form Section */}
    <section className="section-padding bg-background">
     <div className="container-industrial">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
       {/* Left - Info */}
       <div>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
         Ready to Power Your
         <br />
         Project?
        </h2>
        <p className="text-steel mb-8">
         Get in touch with our technical team for customized solutions and
         expert consultation.
        </p>

        <div className="flex flex-wrap gap-6">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
           <Phone size={18} className="text-charcoal" />
          </div>
          <div>
           <p className="text-xs text-steel">Call Us</p>
           <p className="font-medium text-primary">+91 XXX XXX XXXX</p>
          </div>
         </div>

         <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
           <Mail size={18} className="text-charcoal" />
          </div>
          <div>
           <p className="text-xs text-steel">Email Us</p>
           <p className="font-medium text-primary">info@caygnus.com</p>
          </div>
         </div>
        </div>
       </div>

       {/* Right - Form Card */}
       <div className="bg-primary p-8 rounded shadow-lg">
        <h3 className="text-xl font-semibold text-background mb-6">
         Quick Enquiry
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
         <div>
          <label
           htmlFor="name"
           className="block text-sm text-background/70 mb-2"
          >
           Full Name *
          </label>
          <input
           type="text"
           id="name"
           name="name"
           value={formData.name}
           onChange={handleChange}
           required
           disabled={isSubmitting}
           className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
           placeholder="John Doe"
          />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
           <label
            htmlFor="email"
            className="block text-sm text-background/70 mb-2"
           >
            Email *
           </label>
           <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="john@company.com"
           />
          </div>
          <div>
           <label
            htmlFor="phone"
            className="block text-sm text-background/70 mb-2"
           >
            Phone *
           </label>
           <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="+91 XXXXX XXXXX"
           />
          </div>
         </div>

         <div>
          <label
           htmlFor="company"
           className="block text-sm text-background/70 mb-2"
          >
           Company name
          </label>
          <input
           type="text"
           id="company"
           name="company"
           value={formData.company}
           onChange={handleChange}
           disabled={isSubmitting}
           className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
           placeholder="Your company name"
          />
         </div>

         <div>
          <label
           htmlFor="productInterest"
           className="block text-sm text-background/70 mb-2"
          >
           Product Interest
          </label>
          <select
           id="productInterest"
           name="productInterest"
           value={formData.productInterest}
           onChange={handleChange}
           disabled={isSubmitting}
           className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
           <option value="reactors">Reactors</option>
           <option value="transformers">Transformers</option>
           <option value="chokes">VFD Chokes</option>
           <option value="inductors">Inductors</option>
           <option value="custom">Custom Solution</option>
          </select>
         </div>

         <div>
          <label
           htmlFor="message"
           className="block text-sm text-background/70 mb-2"
          >
           Message
          </label>
          <textarea
           id="message"
           name="message"
           rows={4}
           value={formData.message}
           onChange={handleChange}
           disabled={isSubmitting}
           className="w-full px-4 py-3 rounded bg-background border border-border focus:outline-none focus:border-secondary resize-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
           placeholder="Tell us about your requirements..."
          />
         </div>

         <Button
          variant="industrial"
          size="lg"
          className="w-full"
          type="submit"
          disabled={isSubmitting}
         >
          {isSubmitting ? (
           <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Submitting...
           </>
          ) : (
           <>
            Submit Enquiry
            <ArrowRight size={18} />
           </>
          )}
         </Button>
        </form>
       </div>
      </div>
     </div>
    </section>
   </main>
   <Footer />
  </div>
 )
}

export default ContactPage
