"use server"

import { sendContactEnquiry } from "@/lib/services"
import type { ContactFormData } from "@/types"

export interface SubmitContactFormResult {
    success: boolean
    message?: string
    error?: string
}

/**
 * Server action to submit contact form
 * @param data - Contact form data
 * @returns Result object with success status and message/error
 */
export async function submitContactForm(
    data: ContactFormData
): Promise<SubmitContactFormResult> {
    try {
        // Validate required fields
        if (!data.name || !data.email || !data.phone) {
            return {
                success: false,
                error: "Name, email, and phone are required fields",
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
            return {
                success: false,
                error: "Please provide a valid email address",
            }
        }

        // Send email via email service - object response: { data, error }
        const { data: emailData, error } = await sendContactEnquiry(data)

        if (error) {
            return {
                success: false,
                error:
                    error || "Failed to send enquiry. Please try again later.",
            }
        }

        return {
            success: true,
            message: "Thank you for your enquiry! We'll get back to you soon.",
        }
    } catch (error) {
        console.error("Error in submitContactForm:", error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred. Please try again later.",
        }
    }
}
