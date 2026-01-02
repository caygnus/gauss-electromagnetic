/**
 * Contact Email Service
 *
 * Service for sending contact-related emails
 * Uses generic Result type for consistent error handling
 */

import { resendClient } from "./resend"
import { renderTemplate } from "./template.service"
import { env } from "../env.service"
import type { ContactFormData, Result } from "@/types"
import { success, failure } from "@/types"

/**
 * Email success data
 */
export interface EmailSuccess {
    message: string
    emailId?: string
}

/**
 * Email result type using generic Result
 */
export type EmailResult = Result<EmailSuccess, string>

/**
 * Format product interest for display
 */
function formatProductInterest(
    productInterest: ContactFormData["productInterest"]
): string {
    const productInterestMap: Record<string, string> = {
        reactors: "Reactors",
        transformers: "Transformers",
        chokes: "VFD Chokes",
        inductors: "Inductors",
        custom: "Custom Solution",
    }

    return productInterestMap[productInterest] || productInterest
}

/**
 * Convert plain text message to HTML with line breaks
 */
function formatMessageForHTML(message: string): string {
    return message.replace(/\n/g, "<br>")
}

/**
 * Send contact form enquiry email to admin
 * @param data - Contact form data
 * @returns Result object { data, error }
 */
export async function sendContactEnquiry(
    data: ContactFormData
): Promise<EmailResult> {
    // Validate client
    const client = resendClient.getClient()
    if (!client) {
        return failure(
            "Email service is not configured. Please check RESEND_API_KEY."
        )
    }

    // Validate environment variables
    const fromAddress = env.getResendFromAddress()
    if (!fromAddress) {
        return failure("RESEND_FROM_ADDRESS is not set")
    }

    const adminEmail = env.getAdminEmail()
    if (!adminEmail) {
        return failure("ADMIN_EMAIL is not set")
    }

    try {
        // Prepare data for template
        const templateData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company || undefined,
            productInterestLabel: formatProductInterest(data.productInterest),
            message: data.message
                ? formatMessageForHTML(data.message)
                : undefined,
        }

        // Render templates
        const htmlContent = renderTemplate(
            "contact-enquiry",
            templateData,
            "html"
        )
        const textContent = renderTemplate(
            "contact-enquiry",
            templateData,
            "text"
        )

        // Send email
        const result = await client.emails.send({
            from: fromAddress,
            to: adminEmail,
            subject: `New Contact Enquiry - ${data.name}`,
            html: htmlContent,
            text: textContent,
        })

        if (result.error) {
            return failure(result.error.message || "Failed to send email")
        }

        return success({
            message: "Email sent successfully",
            emailId: result.data?.id,
        })
    } catch (error) {
        console.error("Error sending contact enquiry email:", error)
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred while sending email"
        return failure(errorMessage)
    }
}
