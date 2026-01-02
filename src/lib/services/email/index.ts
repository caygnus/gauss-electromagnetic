/**
 * Email Module Index
 *
 * Central export point for all email-related services
 */

// Resend client
export { resendClient, ResendClient } from "./resend"

// Template service
export { renderTemplate } from "./template.service"

// Contact email service
export {
    sendContactEnquiry,
    type EmailResult,
    type EmailSuccess,
} from "./contact.service"
