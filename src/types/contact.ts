/**
 * Contact Form Types
 *
 * Type definitions for contact form data
 */

export interface ContactFormData {
    name: string
    email: string
    phone: string
    company?: string
    productInterest:
        | "reactors"
        | "transformers"
        | "chokes"
        | "inductors"
        | "custom"
    message?: string
}
